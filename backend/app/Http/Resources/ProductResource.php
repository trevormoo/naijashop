<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'sku' => $this->sku,
            'short_description' => $this->short_description,
            'description' => $this->description,
            'price' => (float) $this->price,
            'formatted_price' => $this->formatted_price,
            'compare_price' => $this->compare_price ? (float) $this->compare_price : null,
            'discount_percentage' => $this->discount_percentage,
            'category_id' => $this->category_id,
            'stock_quantity' => $this->stock_quantity,
            'low_stock_threshold' => $this->low_stock_threshold,
            'track_quantity' => $this->track_quantity,
            'allow_backorders' => $this->allow_backorders,
            'in_stock' => $this->in_stock,
            'is_low_stock' => $this->is_low_stock,
            'is_out_of_stock' => $this->is_out_of_stock,
            'weight' => $this->weight,
            'dimensions' => $this->dimensions,
            'is_active' => $this->is_active,
            'is_featured' => $this->is_featured,
            'is_digital' => $this->is_digital,
            'view_count' => $this->view_count,
            'sales_count' => $this->sales_count,
            'average_rating' => (float) $this->average_rating,
            'review_count' => $this->review_count,
            'meta_title' => $this->meta_title,
            'meta_description' => $this->meta_description,
            'tags' => $this->tags ?? [],
            'attributes' => $this->attributes ?? [],

            // Primary image (both fields for compatibility)
            'primary_image' => $this->primary_image_url,
            'image_url' => $this->primary_image_url,

            // All images
            'images' => ProductImageResource::collection($this->whenLoaded('images')),

            // Category
            'category' => new CategoryResource($this->whenLoaded('category')),

            // Reviews
            'reviews' => ReviewResource::collection($this->whenLoaded('approvedReviews')),

            // Wishlist status (for authenticated users)
            'in_wishlist' => $this->when(
                auth()->check(),
                fn() => $this->wishlistedBy->contains(auth()->id())
            ),

            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
        ];
    }
}
