<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
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
            'payment_reference' => $this->payment_reference,
            'gateway' => $this->gateway,
            'gateway_reference' => $this->gateway_reference,
            'amount' => (float) $this->amount,
            'currency' => $this->currency,
            'status' => $this->status,
            'status_label' => ucfirst(str_replace('_', ' ', $this->status)),
            'payment_method' => $this->payment_method,
            'card_type' => $this->card_type,
            'card_last_four' => $this->card_last_four,
            'bank_name' => $this->bank_name,
            'refunded_amount' => (float) $this->refunded_amount,
            'refundable_amount' => (float) $this->refundable_amount,
            'can_be_refunded' => $this->canBeRefunded(),

            // Formatted prices
            'formatted_amount' => config('app.currency_symbol') . number_format($this->amount, 2),
            'formatted_refunded' => config('app.currency_symbol') . number_format($this->refunded_amount, 2),

            // Timestamps
            'paid_at' => $this->paid_at?->toISOString(),
            'refunded_at' => $this->refunded_at?->toISOString(),
            'created_at' => $this->created_at->toISOString(),
        ];
    }
}
