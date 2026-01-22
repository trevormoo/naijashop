<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartResource extends JsonResource
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
            'subtotal' => (float) $this->subtotal,
            'discount_amount' => (float) $this->discount_amount,
            'tax_amount' => (float) $this->tax_amount,
            'total' => (float) $this->total,
            'coupon_code' => $this->coupon_code,
            'items_count' => $this->items_count,
            'is_empty' => $this->is_empty,

            // Cart items
            'items' => CartItemResource::collection($this->whenLoaded('items')),

            // Formatted prices
            'formatted_subtotal' => config('app.currency_symbol') . number_format($this->subtotal, 2),
            'formatted_discount' => config('app.currency_symbol') . number_format($this->discount_amount, 2),
            'formatted_tax' => config('app.currency_symbol') . number_format($this->tax_amount, 2),
            'formatted_total' => config('app.currency_symbol') . number_format($this->total, 2),

            'updated_at' => $this->updated_at->toISOString(),
        ];
    }
}
