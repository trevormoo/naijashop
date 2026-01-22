<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReviewResource extends JsonResource
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
            'rating' => $this->rating,
            'title' => $this->title,
            'comment' => $this->comment,
            'is_verified_purchase' => $this->is_verified_purchase,
            'is_approved' => $this->is_approved,
            'is_featured' => $this->is_featured,
            'helpful_votes' => $this->helpful_votes,
            'not_helpful_votes' => $this->not_helpful_votes,
            'helpfulness_percentage' => $this->helpfulness_percentage,
            'admin_response' => $this->admin_response,
            'admin_responded_at' => $this->admin_responded_at?->toISOString(),

            // User info (limited for privacy)
            'user' => [
                'id' => $this->user->id,
                'name' => $this->user->first_name . ' ' . substr($this->user->last_name, 0, 1) . '.',
                'avatar' => $this->user->avatar ? asset('storage/' . $this->user->avatar) : null,
            ],

            // Full user for admin
            'user_full' => $this->when(
                $request->user()?->isAdmin(),
                fn() => new UserResource($this->user)
            ),

            // Product (when viewing user's reviews)
            'product' => new ProductResource($this->whenLoaded('product')),

            // Vote status for current user
            'user_vote' => $this->when(
                auth()->check(),
                fn() => $this->getUserVote(auth()->id())?->is_helpful
            ),

            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
        ];
    }
}
