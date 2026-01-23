<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class ProductImage extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'product_id',
        'image_path',
        'thumbnail_path',
        'alt_text',
        'is_primary',
        'sort_order',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_primary' => 'boolean',
        'sort_order' => 'integer',
    ];

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        // When setting an image as primary, unset other primary images
        static::saving(function ($image) {
            if ($image->is_primary) {
                static::where('product_id', $image->product_id)
                    ->where('id', '!=', $image->id)
                    ->update(['is_primary' => false]);
            }
        });

        // Delete file when model is deleted (only for local files)
        static::deleting(function ($image) {
            if ($image->image_path && !str_starts_with($image->image_path, 'http')) {
                Storage::disk('public')->delete($image->image_path);
            }
            if ($image->thumbnail_path && !str_starts_with($image->thumbnail_path, 'http')) {
                Storage::disk('public')->delete($image->thumbnail_path);
            }
        });
    }

    /**
     * Get the product.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the full URL of the image.
     */
    public function getUrlAttribute(): string
    {
        // Support external URLs (e.g., Unsplash)
        if (str_starts_with($this->image_path, 'http://') || str_starts_with($this->image_path, 'https://')) {
            return $this->image_path;
        }
        return asset('storage/' . $this->image_path);
    }

    /**
     * Get the full URL of the thumbnail.
     */
    public function getThumbnailUrlAttribute(): ?string
    {
        if ($this->thumbnail_path) {
            // Support external URLs
            if (str_starts_with($this->thumbnail_path, 'http://') || str_starts_with($this->thumbnail_path, 'https://')) {
                return $this->thumbnail_path;
            }
            return asset('storage/' . $this->thumbnail_path);
        }
        return $this->url;
    }

    /**
     * Set this image as primary.
     */
    public function setPrimary(): void
    {
        $this->update(['is_primary' => true]);
    }

    /**
     * Scope for primary images.
     */
    public function scopePrimary($query)
    {
        return $query->where('is_primary', true);
    }

    /**
     * Scope ordered by sort_order.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order');
    }
}
