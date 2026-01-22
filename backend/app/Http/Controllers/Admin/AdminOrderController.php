<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\Refund;
use App\Notifications\OrderStatusUpdated;
use App\Services\PaystackService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AdminOrderController extends Controller
{
    /**
     * Display a listing of orders.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Order::with(['user', 'items']);

        // Search by order number or customer
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'LIKE', "%{$search}%")
                  ->orWhere('billing_email', 'LIKE', "%{$search}%")
                  ->orWhere('billing_first_name', 'LIKE', "%{$search}%")
                  ->orWhere('billing_last_name', 'LIKE', "%{$search}%")
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('email', 'LIKE', "%{$search}%")
                        ->orWhere('first_name', 'LIKE', "%{$search}%")
                        ->orWhere('last_name', 'LIKE', "%{$search}%");
                  });
            });
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by payment status
        if ($request->has('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }

        // Filter by date range
        if ($request->has('from_date')) {
            $query->where('created_at', '>=', $request->from_date);
        }
        if ($request->has('to_date')) {
            $query->where('created_at', '<=', $request->to_date);
        }

        // Filter by customer
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $perPage = min($request->get('per_page', 15), 100);

        return OrderResource::collection($query->paginate($perPage));
    }

    /**
     * Display the specified order.
     */
    public function show(Order $order): JsonResponse
    {
        $order->load(['user', 'items.product.images', 'payments', 'refunds']);

        return response()->json([
            'order' => new OrderResource($order),
        ]);
    }

    /**
     * Update the specified order.
     */
    public function update(Request $request, Order $order): JsonResponse
    {
        $request->validate([
            'admin_notes' => ['nullable', 'string', 'max:1000'],
            'tracking_number' => ['nullable', 'string', 'max:100'],
            'shipping_method' => ['nullable', 'string', 'max:100'],
        ]);

        $order->update($request->only([
            'admin_notes',
            'tracking_number',
            'shipping_method',
        ]));

        return response()->json([
            'message' => 'Order updated successfully.',
            'order' => new OrderResource($order),
        ]);
    }

    /**
     * Update order status.
     */
    public function updateStatus(Request $request, Order $order): JsonResponse
    {
        $request->validate([
            'status' => ['required', 'in:' . implode(',', array_keys(Order::getStatuses()))],
            'notify_customer' => ['nullable', 'boolean'],
            'reason' => ['nullable', 'string', 'max:500'],
            'tracking_number' => ['nullable', 'string', 'max:100'],
        ]);

        $newStatus = $request->status;
        $oldStatus = $order->status;

        // Validate status transition
        $availableTransitions = $order->getAvailableStatusTransitions();
        if (!in_array($newStatus, $availableTransitions) && $oldStatus !== $newStatus) {
            return response()->json([
                'message' => "Cannot transition from '{$oldStatus}' to '{$newStatus}'.",
                'available_transitions' => $availableTransitions,
            ], 400);
        }

        // Update tracking number if provided (for shipped status)
        if ($request->tracking_number) {
            $order->tracking_number = $request->tracking_number;
        }

        // Update status
        $order->updateStatus($newStatus, $request->reason);

        // Restore stock if cancelled
        if ($newStatus === Order::STATUS_CANCELLED) {
            $order->restoreStock();
        }

        // Notify customer if requested
        if ($request->boolean('notify_customer', true)) {
            $order->user->notify(new OrderStatusUpdated($order, $oldStatus));
        }

        $order->load(['user', 'items']);

        return response()->json([
            'message' => 'Order status updated successfully.',
            'order' => new OrderResource($order),
        ]);
    }

    /**
     * Process refund for an order.
     */
    public function refund(Request $request, Order $order): JsonResponse
    {
        $request->validate([
            'amount' => ['required', 'numeric', 'min:0.01'],
            'reason' => ['required', 'string', 'max:500'],
        ]);

        // Check if order can be refunded
        if (!$order->canBeRefunded()) {
            return response()->json([
                'message' => 'This order cannot be refunded.',
            ], 400);
        }

        $payment = $order->successfulPayment;
        if (!$payment) {
            return response()->json([
                'message' => 'No successful payment found for this order.',
            ], 400);
        }

        // Check refundable amount
        if ($request->amount > $payment->refundable_amount) {
            return response()->json([
                'message' => "Maximum refundable amount is {$payment->refundable_amount}.",
            ], 400);
        }

        // Create refund record
        $refund = Refund::create([
            'payment_id' => $payment->id,
            'order_id' => $order->id,
            'amount' => $request->amount,
            'currency' => $order->currency,
            'status' => Refund::STATUS_PENDING,
            'reason' => $request->reason,
            'processed_by' => auth()->id(),
        ]);

        // Process refund via Paystack
        try {
            $paystackService = app(PaystackService::class);

            $response = $paystackService->createRefund([
                'transaction' => $payment->gateway_reference,
                'amount' => $request->amount * 100, // Convert to kobo
            ]);

            if ($response['status']) {
                $refund->markAsSuccessful($response['data']['id'] ?? null);
                $payment->processRefund($request->amount, $request->reason);

                // Update order status if fully refunded
                if ($payment->status === 'refunded') {
                    $order->update([
                        'status' => Order::STATUS_REFUNDED,
                        'payment_status' => Order::PAYMENT_REFUNDED,
                    ]);
                } else {
                    $order->update([
                        'payment_status' => Order::PAYMENT_PARTIALLY_REFUNDED,
                    ]);
                }

                return response()->json([
                    'message' => 'Refund processed successfully.',
                    'refund' => $refund,
                ]);
            }

            $refund->markAsFailed();

            return response()->json([
                'message' => 'Refund failed: ' . ($response['message'] ?? 'Unknown error'),
            ], 400);

        } catch (\Exception $e) {
            $refund->markAsFailed();

            return response()->json([
                'message' => 'Failed to process refund. Please try again.',
            ], 500);
        }
    }
}
