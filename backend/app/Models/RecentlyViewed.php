<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RecentlyViewed extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'recently_viewed';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'session_id',
        'product_id',
        'viewed_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'viewed_at' => 'datetime',
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
     * Record a product view.
     */
    public static function recordView(int $productId, ?int $userId = null, ?string $sessionId = null, int $maxItems = 20): void
    {
        // Delete existing entry for this product
        static::where('product_id', $productId)
            ->where(function ($query) use ($userId, $sessionId) {
                if ($userId) {
                    $query->where('user_id', $userId);
                } else {
                    $query->where('session_id', $sessionId);
                }
            })
            ->delete();

        // Create new entry
        static::create([
            'user_id' => $userId,
            'session_id' => $sessionId,
            'product_id' => $productId,
            'viewed_at' => now(),
        ]);

        // Keep only the most recent items
        $query = static::query();
        if ($userId) {
            $query->where('user_id', $userId);
        } else {
            $query->where('session_id', $sessionId);
        }

        $count = $query->count();
        if ($count > $maxItems) {
            $query->orderBy('viewed_at', 'asc')
                ->limit($count - $maxItems)
                ->delete();
        }
    }

    /**
     * Get recently viewed products for user or session.
     */
    public static function getRecentProducts(?int $userId = null, ?string $sessionId = null, int $limit = 10)
    {
        $query = static::with('product.images')
            ->whereHas('product', function ($q) {
                $q->where('is_active', true);
            });

        if ($userId) {
            $query->where('user_id', $userId);
        } else {
            $query->where('session_id', $sessionId);
        }

        return $query->orderByDesc('viewed_at')
            ->limit($limit)
            ->get()
            ->pluck('product');
    }

    /**
     * Merge session views with user views.
     */
    public static function mergeSessionToUser(string $sessionId, int $userId): void
    {
        static::where('session_id', $sessionId)
            ->update([
                'user_id' => $userId,
                'session_id' => null,
            ]);
    }
}
