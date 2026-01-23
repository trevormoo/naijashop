<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'slug',
        'sku',
        'short_description',
        'description',
        'price',
        'compare_price',
        'cost_price',
        'category_id',
        'stock_quantity',
        'low_stock_threshold',
        'track_quantity',
        'allow_backorders',
        'weight',
        'dimensions',
        'is_active',
        'is_featured',
        'is_digital',
        'digital_file_path',
        'view_count',
        'sales_count',
        'average_rating',
        'review_count',
        'meta_title',
        'meta_description',
        'tags',
        'attributes',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'price' => 'decimal:2',
        'compare_price' => 'decimal:2',
        'cost_price' => 'decimal:2',
        'weight' => 'decimal:2',
        'average_rating' => 'decimal:2',
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
        'is_digital' => 'boolean',
        'track_quantity' => 'boolean',
        'allow_backorders' => 'boolean',
        'tags' => 'array',
        'attributes' => 'array',
    ];

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($product) {
            if (empty($product->slug)) {
                $product->slug = Str::slug($product->name);
            }
            if (empty($product->sku)) {
                $product->sku = 'SKU-' . strtoupper(Str::random(8));
            }
        });

        static::updating(function ($product) {
            if ($product->isDirty('name') && !$product->isDirty('slug')) {
                $product->slug = Str::slug($product->name);
            }
        });
    }

    /**
     * Get the category.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get the product images.
     */
    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order');
    }

    /**
     * Get the primary image.
     */
    public function primaryImage()
    {
        return $this->hasOne(ProductImage::class)->where('is_primary', true);
    }

    /**
     * Get the reviews.
     */
    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    /**
     * Get approved reviews.
     */
    public function approvedReviews(): HasMany
    {
        return $this->reviews()->where('is_approved', true);
    }

    /**
     * Get the order items.
     */
    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Get the cart items.
     */
    public function cartItems(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    /**
     * Users who wishlisted this product.
     */
    public function wishlistedBy(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'wishlists')
            ->withTimestamps();
    }

    /**
     * Get the primary image URL.
     */
    public function getPrimaryImageUrlAttribute(): ?string
    {
        $primaryImage = $this->images()->where('is_primary', true)->first();
        return $primaryImage ? $primaryImage->url : null;
    }

    /**
     * Check if product is in stock.
     */
    public function getInStockAttribute(): bool
    {
        if (!$this->track_quantity) {
            return true;
        }

        return $this->stock_quantity > 0 || $this->allow_backorders;
    }

    /**
     * Check if stock is low.
     */
    public function getIsLowStockAttribute(): bool
    {
        return $this->track_quantity &&
               $this->stock_quantity <= $this->low_stock_threshold &&
               $this->stock_quantity > 0;
    }

    /**
     * Check if product is out of stock.
     */
    public function getIsOutOfStockAttribute(): bool
    {
        return $this->track_quantity &&
               $this->stock_quantity <= 0 &&
               !$this->allow_backorders;
    }

    /**
     * Get discount percentage.
     */
    public function getDiscountPercentageAttribute(): ?int
    {
        if (!$this->compare_price || $this->compare_price <= $this->price) {
            return null;
        }

        return (int) round((($this->compare_price - $this->price) / $this->compare_price) * 100);
    }

    /**
     * Get formatted price.
     */
    public function getFormattedPriceAttribute(): string
    {
        return config('app.currency_symbol') . number_format($this->price, 2);
    }

    /**
     * Get related products.
     */
    public function getRelatedProducts($limit = 4)
    {
        return static::where('id', '!=', $this->id)
            ->where('category_id', $this->category_id)
            ->active()
            ->inStock()
            ->limit($limit)
            ->get();
    }

    /**
     * Update average rating.
     */
    public function updateRating(): void
    {
        $reviews = $this->approvedReviews();
        $this->update([
            'average_rating' => $reviews->avg('rating') ?? 0,
            'review_count' => $reviews->count(),
        ]);
    }

    /**
     * Decrement stock.
     */
    public function decrementStock(int $quantity): bool
    {
        if (!$this->track_quantity) {
            return true;
        }

        if ($this->stock_quantity < $quantity && !$this->allow_backorders) {
            return false;
        }

        $this->decrement('stock_quantity', $quantity);
        $this->increment('sales_count', $quantity);

        return true;
    }

    /**
     * Increment stock.
     */
    public function incrementStock(int $quantity): void
    {
        if ($this->track_quantity) {
            $this->increment('stock_quantity', $quantity);
        }
    }

    /**
     * Scope for active products.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for featured products.
     */
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    /**
     * Scope for in-stock products.
     */
    public function scopeInStock($query)
    {
        return $query->where(function ($q) {
            $q->where('track_quantity', false)
              ->orWhere('stock_quantity', '>', 0)
              ->orWhere('allow_backorders', true);
        });
    }

    /**
     * Scope for low stock products.
     */
    public function scopeLowStock($query)
    {
        return $query->where('track_quantity', true)
            ->whereColumn('stock_quantity', '<=', 'low_stock_threshold')
            ->where('stock_quantity', '>', 0);
    }

    /**
     * Scope for out of stock products.
     */
    public function scopeOutOfStock($query)
    {
        return $query->where('track_quantity', true)
            ->where('stock_quantity', '<=', 0)
            ->where('allow_backorders', false);
    }

    /**
     * Scope for price range.
     */
    public function scopePriceRange($query, $min = null, $max = null)
    {
        if ($min !== null) {
            $query->where('price', '>=', $min);
        }
        if ($max !== null) {
            $query->where('price', '<=', $max);
        }
        return $query;
    }

    /**
     * Scope for search.
     */
    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('name', 'LIKE', "%{$search}%")
              ->orWhere('short_description', 'LIKE', "%{$search}%")
              ->orWhere('description', 'LIKE', "%{$search}%")
              ->orWhere('sku', 'LIKE', "%{$search}%");
        });
    }

    /**
     * Scope for category filter.
     */
    public function scopeInCategory($query, $categoryId)
    {
        if (is_array($categoryId)) {
            return $query->whereIn('category_id', $categoryId);
        }
        return $query->where('category_id', $categoryId);
    }
}
