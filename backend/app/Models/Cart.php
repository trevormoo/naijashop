<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cart extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'session_id',
        'subtotal',
        'discount_amount',
        'tax_amount',
        'total',
        'coupon_code',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'subtotal' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    /**
     * Get the user.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the cart items.
     */
    public function items(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    /**
     * Get the coupon if applied.
     */
    public function coupon(): BelongsTo
    {
        return $this->belongsTo(Coupon::class, 'coupon_code', 'code');
    }

    /**
     * Get the total number of items.
     */
    public function getItemsCountAttribute(): int
    {
        return $this->items->sum('quantity');
    }

    /**
     * Check if cart is empty.
     */
    public function getIsEmptyAttribute(): bool
    {
        return $this->items->isEmpty();
    }

    /**
     * Recalculate cart totals.
     */
    public function recalculate(): void
    {
        $subtotal = $this->items->sum('subtotal');

        $discountAmount = 0;
        if ($this->coupon_code) {
            $coupon = Coupon::where('code', $this->coupon_code)->first();
            if ($coupon && $coupon->isValid()) {
                $discountAmount = $coupon->calculateDiscount($subtotal);
            } else {
                $this->coupon_code = null;
            }
        }

        // Tax calculation (if applicable - 7.5% VAT in Nigeria)
        $taxRate = 0; // Set to 0.075 for 7.5% VAT
        $taxAmount = ($subtotal - $discountAmount) * $taxRate;

        $this->update([
            'subtotal' => $subtotal,
            'discount_amount' => $discountAmount,
            'tax_amount' => $taxAmount,
            'total' => $subtotal - $discountAmount + $taxAmount,
        ]);
    }

    /**
     * Add a product to the cart.
     */
    public function addProduct(Product $product, int $quantity = 1, array $options = []): CartItem
    {
        $existingItem = $this->items()->where('product_id', $product->id)->first();

        if ($existingItem) {
            $existingItem->update([
                'quantity' => $existingItem->quantity + $quantity,
                'subtotal' => ($existingItem->quantity + $quantity) * $existingItem->price,
            ]);
            $this->recalculate();
            return $existingItem->fresh();
        }

        $item = $this->items()->create([
            'product_id' => $product->id,
            'quantity' => $quantity,
            'price' => $product->price,
            'subtotal' => $product->price * $quantity,
            'options' => $options,
        ]);

        $this->recalculate();
        return $item;
    }

    /**
     * Update item quantity.
     */
    public function updateItemQuantity(CartItem $item, int $quantity): void
    {
        if ($quantity <= 0) {
            $item->delete();
        } else {
            $item->update([
                'quantity' => $quantity,
                'subtotal' => $item->price * $quantity,
            ]);
        }

        $this->recalculate();
    }

    /**
     * Remove an item from cart.
     */
    public function removeItem(CartItem $item): void
    {
        $item->delete();
        $this->recalculate();
    }

    /**
     * Clear the cart.
     */
    public function clear(): void
    {
        $this->items()->delete();
        $this->update([
            'subtotal' => 0,
            'discount_amount' => 0,
            'tax_amount' => 0,
            'total' => 0,
            'coupon_code' => null,
        ]);
    }

    /**
     * Apply a coupon code.
     */
    public function applyCoupon(string $code): bool
    {
        $coupon = Coupon::where('code', $code)->first();

        if (!$coupon || !$coupon->isValid($this->subtotal)) {
            return false;
        }

        $this->update(['coupon_code' => $code]);
        $this->recalculate();

        return true;
    }

    /**
     * Remove coupon.
     */
    public function removeCoupon(): void
    {
        $this->update(['coupon_code' => null]);
        $this->recalculate();
    }

    /**
     * Merge guest cart with user cart.
     */
    public function mergeWith(Cart $guestCart): void
    {
        foreach ($guestCart->items as $guestItem) {
            $existingItem = $this->items()
                ->where('product_id', $guestItem->product_id)
                ->first();

            if ($existingItem) {
                $existingItem->update([
                    'quantity' => $existingItem->quantity + $guestItem->quantity,
                    'subtotal' => ($existingItem->quantity + $guestItem->quantity) * $existingItem->price,
                ]);
            } else {
                $this->items()->create([
                    'product_id' => $guestItem->product_id,
                    'quantity' => $guestItem->quantity,
                    'price' => $guestItem->price,
                    'subtotal' => $guestItem->subtotal,
                    'options' => $guestItem->options,
                ]);
            }
        }

        $guestCart->delete();
        $this->recalculate();
    }

    /**
     * Get or create cart for user or session.
     */
    public static function getOrCreate(?int $userId = null, ?string $sessionId = null): self
    {
        if ($userId) {
            return static::firstOrCreate(['user_id' => $userId]);
        }

        if ($sessionId) {
            return static::firstOrCreate(['session_id' => $sessionId]);
        }

        throw new \InvalidArgumentException('Either user_id or session_id is required');
    }
}
