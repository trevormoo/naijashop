<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
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
            'order_number' => $this->order_number,
            'status' => $this->status,
            'status_label' => ucfirst($this->status),
            'payment_status' => $this->payment_status,
            'payment_status_label' => ucfirst(str_replace('_', ' ', $this->payment_status)),

            // Pricing
            'subtotal' => (float) $this->subtotal,
            'discount_amount' => (float) $this->discount_amount,
            'shipping_amount' => (float) $this->shipping_amount,
            'tax_amount' => (float) $this->tax_amount,
            'total' => (float) $this->total,
            'currency' => $this->currency,

            // Formatted prices
            'formatted_subtotal' => config('app.currency_symbol') . number_format($this->subtotal, 2),
            'formatted_discount' => config('app.currency_symbol') . number_format($this->discount_amount, 2),
            'formatted_shipping' => config('app.currency_symbol') . number_format($this->shipping_amount, 2),
            'formatted_tax' => config('app.currency_symbol') . number_format($this->tax_amount, 2),
            'formatted_total' => config('app.currency_symbol') . number_format($this->total, 2),

            // Coupon
            'coupon_code' => $this->coupon_code,
            'coupon_discount' => (float) $this->coupon_discount,

            // Billing Information
            'billing' => [
                'first_name' => $this->billing_first_name,
                'last_name' => $this->billing_last_name,
                'full_name' => $this->billing_full_name,
                'email' => $this->billing_email,
                'phone' => $this->billing_phone,
                'address' => $this->billing_address,
                'city' => $this->billing_city,
                'state' => $this->billing_state,
                'country' => $this->billing_country,
                'postal_code' => $this->billing_postal_code,
                'formatted_address' => $this->formatted_billing_address,
            ],

            // Shipping Information
            'shipping' => [
                'first_name' => $this->shipping_first_name,
                'last_name' => $this->shipping_last_name,
                'full_name' => $this->shipping_full_name,
                'phone' => $this->shipping_phone,
                'address' => $this->shipping_address,
                'city' => $this->shipping_city,
                'state' => $this->shipping_state,
                'country' => $this->shipping_country,
                'postal_code' => $this->shipping_postal_code,
                'method' => $this->shipping_method,
                'tracking_number' => $this->tracking_number,
                'formatted_address' => $this->formatted_shipping_address,
            ],

            // Additional Info
            'notes' => $this->notes,
            'admin_notes' => $this->when($request->user()?->isAdmin(), $this->admin_notes),
            'items_count' => $this->items_count,

            // Status flags
            'can_be_cancelled' => $this->canBeCancelled(),
            'can_be_refunded' => $this->canBeRefunded(),
            'is_paid' => $this->isPaid(),
            'available_status_transitions' => $this->getAvailableStatusTransitions(),

            // Timestamps
            'shipped_at' => $this->shipped_at?->toISOString(),
            'delivered_at' => $this->delivered_at?->toISOString(),
            'cancelled_at' => $this->cancelled_at?->toISOString(),
            'cancellation_reason' => $this->cancellation_reason,
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),

            // Relationships
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'user' => new UserResource($this->whenLoaded('user')),
            'payments' => PaymentResource::collection($this->whenLoaded('payments')),
        ];
    }
}
