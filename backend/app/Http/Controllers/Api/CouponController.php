<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use App\Models\CouponUsage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    /**
     * Validate and get coupon details
     */
    public function validate(Request $request): JsonResponse
    {
        $request->validate([
            'code' => 'required|string',
            'subtotal' => 'required|numeric|min:0',
        ]);

        $coupon = Coupon::where('code', strtoupper($request->code))
            ->where('is_active', true)
            ->first();

        if (!$coupon) {
            return response()->json([
                'valid' => false,
                'message' => 'Invalid coupon code',
            ], 422);
        }

        // Check expiry
        if ($coupon->expires_at && $coupon->expires_at->isPast()) {
            return response()->json([
                'valid' => false,
                'message' => 'This coupon has expired',
            ], 422);
        }

        // Check usage limit
        if ($coupon->usage_limit && $coupon->times_used >= $coupon->usage_limit) {
            return response()->json([
                'valid' => false,
                'message' => 'This coupon has reached its usage limit',
            ], 422);
        }

        // Check per-user limit
        if ($coupon->usage_limit_per_user && $request->user()) {
            $userUsage = CouponUsage::where('coupon_id', $coupon->id)
                ->where('user_id', $request->user()->id)
                ->count();

            if ($userUsage >= $coupon->usage_limit_per_user) {
                return response()->json([
                    'valid' => false,
                    'message' => 'You have already used this coupon the maximum number of times',
                ], 422);
            }
        }

        // Check minimum order amount
        if ($coupon->minimum_order_amount && $request->subtotal < $coupon->minimum_order_amount) {
            return response()->json([
                'valid' => false,
                'message' => "Minimum order amount of ₦" . number_format($coupon->minimum_order_amount) . " required",
            ], 422);
        }

        // Calculate discount
        $discount = $this->calculateDiscount($coupon, $request->subtotal);

        return response()->json([
            'valid' => true,
            'coupon' => [
                'code' => $coupon->code,
                'description' => $coupon->description,
                'type' => $coupon->type,
                'value' => $coupon->value,
                'discount_amount' => $discount,
                'formatted_discount' => '₦' . number_format($discount),
            ],
        ]);
    }

    /**
     * Apply coupon to cart
     */
    public function apply(Request $request): JsonResponse
    {
        $request->validate([
            'code' => 'required|string',
        ]);

        $cart = $request->user()->cart;

        if (!$cart || $cart->items->isEmpty()) {
            return response()->json([
                'message' => 'Your cart is empty',
            ], 422);
        }

        $coupon = Coupon::where('code', strtoupper($request->code))
            ->where('is_active', true)
            ->first();

        if (!$coupon) {
            return response()->json([
                'message' => 'Invalid coupon code',
            ], 422);
        }

        // Validate coupon
        $validation = $this->validateCoupon($coupon, $cart->subtotal, $request->user());

        if (!$validation['valid']) {
            return response()->json([
                'message' => $validation['message'],
            ], 422);
        }

        // Apply to cart
        $cart->update([
            'coupon_id' => $coupon->id,
        ]);

        $discount = $this->calculateDiscount($coupon, $cart->subtotal);

        return response()->json([
            'message' => 'Coupon applied successfully',
            'discount' => $discount,
            'formatted_discount' => '₦' . number_format($discount),
            'new_total' => $cart->subtotal - $discount,
        ]);
    }

    /**
     * Remove coupon from cart
     */
    public function remove(Request $request): JsonResponse
    {
        $cart = $request->user()->cart;

        if (!$cart) {
            return response()->json([
                'message' => 'Cart not found',
            ], 404);
        }

        $cart->update([
            'coupon_id' => null,
        ]);

        return response()->json([
            'message' => 'Coupon removed',
        ]);
    }

    /**
     * Calculate discount amount
     */
    private function calculateDiscount(Coupon $coupon, float $subtotal): float
    {
        if ($coupon->type === 'percentage') {
            $discount = ($subtotal * $coupon->value) / 100;

            // Apply maximum discount limit
            if ($coupon->maximum_discount_amount) {
                $discount = min($discount, $coupon->maximum_discount_amount);
            }
        } else {
            $discount = $coupon->value;
        }

        // Discount cannot exceed subtotal
        return min($discount, $subtotal);
    }

    /**
     * Validate coupon for user
     */
    private function validateCoupon(Coupon $coupon, float $subtotal, $user): array
    {
        // Check expiry
        if ($coupon->expires_at && $coupon->expires_at->isPast()) {
            return ['valid' => false, 'message' => 'This coupon has expired'];
        }

        // Check usage limit
        if ($coupon->usage_limit && $coupon->times_used >= $coupon->usage_limit) {
            return ['valid' => false, 'message' => 'This coupon has reached its usage limit'];
        }

        // Check per-user limit
        if ($coupon->usage_limit_per_user && $user) {
            $userUsage = CouponUsage::where('coupon_id', $coupon->id)
                ->where('user_id', $user->id)
                ->count();

            if ($userUsage >= $coupon->usage_limit_per_user) {
                return ['valid' => false, 'message' => 'You have already used this coupon the maximum number of times'];
            }
        }

        // Check minimum order amount
        if ($coupon->minimum_order_amount && $subtotal < $coupon->minimum_order_amount) {
            return ['valid' => false, 'message' => "Minimum order amount of ₦" . number_format($coupon->minimum_order_amount) . " required"];
        }

        return ['valid' => true, 'message' => 'Coupon is valid'];
    }
}
