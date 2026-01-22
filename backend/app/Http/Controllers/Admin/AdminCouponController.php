<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminCouponController extends Controller
{
    /**
     * Display a listing of coupons
     */
    public function index(Request $request): JsonResponse
    {
        $query = Coupon::query();

        if ($request->has('search')) {
            $query->where('code', 'like', '%' . $request->search . '%');
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        $coupons = $query->latest()->paginate($request->per_page ?? 20);

        return response()->json([
            'data' => $coupons->items(),
            'meta' => [
                'current_page' => $coupons->currentPage(),
                'last_page' => $coupons->lastPage(),
                'per_page' => $coupons->perPage(),
                'total' => $coupons->total(),
            ],
        ]);
    }

    /**
     * Store a newly created coupon
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'code' => 'nullable|string|max:50|unique:coupons',
            'description' => 'nullable|string|max:255',
            'type' => 'required|in:percentage,fixed',
            'value' => 'required|numeric|min:0',
            'minimum_order_amount' => 'nullable|numeric|min:0',
            'maximum_discount_amount' => 'nullable|numeric|min:0',
            'usage_limit' => 'nullable|integer|min:1',
            'usage_limit_per_user' => 'nullable|integer|min:1',
            'starts_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after:starts_at',
            'is_active' => 'boolean',
        ]);

        $coupon = Coupon::create([
            'code' => $request->code ? strtoupper($request->code) : strtoupper(Str::random(8)),
            'description' => $request->description,
            'type' => $request->type,
            'value' => $request->value,
            'minimum_order_amount' => $request->minimum_order_amount,
            'maximum_discount_amount' => $request->maximum_discount_amount,
            'usage_limit' => $request->usage_limit,
            'usage_limit_per_user' => $request->usage_limit_per_user,
            'starts_at' => $request->starts_at,
            'expires_at' => $request->expires_at,
            'is_active' => $request->is_active ?? true,
        ]);

        return response()->json([
            'message' => 'Coupon created successfully',
            'data' => $coupon,
        ], 201);
    }

    /**
     * Display the specified coupon
     */
    public function show(Coupon $coupon): JsonResponse
    {
        return response()->json([
            'data' => $coupon,
            'usage_stats' => [
                'times_used' => $coupon->times_used,
                'remaining' => $coupon->usage_limit ? $coupon->usage_limit - $coupon->times_used : 'Unlimited',
            ],
        ]);
    }

    /**
     * Update the specified coupon
     */
    public function update(Request $request, Coupon $coupon): JsonResponse
    {
        $request->validate([
            'code' => 'required|string|max:50|unique:coupons,code,' . $coupon->id,
            'description' => 'nullable|string|max:255',
            'type' => 'required|in:percentage,fixed',
            'value' => 'required|numeric|min:0',
            'minimum_order_amount' => 'nullable|numeric|min:0',
            'maximum_discount_amount' => 'nullable|numeric|min:0',
            'usage_limit' => 'nullable|integer|min:1',
            'usage_limit_per_user' => 'nullable|integer|min:1',
            'starts_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after:starts_at',
            'is_active' => 'boolean',
        ]);

        $coupon->update([
            'code' => strtoupper($request->code),
            'description' => $request->description,
            'type' => $request->type,
            'value' => $request->value,
            'minimum_order_amount' => $request->minimum_order_amount,
            'maximum_discount_amount' => $request->maximum_discount_amount,
            'usage_limit' => $request->usage_limit,
            'usage_limit_per_user' => $request->usage_limit_per_user,
            'starts_at' => $request->starts_at,
            'expires_at' => $request->expires_at,
            'is_active' => $request->is_active ?? $coupon->is_active,
        ]);

        return response()->json([
            'message' => 'Coupon updated successfully',
            'data' => $coupon->fresh(),
        ]);
    }

    /**
     * Remove the specified coupon
     */
    public function destroy(Coupon $coupon): JsonResponse
    {
        $coupon->delete();

        return response()->json([
            'message' => 'Coupon deleted successfully',
        ]);
    }

    /**
     * Toggle coupon active status
     */
    public function toggleActive(Coupon $coupon): JsonResponse
    {
        $coupon->update(['is_active' => !$coupon->is_active]);

        return response()->json([
            'message' => $coupon->is_active ? 'Coupon activated' : 'Coupon deactivated',
            'is_active' => $coupon->is_active,
        ]);
    }
}
