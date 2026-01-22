<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'order_id',
        'product_id',
        'product_name',
        'product_sku',
        'product_image',
        'quantity',
        'unit_price',
        'subtotal',
        'discount_amount',
        'tax_amount',
        'total',
        'options',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'unit_price' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'total' => 'decimal:2',
        'options' => 'array',
    ];

    /**
     * Get the order.
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get the product (may be null if deleted).
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class)->withTrashed();
    }

    /**
     * Get formatted unit price.
     */
    public function getFormattedUnitPriceAttribute(): string
    {
        return config('app.currency_symbol') . number_format($this->unit_price, 2);
    }

    /**
     * Get formatted total.
     */
    public function getFormattedTotalAttribute(): string
    {
        return config('app.currency_symbol') . number_format($this->total, 2);
    }

    /**
     * Create from cart item.
     */
    public static function createFromCartItem(CartItem $cartItem, Order $order): self
    {
        $product = $cartItem->product;
        $primaryImage = $product->images()->where('is_primary', true)->first();

        return static::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'product_name' => $product->name,
            'product_sku' => $product->sku,
            'product_image' => $primaryImage?->image_path,
            'quantity' => $cartItem->quantity,
            'unit_price' => $cartItem->price,
            'subtotal' => $cartItem->subtotal,
            'discount_amount' => 0,
            'tax_amount' => 0,
            'total' => $cartItem->subtotal,
            'options' => $cartItem->options,
        ]);
    }
}
