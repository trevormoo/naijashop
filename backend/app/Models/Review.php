<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Review extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'product_id',
        'order_id',
        'rating',
        'title',
        'comment',
        'is_verified_purchase',
        'is_approved',
        'is_featured',
        'helpful_votes',
        'not_helpful_votes',
        'admin_response',
        'admin_responded_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'rating' => 'integer',
        'is_verified_purchase' => 'boolean',
        'is_approved' => 'boolean',
        'is_featured' => 'boolean',
        'admin_responded_at' => 'datetime',
    ];

    /**
     * Get the user.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the product.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the order.
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get the votes.
     */
    public function votes(): HasMany
    {
        return $this->hasMany(ReviewVote::class);
    }

    /**
     * Check if user has voted on this review.
     */
    public function hasUserVoted(int $userId): bool
    {
        return $this->votes()->where('user_id', $userId)->exists();
    }

    /**
     * Get user's vote on this review.
     */
    public function getUserVote(int $userId): ?ReviewVote
    {
        return $this->votes()->where('user_id', $userId)->first();
    }

    /**
     * Add helpful vote.
     */
    public function addHelpfulVote(int $userId): void
    {
        $this->votes()->updateOrCreate(
            ['user_id' => $userId],
            ['is_helpful' => true]
        );

        $this->updateVoteCounts();
    }

    /**
     * Add not helpful vote.
     */
    public function addNotHelpfulVote(int $userId): void
    {
        $this->votes()->updateOrCreate(
            ['user_id' => $userId],
            ['is_helpful' => false]
        );

        $this->updateVoteCounts();
    }

    /**
     * Update vote counts.
     */
    public function updateVoteCounts(): void
    {
        $this->update([
            'helpful_votes' => $this->votes()->where('is_helpful', true)->count(),
            'not_helpful_votes' => $this->votes()->where('is_helpful', false)->count(),
        ]);
    }

    /**
     * Approve the review.
     */
    public function approve(): void
    {
        $this->update(['is_approved' => true]);
        $this->product->updateRating();
    }

    /**
     * Reject the review.
     */
    public function reject(): void
    {
        $this->update(['is_approved' => false]);
        $this->product->updateRating();
    }

    /**
     * Add admin response.
     */
    public function addAdminResponse(string $response): void
    {
        $this->update([
            'admin_response' => $response,
            'admin_responded_at' => now(),
        ]);
    }

    /**
     * Get helpfulness percentage.
     */
    public function getHelpfulnessPercentageAttribute(): ?int
    {
        $totalVotes = $this->helpful_votes + $this->not_helpful_votes;

        if ($totalVotes === 0) {
            return null;
        }

        return (int) round(($this->helpful_votes / $totalVotes) * 100);
    }

    /**
     * Scope for approved reviews.
     */
    public function scopeApproved($query)
    {
        return $query->where('is_approved', true);
    }

    /**
     * Scope for pending reviews.
     */
    public function scopePending($query)
    {
        return $query->where('is_approved', false);
    }

    /**
     * Scope for verified purchases.
     */
    public function scopeVerifiedPurchase($query)
    {
        return $query->where('is_verified_purchase', true);
    }

    /**
     * Scope for featured reviews.
     */
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    /**
     * Scope for rating.
     */
    public function scopeWithRating($query, int $rating)
    {
        return $query->where('rating', $rating);
    }

    /**
     * Scope ordered by most helpful.
     */
    public function scopeMostHelpful($query)
    {
        return $query->orderByDesc('helpful_votes');
    }
}
