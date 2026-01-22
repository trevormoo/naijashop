<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PaymentResource;
use App\Models\Order;
use App\Models\Payment;
use App\Notifications\OrderConfirmation;
use App\Services\PaystackService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    protected PaystackService $paystackService;

    public function __construct(PaystackService $paystackService)
    {
        $this->paystackService = $paystackService;
    }

    /**
     * Initialize payment for an order.
     */
    public function initialize(Request $request): JsonResponse
    {
        $request->validate([
            'order_id' => ['required', 'exists:orders,id'],
        ]);

        $order = Order::findOrFail($request->order_id);

        // Ensure user owns this order
        if ($order->user_id !== auth()->id()) {
            return response()->json([
                'message' => 'Order not found.',
            ], 404);
        }

        // Check if order is already paid
        if ($order->isPaid()) {
            return response()->json([
                'message' => 'This order has already been paid.',
            ], 400);
        }

        // Check if order is cancelled
        if ($order->status === Order::STATUS_CANCELLED) {
            return response()->json([
                'message' => 'Cannot pay for a cancelled order.',
            ], 400);
        }

        // Create payment record
        $payment = Payment::create([
            'order_id' => $order->id,
            'user_id' => auth()->id(),
            'amount' => $order->total,
            'currency' => $order->currency,
            'gateway' => 'paystack',
            'status' => Payment::STATUS_PENDING,
        ]);

        try {
            // Initialize Paystack transaction
            $response = $this->paystackService->initializeTransaction([
                'email' => $order->billing_email,
                'amount' => $order->total * 100, // Paystack uses kobo (smallest unit)
                'reference' => $payment->payment_reference,
                'callback_url' => config('app.url') . '/api/payments/callback',
                'metadata' => [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'payment_id' => $payment->id,
                ],
            ]);

            if ($response['status']) {
                $payment->update([
                    'gateway_reference' => $response['data']['reference'] ?? null,
                ]);

                return response()->json([
                    'message' => 'Payment initialized successfully.',
                    'authorization_url' => $response['data']['authorization_url'],
                    'access_code' => $response['data']['access_code'],
                    'reference' => $response['data']['reference'],
                ]);
            }

            $payment->markAsFailed($response['message'] ?? 'Failed to initialize payment');

            return response()->json([
                'message' => 'Failed to initialize payment.',
                'error' => $response['message'] ?? null,
            ], 400);

        } catch (\Exception $e) {
            Log::error('Payment initialization failed', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
            ]);

            $payment->markAsFailed($e->getMessage());

            return response()->json([
                'message' => 'Failed to initialize payment. Please try again.',
            ], 500);
        }
    }

    /**
     * Verify payment after callback.
     */
    public function verify(string $reference): JsonResponse
    {
        $payment = Payment::where('payment_reference', $reference)->first();

        if (!$payment) {
            return response()->json([
                'message' => 'Payment not found.',
            ], 404);
        }

        // If already verified
        if ($payment->isSuccessful()) {
            return response()->json([
                'message' => 'Payment already verified.',
                'payment' => new PaymentResource($payment),
            ]);
        }

        try {
            $response = $this->paystackService->verifyTransaction($reference);

            if ($response['status'] && $response['data']['status'] === 'success') {
                $data = $response['data'];

                // Update payment record
                $payment->markAsSuccessful([
                    'gateway_reference' => $data['reference'],
                    'authorization_code' => $data['authorization']['authorization_code'] ?? null,
                    'payment_method' => $data['channel'] ?? null,
                    'card_type' => $data['authorization']['card_type'] ?? null,
                    'card_last_four' => $data['authorization']['last4'] ?? null,
                    'bank_name' => $data['authorization']['bank'] ?? null,
                    'gateway_response' => $data['gateway_response'] ?? null,
                    'metadata' => $data,
                ]);

                // Update order status
                $payment->order->markAsPaid();

                // Send order confirmation email
                $payment->user->notify(new OrderConfirmation($payment->order));

                return response()->json([
                    'message' => 'Payment verified successfully.',
                    'payment' => new PaymentResource($payment->fresh()),
                ]);
            }

            $payment->markAsFailed($response['data']['gateway_response'] ?? 'Payment verification failed');

            return response()->json([
                'message' => 'Payment verification failed.',
                'error' => $response['data']['gateway_response'] ?? null,
            ], 400);

        } catch (\Exception $e) {
            Log::error('Payment verification failed', [
                'reference' => $reference,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to verify payment. Please try again.',
            ], 500);
        }
    }

    /**
     * Handle Paystack callback.
     */
    public function callback(Request $request): JsonResponse
    {
        $reference = $request->get('reference');

        if (!$reference) {
            return response()->json([
                'message' => 'Invalid callback request.',
            ], 400);
        }

        return $this->verify($reference);
    }

    /**
     * Handle Paystack webhook.
     */
    public function webhook(Request $request): JsonResponse
    {
        // Verify webhook signature
        $signature = $request->header('X-Paystack-Signature');
        $computedSignature = hash_hmac('sha512', $request->getContent(), config('paystack.secret_key'));

        if ($signature !== $computedSignature) {
            Log::warning('Invalid Paystack webhook signature');
            return response()->json(['message' => 'Invalid signature'], 400);
        }

        $payload = $request->all();
        $event = $payload['event'] ?? null;
        $data = $payload['data'] ?? [];

        Log::info('Paystack webhook received', ['event' => $event]);

        switch ($event) {
            case 'charge.success':
                $this->handleChargeSuccess($data);
                break;

            case 'charge.failed':
                $this->handleChargeFailed($data);
                break;

            case 'refund.processed':
                $this->handleRefundProcessed($data);
                break;

            default:
                Log::info('Unhandled Paystack webhook event', ['event' => $event]);
        }

        return response()->json(['message' => 'Webhook processed']);
    }

    /**
     * Handle successful charge webhook.
     */
    private function handleChargeSuccess(array $data): void
    {
        $reference = $data['reference'] ?? null;
        if (!$reference) return;

        $payment = Payment::where('payment_reference', $reference)->first();
        if (!$payment || $payment->isSuccessful()) return;

        $payment->markAsSuccessful([
            'gateway_reference' => $data['reference'],
            'authorization_code' => $data['authorization']['authorization_code'] ?? null,
            'payment_method' => $data['channel'] ?? null,
            'card_type' => $data['authorization']['card_type'] ?? null,
            'card_last_four' => $data['authorization']['last4'] ?? null,
            'bank_name' => $data['authorization']['bank'] ?? null,
            'gateway_response' => $data['gateway_response'] ?? null,
            'metadata' => $data,
        ]);

        $payment->order->markAsPaid();

        // Send notification
        $payment->user->notify(new OrderConfirmation($payment->order));
    }

    /**
     * Handle failed charge webhook.
     */
    private function handleChargeFailed(array $data): void
    {
        $reference = $data['reference'] ?? null;
        if (!$reference) return;

        $payment = Payment::where('payment_reference', $reference)->first();
        if (!$payment) return;

        $payment->markAsFailed($data['gateway_response'] ?? 'Payment failed');
    }

    /**
     * Handle refund processed webhook.
     */
    private function handleRefundProcessed(array $data): void
    {
        // Handle refund webhook
        Log::info('Refund processed', $data);
    }
}
