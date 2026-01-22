<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NewsletterSubscriber;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class NewsletterController extends Controller
{
    /**
     * Subscribe to newsletter
     */
    public function subscribe(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'name' => 'nullable|string|max:255',
            'source' => 'nullable|string|max:50',
        ]);

        $subscriber = NewsletterSubscriber::where('email', $request->email)->first();

        if ($subscriber) {
            if ($subscriber->is_active) {
                return response()->json([
                    'message' => 'You are already subscribed to our newsletter',
                ], 422);
            }

            // Reactivate subscription
            $subscriber->update([
                'is_active' => true,
                'name' => $request->name ?? $subscriber->name,
            ]);

            return response()->json([
                'message' => 'Welcome back! Your subscription has been reactivated',
            ]);
        }

        NewsletterSubscriber::create([
            'email' => $request->email,
            'name' => $request->name,
            'source' => $request->source ?? 'website',
            'token' => Str::random(32),
            'is_active' => true,
            'subscribed_at' => now(),
        ]);

        return response()->json([
            'message' => 'Thank you for subscribing to our newsletter!',
        ], 201);
    }

    /**
     * Unsubscribe from newsletter
     */
    public function unsubscribe(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'nullable|string',
        ]);

        $query = NewsletterSubscriber::where('email', $request->email);

        if ($request->token) {
            $query->where('token', $request->token);
        }

        $subscriber = $query->first();

        if (!$subscriber) {
            return response()->json([
                'message' => 'Subscriber not found',
            ], 404);
        }

        $subscriber->update([
            'is_active' => false,
            'unsubscribed_at' => now(),
        ]);

        return response()->json([
            'message' => 'You have been unsubscribed from our newsletter',
        ]);
    }

    /**
     * Check subscription status
     */
    public function status(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $subscriber = NewsletterSubscriber::where('email', $request->email)->first();

        return response()->json([
            'subscribed' => $subscriber && $subscriber->is_active,
        ]);
    }

    /**
     * Update subscriber preferences
     */
    public function updatePreferences(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required|string',
            'preferences' => 'required|array',
        ]);

        $subscriber = NewsletterSubscriber::where('email', $request->email)
            ->where('token', $request->token)
            ->first();

        if (!$subscriber) {
            return response()->json([
                'message' => 'Subscriber not found',
            ], 404);
        }

        $subscriber->update([
            'preferences' => $request->preferences,
        ]);

        return response()->json([
            'message' => 'Preferences updated successfully',
        ]);
    }
}
