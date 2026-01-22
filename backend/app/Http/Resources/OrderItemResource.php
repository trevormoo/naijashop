<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderItemResource extends JsonResource
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
            'product_name' => $this->product_name,
            'product_sku' => $this->product_sku,
            'product_image' => $this->product_image ? asset('storage/' . $this->product_image) : null,
            'quantity' => $this->quantity,
            'unit_price' => (float) $this->unit_price,
            'subtotal' => (float) $this->subtotal,
            'discount_amount' => (float) $this->discount_amount,
            'tax_amount' => (float) $this->tax_amount,
            'total' => (float) $this->total,
            'options' => $this->options,

            // Formatted prices
            'formatted_unit_price' => $this->formatted_unit_price,
            'formatted_total' => $this->formatted_total,

            // Product relationship (if still exists)
            'product' => new ProductResource($this->whenLoaded('product')),
        ];
    }
}
