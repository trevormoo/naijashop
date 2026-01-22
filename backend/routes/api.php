<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\CouponController;
use App\Http\Controllers\Api\NewsletterController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\WishlistController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\AdminOrderController;
use App\Http\Controllers\Admin\AdminProductController;
use App\Http\Controllers\Admin\AdminCategoryController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\Admin\AdminCouponController;
use App\Http\Controllers\Admin\AdminReportController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Health check endpoint (no rate limiting)
Route::get('/health', function () {
    return response()->json([
        'status' => 'healthy',
        'timestamp' => now()->toIso8601String(),
        'version' => config('app.version', '1.0.0'),
    ]);
});

// Rate limiting: 60 requests per minute for guests, 120 for authenticated users
Route::middleware(['throttle:api'])->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Public Routes (No Authentication Required)
    |--------------------------------------------------------------------------
    */

    // Authentication
    Route::prefix('auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login']);
        Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
        Route::post('/reset-password', [AuthController::class, 'resetPassword']);
        Route::get('/verify-email/{id}/{hash}', [AuthController::class, 'verifyEmail'])
            ->name('verification.verify');
    });

    // Categories (Public)
    Route::prefix('categories')->group(function () {
        Route::get('/', [CategoryController::class, 'index']);
        Route::get('/tree', [CategoryController::class, 'tree']);
        Route::get('/featured', [CategoryController::class, 'featured']);
        Route::get('/{category:slug}', [CategoryController::class, 'show']);
        Route::get('/{category:slug}/products', [CategoryController::class, 'products']);
    });

    // Products (Public)
    Route::prefix('products')->group(function () {
        Route::get('/', [ProductController::class, 'index']);
        Route::get('/featured', [ProductController::class, 'featured']);
        Route::get('/search', [ProductController::class, 'search']);
        Route::get('/{product:slug}', [ProductController::class, 'show']);
        Route::get('/{product:slug}/related', [ProductController::class, 'related']);
        Route::get('/{product:slug}/reviews', [ReviewController::class, 'productReviews']);
    });

    // Cart (Public - Session Based)
    Route::prefix('cart')->group(function () {
        Route::get('/', [CartController::class, 'index']);
        Route::post('/add', [CartController::class, 'add']);
        Route::put('/update/{cartItem}', [CartController::class, 'update']);
        Route::delete('/remove/{cartItem}', [CartController::class, 'remove']);
        Route::delete('/clear', [CartController::class, 'clear']);
        Route::post('/apply-coupon', [CartController::class, 'applyCoupon']);
        Route::delete('/remove-coupon', [CartController::class, 'removeCoupon']);
    });

    // Coupons (Public - Validation)
    Route::post('/coupons/validate', [CouponController::class, 'validate']);

    // Newsletter
    Route::prefix('newsletter')->group(function () {
        Route::post('/subscribe', [NewsletterController::class, 'subscribe']);
        Route::get('/unsubscribe/{token}', [NewsletterController::class, 'unsubscribe']);
    });

    /*
    |--------------------------------------------------------------------------
    | Protected Routes (Authentication Required)
    |--------------------------------------------------------------------------
    */

    Route::middleware(['auth:sanctum'])->group(function () {

        // Auth
        Route::prefix('auth')->group(function () {
            Route::get('/user', [AuthController::class, 'user']);
            Route::put('/profile', [AuthController::class, 'updateProfile']);
            Route::put('/change-password', [AuthController::class, 'changePassword']);
            Route::post('/logout', [AuthController::class, 'logout']);
            Route::post('/logout-all', [AuthController::class, 'logoutAll']);
            Route::post('/resend-verification', [AuthController::class, 'resendVerification']);
        });

        // Wishlist
        Route::prefix('wishlist')->group(function () {
            Route::get('/', [WishlistController::class, 'index']);
            Route::post('/toggle/{product}', [WishlistController::class, 'toggle']);
            Route::delete('/remove/{product}', [WishlistController::class, 'remove']);
            Route::delete('/clear', [WishlistController::class, 'clear']);
            Route::post('/move-to-cart/{product}', [WishlistController::class, 'moveToCart']);
        });

        // Reviews
        Route::prefix('reviews')->group(function () {
            Route::post('/', [ReviewController::class, 'store']);
            Route::put('/{review}', [ReviewController::class, 'update']);
            Route::delete('/{review}', [ReviewController::class, 'destroy']);
            Route::post('/{review}/vote', [ReviewController::class, 'vote']);
        });

        // Orders
        Route::prefix('orders')->group(function () {
            Route::get('/', [OrderController::class, 'index']);
            Route::get('/{order}', [OrderController::class, 'show']);
            Route::post('/{order}/cancel', [OrderController::class, 'cancel']);
            Route::get('/{order}/invoice', [OrderController::class, 'invoice']);
            Route::get('/{order}/track', [OrderController::class, 'track']);
        });

        // Checkout
        Route::prefix('checkout')->group(function () {
            Route::post('/', [CheckoutController::class, 'process']);
            Route::get('/summary', [CheckoutController::class, 'summary']);
        });

        // Payments
        Route::prefix('payments')->group(function () {
            Route::post('/initialize', [PaymentController::class, 'initialize']);
            Route::get('/verify/{reference}', [PaymentController::class, 'verify']);
            Route::get('/callback', [PaymentController::class, 'callback']);
        });

        // Recently Viewed
        Route::get('/recently-viewed', [ProductController::class, 'recentlyViewed']);

        /*
        |--------------------------------------------------------------------------
        | Admin Routes
        |--------------------------------------------------------------------------
        */

        Route::middleware(['admin'])->prefix('admin')->group(function () {

            // Dashboard
            Route::get('/dashboard', [DashboardController::class, 'index']);
            Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
            Route::get('/dashboard/recent-orders', [DashboardController::class, 'recentOrders']);
            Route::get('/dashboard/low-stock', [DashboardController::class, 'lowStock']);
            Route::get('/dashboard/sales-chart', [DashboardController::class, 'salesChart']);

            // Products Management
            Route::apiResource('products', AdminProductController::class);
            Route::post('/products/{product}/images', [AdminProductController::class, 'uploadImages']);
            Route::delete('/products/{product}/images/{image}', [AdminProductController::class, 'deleteImage']);
            Route::put('/products/{product}/images/{image}/primary', [AdminProductController::class, 'setPrimaryImage']);
            Route::post('/products/bulk-action', [AdminProductController::class, 'bulkAction']);

            // Categories Management
            Route::apiResource('categories', AdminCategoryController::class);
            Route::put('/categories/{category}/sort', [AdminCategoryController::class, 'updateSort']);

            // Orders Management
            Route::apiResource('orders', AdminOrderController::class)->only(['index', 'show', 'update']);
            Route::put('/orders/{order}/status', [AdminOrderController::class, 'updateStatus']);
            Route::post('/orders/{order}/refund', [AdminOrderController::class, 'refund']);

            // Users Management
            Route::apiResource('users', AdminUserController::class);
            Route::put('/users/{user}/toggle-active', [AdminUserController::class, 'toggleActive']);

            // Coupons Management
            Route::apiResource('coupons', AdminCouponController::class);
            Route::put('/coupons/{coupon}/toggle-active', [AdminCouponController::class, 'toggleActive']);

            // Reports
            Route::prefix('reports')->group(function () {
                Route::get('/sales', [AdminReportController::class, 'sales']);
                Route::get('/products', [AdminReportController::class, 'products']);
                Route::get('/customers', [AdminReportController::class, 'customers']);
                Route::get('/export/orders', [AdminReportController::class, 'exportOrders']);
            });

            // Reviews Management
            Route::get('/reviews', [ReviewController::class, 'adminIndex']);
            Route::put('/reviews/{review}/approve', [ReviewController::class, 'approve']);
            Route::put('/reviews/{review}/reject', [ReviewController::class, 'reject']);
            Route::post('/reviews/{review}/respond', [ReviewController::class, 'respond']);
        });
    });

    // Paystack Webhook (No Auth, but verified by signature)
    Route::post('/webhooks/paystack', [PaymentController::class, 'webhook']);
});
