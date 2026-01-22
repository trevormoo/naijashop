<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class OrderController extends Controller
{
    /**
     * Display a listing of user's orders.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = auth()->user()->orders()->with(['items']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by payment status
        if ($request->has('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }

        // Date range filter
        if ($request->has('from_date')) {
            $query->where('created_at', '>=', $request->from_date);
        }
        if ($request->has('to_date')) {
            $query->where('created_at', '<=', $request->to_date);
        }

        $orders = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 10));

        return OrderResource::collection($orders);
    }

    /**
     * Display the specified order.
     */
    public function show(Order $order): JsonResponse
    {
        // Ensure user owns this order
        if ($order->user_id !== auth()->id()) {
            return response()->json([
                'message' => 'Order not found.',
            ], 404);
        }

        $order->load(['items.product.images', 'payments']);

        return response()->json([
            'order' => new OrderResource($order),
        ]);
    }

    /**
     * Cancel an order.
     */
    public function cancel(Request $request, Order $order): JsonResponse
    {
        // Ensure user owns this order
        if ($order->user_id !== auth()->id()) {
            return response()->json([
                'message' => 'Order not found.',
            ], 404);
        }

        // Check if order can be cancelled
        if (!$order->canBeCancelled()) {
            return response()->json([
                'message' => 'This order cannot be cancelled.',
            ], 400);
        }

        $request->validate([
            'reason' => ['nullable', 'string', 'max:500'],
        ]);

        // Update order status
        $order->updateStatus(Order::STATUS_CANCELLED, $request->reason);

        // Restore stock
        $order->restoreStock();

        // Update payment status if paid
        if ($order->isPaid()) {
            $order->update(['payment_status' => Order::PAYMENT_REFUNDED]);
            // TODO: Trigger refund process
        }

        $order->load('items');

        return response()->json([
            'message' => 'Order cancelled successfully.',
            'order' => new OrderResource($order),
        ]);
    }

    /**
     * Generate and download invoice.
     */
    public function invoice(Order $order)
    {
        // Ensure user owns this order
        if ($order->user_id !== auth()->id() && !auth()->user()->isAdmin()) {
            return response()->json([
                'message' => 'Order not found.',
            ], 404);
        }

        $order->load(['items', 'user']);

        $pdf = Pdf::loadView('invoices.order', [
            'order' => $order,
        ]);

        return $pdf->download("invoice-{$order->order_number}.pdf");
    }

    /**
     * Track order status.
     */
    public function track(Order $order): JsonResponse
    {
        // Ensure user owns this order
        if ($order->user_id !== auth()->id()) {
            return response()->json([
                'message' => 'Order not found.',
            ], 404);
        }

        $timeline = $this->getOrderTimeline($order);

        return response()->json([
            'order_number' => $order->order_number,
            'status' => $order->status,
            'payment_status' => $order->payment_status,
            'tracking_number' => $order->tracking_number,
            'timeline' => $timeline,
        ]);
    }

    /**
     * Generate order timeline.
     */
    private function getOrderTimeline(Order $order): array
    {
        $timeline = [];

        // Order placed
        $timeline[] = [
            'status' => 'placed',
            'label' => 'Order Placed',
            'date' => $order->created_at->toISOString(),
            'completed' => true,
        ];

        // Payment
        $timeline[] = [
            'status' => 'payment',
            'label' => 'Payment ' . ($order->isPaid() ? 'Received' : 'Pending'),
            'date' => $order->isPaid() ? $order->payments->first()?->paid_at?->toISOString() : null,
            'completed' => $order->isPaid(),
        ];

        // Processing
        $isProcessing = in_array($order->status, ['confirmed', 'processing', 'shipped', 'delivered']);
        $timeline[] = [
            'status' => 'processing',
            'label' => 'Processing',
            'date' => $isProcessing ? $order->updated_at->toISOString() : null,
            'completed' => $isProcessing,
        ];

        // Shipped
        $isShipped = in_array($order->status, ['shipped', 'delivered']);
        $timeline[] = [
            'status' => 'shipped',
            'label' => 'Shipped',
            'date' => $order->shipped_at?->toISOString(),
            'completed' => $isShipped,
        ];

        // Delivered
        $timeline[] = [
            'status' => 'delivered',
            'label' => 'Delivered',
            'date' => $order->delivered_at?->toISOString(),
            'completed' => $order->status === 'delivered',
        ];

        return $timeline;
    }
}
