<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Order\CheckoutRequest;
use App\Http\Resources\CartResource;
use App\Http\Resources\OrderResource;
use App\Models\Cart;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\OrderItem;
use App\Notifications\OrderConfirmation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CheckoutController extends Controller
{
    /**
     * Get checkout summary.
     */
    public function summary(Request $request): JsonResponse
    {
        $cart = $this->getUserCart();

        if ($cart->is_empty) {
            return response()->json([
                'message' => 'Your cart is empty.',
            ], 400);
        }

        $cart->load('items.product.images');

        // Validate all items are still available
        $unavailableItems = [];
        foreach ($cart->items as $item) {
            if (!$item->is_available) {
                $unavailableItems[] = $item->product->name;
            } elseif (!$item->has_sufficient_stock) {
                $unavailableItems[] = "{$item->product->name} (only {$item->max_quantity} available)";
            }
        }

        if (!empty($unavailableItems)) {
            return response()->json([
                'message' => 'Some items in your cart are no longer available.',
                'unavailable_items' => $unavailableItems,
                'cart' => new CartResource($cart),
            ], 400);
        }

        return response()->json([
            'cart' => new CartResource($cart),
            'shipping_methods' => $this->getShippingMethods(),
            'nigerian_states' => $this->getNigerianStates(),
        ]);
    }

    /**
     * Process checkout and create order.
     */
    public function process(CheckoutRequest $request): JsonResponse
    {
        $cart = $this->getUserCart();

        if ($cart->is_empty) {
            return response()->json([
                'message' => 'Your cart is empty.',
            ], 400);
        }

        $cart->load('items.product');

        // Validate stock availability
        foreach ($cart->items as $item) {
            if (!$item->is_available) {
                return response()->json([
                    'message' => "Product '{$item->product->name}' is no longer available.",
                ], 400);
            }
            if (!$item->has_sufficient_stock) {
                return response()->json([
                    'message' => "Insufficient stock for '{$item->product->name}'. Only {$item->max_quantity} available.",
                ], 400);
            }
        }

        try {
            DB::beginTransaction();

            // Create order
            $order = Order::create([
                'user_id' => auth()->id(),
                'status' => Order::STATUS_PENDING,
                'payment_status' => Order::PAYMENT_PENDING,
                'subtotal' => $cart->subtotal,
                'discount_amount' => $cart->discount_amount,
                'shipping_amount' => 0, // Can be calculated based on shipping method
                'tax_amount' => $cart->tax_amount,
                'total' => $cart->total,
                'currency' => config('app.currency'),
                'coupon_code' => $cart->coupon_code,
                'coupon_discount' => $cart->discount_amount,

                // Billing
                'billing_first_name' => $request->billing_first_name,
                'billing_last_name' => $request->billing_last_name,
                'billing_email' => $request->billing_email,
                'billing_phone' => $request->billing_phone,
                'billing_address' => $request->billing_address,
                'billing_city' => $request->billing_city,
                'billing_state' => $request->billing_state,
                'billing_country' => $request->billing_country ?? 'Nigeria',
                'billing_postal_code' => $request->billing_postal_code,

                // Shipping
                'shipping_first_name' => $request->shipping_first_name,
                'shipping_last_name' => $request->shipping_last_name,
                'shipping_phone' => $request->shipping_phone,
                'shipping_address' => $request->shipping_address,
                'shipping_city' => $request->shipping_city,
                'shipping_state' => $request->shipping_state,
                'shipping_country' => $request->shipping_country ?? 'Nigeria',
                'shipping_postal_code' => $request->shipping_postal_code,
                'shipping_method' => $request->shipping_method,
                'notes' => $request->notes,
            ]);

            // Create order items and decrement stock
            foreach ($cart->items as $cartItem) {
                OrderItem::createFromCartItem($cartItem, $order);

                // Decrement stock
                $cartItem->product->decrementStock($cartItem->quantity);
            }

            // Record coupon usage
            if ($cart->coupon_code) {
                $coupon = Coupon::where('code', $cart->coupon_code)->first();
                if ($coupon) {
                    $coupon->incrementUsage(auth()->id(), $order->id);
                }
            }

            // Clear cart
            $cart->clear();

            DB::commit();

            // Load order relationships
            $order->load('items.product');

            return response()->json([
                'message' => 'Order created successfully.',
                'order' => new OrderResource($order),
                'payment_method' => $request->payment_method,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Failed to process checkout. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Get user's cart.
     */
    private function getUserCart(): Cart
    {
        return Cart::getOrCreate(auth()->id());
    }

    /**
     * Get available shipping methods.
     */
    private function getShippingMethods(): array
    {
        return [
            [
                'id' => 'standard',
                'name' => 'Standard Delivery',
                'description' => 'Delivery within 3-5 business days',
                'price' => 0,
            ],
            [
                'id' => 'express',
                'name' => 'Express Delivery',
                'description' => 'Delivery within 1-2 business days',
                'price' => 2000,
            ],
        ];
    }

    /**
     * Get Nigerian states for dropdown.
     */
    private function getNigerianStates(): array
    {
        return [
            'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa',
            'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo',
            'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo', 'Jigawa', 'Kaduna',
            'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa',
            'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers',
            'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
        ];
    }
}
