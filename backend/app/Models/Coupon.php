<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Coupon extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'code',
        'description',
        'type',
        'value',
        'minimum_order_amount',
        'maximum_discount_amount',
        'usage_limit',
        'usage_limit_per_user',
        'times_used',
        'is_active',
        'starts_at',
        'expires_at',
        'applicable_products',
        'applicable_categories',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'value' => 'decimal:2',
        'minimum_order_amount' => 'decimal:2',
        'maximum_discount_amount' => 'decimal:2',
        'is_active' => 'boolean',
        'starts_at' => 'datetime',
        'expires_at' => 'datetime',
        'applicable_products' => 'array',
        'applicable_categories' => 'array',
    ];

    /**
     * Get coupon usages.
     */
    public function usages(): HasMany
    {
        return $this->hasMany(CouponUsage::class);
    }

    /**
     * Check if coupon is valid.
     */
    public function isValid(?float $orderAmount = null): bool
    {
        // Check if active
        if (!$this->is_active) {
            return false;
        }

        // Check date range
        if ($this->starts_at && now()->lt($this->starts_at)) {
            return false;
        }

        if ($this->expires_at && now()->gt($this->expires_at)) {
            return false;
        }

        // Check usage limit
        if ($this->usage_limit && $this->times_used >= $this->usage_limit) {
            return false;
        }

        // Check minimum order amount
        if ($orderAmount !== null && $this->minimum_order_amount > 0) {
            if ($orderAmount < $this->minimum_order_amount) {
                return false;
            }
        }

        return true;
    }

    /**
     * Check if user has exceeded usage limit.
     */
    public function hasUserExceededLimit(int $userId): bool
    {
        $userUsageCount = $this->usages()->where('user_id', $userId)->count();
        return $userUsageCount >= $this->usage_limit_per_user;
    }

    /**
     * Calculate discount amount.
     */
    public function calculateDiscount(float $subtotal): float
    {
        if ($this->type === 'percentage') {
            $discount = ($subtotal * $this->value) / 100;

            // Apply maximum discount cap if set
            if ($this->maximum_discount_amount && $discount > $this->maximum_discount_amount) {
                $discount = $this->maximum_discount_amount;
            }
        } else {
            $discount = min($this->value, $subtotal);
        }

        return round($discount, 2);
    }

    /**
     * Increment usage count.
     */
    public function incrementUsage(int $userId, ?int $orderId = null): void
    {
        $this->increment('times_used');

        $this->usages()->create([
            'user_id' => $userId,
            'order_id' => $orderId,
        ]);
    }

    /**
     * Get validation error message.
     */
    public function getValidationError(?float $orderAmount = null, ?int $userId = null): ?string
    {
        if (!$this->is_active) {
            return 'This coupon is no longer active.';
        }

        if ($this->starts_at && now()->lt($this->starts_at)) {
            return 'This coupon is not yet valid.';
        }

        if ($this->expires_at && now()->gt($this->expires_at)) {
            return 'This coupon has expired.';
        }

        if ($this->usage_limit && $this->times_used >= $this->usage_limit) {
            return 'This coupon has reached its usage limit.';
        }

        if ($userId && $this->hasUserExceededLimit($userId)) {
            return 'You have already used this coupon the maximum number of times.';
        }

        if ($orderAmount !== null && $this->minimum_order_amount > 0) {
            if ($orderAmount < $this->minimum_order_amount) {
                return "Minimum order amount of " . config('app.currency_symbol') .
                       number_format($this->minimum_order_amount, 2) . " required.";
            }
        }

        return null;
    }

    /**
     * Scope for active coupons.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for valid coupons (date range).
     */
    public function scopeValid($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('starts_at')->orWhere('starts_at', '<=', now());
        })->where(function ($q) {
            $q->whereNull('expires_at')->orWhere('expires_at', '>=', now());
        });
    }
}
