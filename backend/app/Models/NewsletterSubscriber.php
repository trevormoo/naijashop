<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class NewsletterSubscriber extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'email',
        'name',
        'is_active',
        'verification_token',
        'verified_at',
        'unsubscribed_at',
        'source',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_active' => 'boolean',
        'verified_at' => 'datetime',
        'unsubscribed_at' => 'datetime',
    ];

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($subscriber) {
            if (empty($subscriber->verification_token)) {
                $subscriber->verification_token = Str::random(64);
            }
        });
    }

    /**
     * Check if subscriber is verified.
     */
    public function isVerified(): bool
    {
        return !is_null($this->verified_at);
    }

    /**
     * Verify the subscriber.
     */
    public function verify(): void
    {
        $this->update([
            'verified_at' => now(),
            'is_active' => true,
            'verification_token' => null,
        ]);
    }

    /**
     * Unsubscribe.
     */
    public function unsubscribe(): void
    {
        $this->update([
            'is_active' => false,
            'unsubscribed_at' => now(),
        ]);
    }

    /**
     * Resubscribe.
     */
    public function resubscribe(): void
    {
        $this->update([
            'is_active' => true,
            'unsubscribed_at' => null,
        ]);
    }

    /**
     * Subscribe a new email.
     */
    public static function subscribe(string $email, ?string $name = null, ?string $source = null): self
    {
        $subscriber = static::firstOrNew(['email' => $email]);

        if ($subscriber->exists && $subscriber->is_active) {
            return $subscriber;
        }

        $subscriber->fill([
            'name' => $name,
            'source' => $source,
            'is_active' => true,
            'unsubscribed_at' => null,
        ]);

        $subscriber->save();

        return $subscriber;
    }

    /**
     * Scope for active subscribers.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for verified subscribers.
     */
    public function scopeVerified($query)
    {
        return $query->whereNotNull('verified_at');
    }

    /**
     * Scope for unverified subscribers.
     */
    public function scopeUnverified($query)
    {
        return $query->whereNull('verified_at');
    }
}
