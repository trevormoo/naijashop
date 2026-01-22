<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CartItem extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'cart_id',
        'product_id',
        'quantity',
        'price',
        'subtotal',
        'options',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'price' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'options' => 'array',
    ];

    /**
     * Get the cart.
     */
    public function cart(): BelongsTo
    {
        return $this->belongsTo(Cart::class);
    }

    /**
     * Get the product.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Check if product is still available.
     */
    public function getIsAvailableAttribute(): bool
    {
        if (!$this->product || !$this->product->is_active) {
            return false;
        }

        return $this->product->in_stock;
    }

    /**
     * Check if requested quantity is available.
     */
    public function getHasSufficientStockAttribute(): bool
    {
        if (!$this->product) {
            return false;
        }

        if (!$this->product->track_quantity) {
            return true;
        }

        return $this->product->stock_quantity >= $this->quantity ||
               $this->product->allow_backorders;
    }

    /**
     * Get the maximum available quantity.
     */
    public function getMaxQuantityAttribute(): int
    {
        if (!$this->product || !$this->product->track_quantity) {
            return PHP_INT_MAX;
        }

        if ($this->product->allow_backorders) {
            return PHP_INT_MAX;
        }

        return max(0, $this->product->stock_quantity);
    }

    /**
     * Update quantity and recalculate.
     */
    public function updateQuantity(int $quantity): void
    {
        $this->update([
            'quantity' => $quantity,
            'subtotal' => $this->price * $quantity,
        ]);

        $this->cart->recalculate();
    }
}
