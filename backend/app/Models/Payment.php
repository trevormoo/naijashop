<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Payment extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * Payment statuses.
     */
    const STATUS_PENDING = 'pending';
    const STATUS_PROCESSING = 'processing';
    const STATUS_SUCCESS = 'success';
    const STATUS_FAILED = 'failed';
    const STATUS_CANCELLED = 'cancelled';
    const STATUS_REFUNDED = 'refunded';
    const STATUS_PARTIALLY_REFUNDED = 'partially_refunded';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'order_id',
        'user_id',
        'payment_reference',
        'gateway',
        'gateway_reference',
        'authorization_code',
        'amount',
        'currency',
        'status',
        'payment_method',
        'card_type',
        'card_last_four',
        'bank_name',
        'account_name',
        'gateway_response',
        'metadata',
        'refunded_amount',
        'refund_reason',
        'paid_at',
        'refunded_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'amount' => 'decimal:2',
        'refunded_amount' => 'decimal:2',
        'metadata' => 'array',
        'paid_at' => 'datetime',
        'refunded_at' => 'datetime',
    ];

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($payment) {
            if (empty($payment->payment_reference)) {
                $payment->payment_reference = static::generateReference();
            }
        });
    }

    /**
     * Generate unique payment reference.
     */
    public static function generateReference(): string
    {
        $prefix = 'PAY';
        $timestamp = now()->format('YmdHis');
        $random = strtoupper(Str::random(8));

        return "{$prefix}_{$timestamp}_{$random}";
    }

    /**
     * Get the order.
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get the user.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the refunds.
     */
    public function refunds(): HasMany
    {
        return $this->hasMany(Refund::class);
    }

    /**
     * Check if payment is successful.
     */
    public function isSuccessful(): bool
    {
        return $this->status === self::STATUS_SUCCESS;
    }

    /**
     * Check if payment is pending.
     */
    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    /**
     * Check if payment can be refunded.
     */
    public function canBeRefunded(): bool
    {
        return $this->isSuccessful() &&
               ($this->amount - $this->refunded_amount) > 0;
    }

    /**
     * Get refundable amount.
     */
    public function getRefundableAmountAttribute(): float
    {
        return max(0, $this->amount - $this->refunded_amount);
    }

    /**
     * Mark as successful.
     */
    public function markAsSuccessful(array $data = []): void
    {
        $this->update(array_merge([
            'status' => self::STATUS_SUCCESS,
            'paid_at' => now(),
        ], $data));
    }

    /**
     * Mark as failed.
     */
    public function markAsFailed(?string $reason = null): void
    {
        $this->update([
            'status' => self::STATUS_FAILED,
            'gateway_response' => $reason,
        ]);
    }

    /**
     * Process refund.
     */
    public function processRefund(float $amount, ?string $reason = null): bool
    {
        if ($amount > $this->refundable_amount) {
            return false;
        }

        $newRefundedAmount = $this->refunded_amount + $amount;
        $isFullRefund = $newRefundedAmount >= $this->amount;

        $this->update([
            'refunded_amount' => $newRefundedAmount,
            'status' => $isFullRefund ? self::STATUS_REFUNDED : self::STATUS_PARTIALLY_REFUNDED,
            'refund_reason' => $reason,
            'refunded_at' => now(),
        ]);

        return true;
    }

    /**
     * Scope for successful payments.
     */
    public function scopeSuccessful($query)
    {
        return $query->where('status', self::STATUS_SUCCESS);
    }

    /**
     * Scope for pending payments.
     */
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    /**
     * Scope for gateway.
     */
    public function scopeGateway($query, string $gateway)
    {
        return $query->where('gateway', $gateway);
    }
}
