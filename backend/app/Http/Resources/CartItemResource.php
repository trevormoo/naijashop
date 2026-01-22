<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartItemResource extends JsonResource
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
            'product_id' => $this->product_id,
            'quantity' => $this->quantity,
            'price' => (float) $this->price,
            'subtotal' => (float) $this->subtotal,
            'options' => $this->options,
            'is_available' => $this->is_available,
            'has_sufficient_stock' => $this->has_sufficient_stock,
            'max_quantity' => $this->max_quantity,

            // Formatted prices
            'formatted_price' => config('app.currency_symbol') . number_format($this->price, 2),
            'formatted_subtotal' => config('app.currency_symbol') . number_format($this->subtotal, 2),

            // Product details
            'product' => new ProductResource($this->whenLoaded('product')),

            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
        ];
    }
}
