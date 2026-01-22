<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReviewResource;
use App\Models\Order;
use App\Models\Product;
use App\Models\Review;
use App\Models\ReviewVote;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    /**
     * Get reviews for a product
     */
    public function index(Request $request, Product $product): JsonResponse
    {
        $reviews = $product->reviews()
            ->with('user')
            ->where('is_approved', true)
            ->latest()
            ->paginate(10);

        return response()->json([
            'data' => ReviewResource::collection($reviews),
            'meta' => [
                'current_page' => $reviews->currentPage(),
                'last_page' => $reviews->lastPage(),
                'per_page' => $reviews->perPage(),
                'total' => $reviews->total(),
            ],
            'summary' => [
                'average_rating' => round($product->average_rating, 1),
                'total_reviews' => $product->review_count,
                'rating_breakdown' => $this->getRatingBreakdown($product),
            ],
        ]);
    }

    /**
     * Store a new review
     */
    public function store(Request $request, Product $product): JsonResponse
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'title' => 'nullable|string|max:255',
            'comment' => 'required|string|max:2000',
        ]);

        // Check if user has purchased this product
        $hasPurchased = Order::where('user_id', $request->user()->id)
            ->where('status', 'delivered')
            ->whereHas('items', function ($query) use ($product) {
                $query->where('product_id', $product->id);
            })
            ->exists();

        // Check if user already reviewed this product
        $existingReview = Review::where('user_id', $request->user()->id)
            ->where('product_id', $product->id)
            ->first();

        if ($existingReview) {
            return response()->json([
                'message' => 'You have already reviewed this product',
            ], 422);
        }

        $review = Review::create([
            'user_id' => $request->user()->id,
            'product_id' => $product->id,
            'rating' => $request->rating,
            'title' => $request->title,
            'comment' => $request->comment,
            'is_verified_purchase' => $hasPurchased,
            'is_approved' => true, // Auto-approve for now
        ]);

        return response()->json([
            'message' => 'Review submitted successfully',
            'data' => new ReviewResource($review->load('user')),
        ], 201);
    }

    /**
     * Update a review
     */
    public function update(Request $request, Review $review): JsonResponse
    {
        if ($review->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        }

        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'title' => 'nullable|string|max:255',
            'comment' => 'required|string|max:2000',
        ]);

        $review->update([
            'rating' => $request->rating,
            'title' => $request->title,
            'comment' => $request->comment,
        ]);

        return response()->json([
            'message' => 'Review updated successfully',
            'data' => new ReviewResource($review->load('user')),
        ]);
    }

    /**
     * Delete a review
     */
    public function destroy(Request $request, Review $review): JsonResponse
    {
        if ($review->user_id !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        }

        $review->delete();

        return response()->json([
            'message' => 'Review deleted successfully',
        ]);
    }

    /**
     * Vote on a review (helpful/not helpful)
     */
    public function vote(Request $request, Review $review): JsonResponse
    {
        $request->validate([
            'is_helpful' => 'required|boolean',
        ]);

        $vote = ReviewVote::updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'review_id' => $review->id,
            ],
            [
                'is_helpful' => $request->is_helpful,
            ]
        );

        // Update review helpful counts
        $review->helpful_count = $review->votes()->where('is_helpful', true)->count();
        $review->not_helpful_count = $review->votes()->where('is_helpful', false)->count();
        $review->save();

        return response()->json([
            'message' => 'Vote recorded',
            'helpful_count' => $review->helpful_count,
            'not_helpful_count' => $review->not_helpful_count,
        ]);
    }

    /**
     * Get user's reviews
     */
    public function userReviews(Request $request): JsonResponse
    {
        $reviews = Review::with(['product', 'user'])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->paginate(10);

        return response()->json([
            'data' => ReviewResource::collection($reviews),
            'meta' => [
                'current_page' => $reviews->currentPage(),
                'last_page' => $reviews->lastPage(),
                'per_page' => $reviews->perPage(),
                'total' => $reviews->total(),
            ],
        ]);
    }

    /**
     * Check if user can review a product
     */
    public function canReview(Request $request, Product $product): JsonResponse
    {
        $existingReview = Review::where('user_id', $request->user()->id)
            ->where('product_id', $product->id)
            ->first();

        $hasPurchased = Order::where('user_id', $request->user()->id)
            ->where('status', 'delivered')
            ->whereHas('items', function ($query) use ($product) {
                $query->where('product_id', $product->id);
            })
            ->exists();

        return response()->json([
            'can_review' => !$existingReview,
            'has_reviewed' => (bool) $existingReview,
            'has_purchased' => $hasPurchased,
            'existing_review' => $existingReview ? new ReviewResource($existingReview) : null,
        ]);
    }

    /**
     * Get reviews for a product (public route alias)
     */
    public function productReviews(Request $request, Product $product): JsonResponse
    {
        return $this->index($request, $product);
    }

    /**
     * Admin: Get all reviews
     */
    public function adminIndex(Request $request): JsonResponse
    {
        $query = Review::with(['user', 'product']);

        if ($request->has('status')) {
            if ($request->status === 'pending') {
                $query->where('is_approved', false);
            } elseif ($request->status === 'approved') {
                $query->where('is_approved', true);
            }
        }

        if ($request->has('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        $reviews = $query->latest()->paginate(20);

        return response()->json([
            'data' => ReviewResource::collection($reviews),
            'meta' => [
                'current_page' => $reviews->currentPage(),
                'last_page' => $reviews->lastPage(),
                'per_page' => $reviews->perPage(),
                'total' => $reviews->total(),
            ],
        ]);
    }

    /**
     * Admin: Approve a review
     */
    public function approve(Review $review): JsonResponse
    {
        $review->update(['is_approved' => true]);

        return response()->json([
            'message' => 'Review approved',
            'data' => new ReviewResource($review),
        ]);
    }

    /**
     * Admin: Reject a review
     */
    public function reject(Review $review): JsonResponse
    {
        $review->update(['is_approved' => false]);

        return response()->json([
            'message' => 'Review rejected',
            'data' => new ReviewResource($review),
        ]);
    }

    /**
     * Admin: Respond to a review
     */
    public function respond(Request $request, Review $review): JsonResponse
    {
        $request->validate([
            'response' => 'required|string|max:1000',
        ]);

        $review->update([
            'admin_response' => $request->response,
            'admin_responded_at' => now(),
        ]);

        return response()->json([
            'message' => 'Response added',
            'data' => new ReviewResource($review),
        ]);
    }

    /**
     * Get rating breakdown for a product
     */
    private function getRatingBreakdown(Product $product): array
    {
        $breakdown = [];
        $total = $product->review_count ?: 1;

        for ($i = 5; $i >= 1; $i--) {
            $count = $product->reviews()->where('rating', $i)->where('is_approved', true)->count();
            $breakdown[$i] = [
                'count' => $count,
                'percentage' => round(($count / $total) * 100),
            ];
        }

        return $breakdown;
    }
}
