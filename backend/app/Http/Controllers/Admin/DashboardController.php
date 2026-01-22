<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Http\Resources\ProductResource;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Get dashboard overview.
     */
    public function index(): JsonResponse
    {
        $stats = $this->getStats();
        $recentOrders = $this->getRecentOrders();
        $lowStockProducts = $this->getLowStockProducts();
        $salesChart = $this->getSalesChartData();

        return response()->json([
            'stats' => $stats,
            'recent_orders' => OrderResource::collection($recentOrders),
            'low_stock_products' => ProductResource::collection($lowStockProducts),
            'sales_chart' => $salesChart,
        ]);
    }

    /**
     * Get dashboard statistics.
     */
    public function stats(): JsonResponse
    {
        return response()->json([
            'stats' => $this->getStats(),
        ]);
    }

    /**
     * Get recent orders.
     */
    public function recentOrders(Request $request): JsonResponse
    {
        $limit = min($request->get('limit', 10), 50);

        $orders = Order::with(['user', 'items'])
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();

        return response()->json([
            'orders' => OrderResource::collection($orders),
        ]);
    }

    /**
     * Get low stock products.
     */
    public function lowStock(Request $request): JsonResponse
    {
        $limit = min($request->get('limit', 10), 50);

        $products = Product::with(['category', 'images'])
            ->lowStock()
            ->orWhere(function ($query) {
                $query->outOfStock();
            })
            ->orderBy('stock_quantity', 'asc')
            ->limit($limit)
            ->get();

        return response()->json([
            'products' => ProductResource::collection($products),
        ]);
    }

    /**
     * Get sales chart data.
     */
    public function salesChart(Request $request): JsonResponse
    {
        $period = $request->get('period', 'monthly'); // daily, weekly, monthly
        $chartData = $this->getSalesChartData($period);

        return response()->json([
            'chart' => $chartData,
        ]);
    }

    /**
     * Calculate dashboard statistics.
     */
    private function getStats(): array
    {
        $today = Carbon::today();
        $thisMonth = Carbon::now()->startOfMonth();
        $lastMonth = Carbon::now()->subMonth()->startOfMonth();
        $lastMonthEnd = Carbon::now()->subMonth()->endOfMonth();

        // Total revenue (all time)
        $totalRevenue = Payment::successful()->sum('amount');

        // This month's revenue
        $thisMonthRevenue = Payment::successful()
            ->where('paid_at', '>=', $thisMonth)
            ->sum('amount');

        // Last month's revenue
        $lastMonthRevenue = Payment::successful()
            ->whereBetween('paid_at', [$lastMonth, $lastMonthEnd])
            ->sum('amount');

        // Revenue change percentage
        $revenueChange = $lastMonthRevenue > 0
            ? round((($thisMonthRevenue - $lastMonthRevenue) / $lastMonthRevenue) * 100, 1)
            : 100;

        // Orders statistics
        $totalOrders = Order::count();
        $pendingOrders = Order::status(Order::STATUS_PENDING)->count();
        $processingOrders = Order::status(Order::STATUS_PROCESSING)->count();

        // This month's orders
        $thisMonthOrders = Order::where('created_at', '>=', $thisMonth)->count();
        $lastMonthOrders = Order::whereBetween('created_at', [$lastMonth, $lastMonthEnd])->count();

        $ordersChange = $lastMonthOrders > 0
            ? round((($thisMonthOrders - $lastMonthOrders) / $lastMonthOrders) * 100, 1)
            : 100;

        // Products statistics
        $totalProducts = Product::count();
        $activeProducts = Product::active()->count();
        $lowStockProducts = Product::lowStock()->count();
        $outOfStockProducts = Product::outOfStock()->count();

        // Customers statistics
        $totalCustomers = User::customers()->count();
        $newCustomersThisMonth = User::customers()
            ->where('created_at', '>=', $thisMonth)
            ->count();
        $newCustomersLastMonth = User::customers()
            ->whereBetween('created_at', [$lastMonth, $lastMonthEnd])
            ->count();

        $customersChange = $newCustomersLastMonth > 0
            ? round((($newCustomersThisMonth - $newCustomersLastMonth) / $newCustomersLastMonth) * 100, 1)
            : 100;

        // Today's stats
        $todayOrders = Order::where('created_at', '>=', $today)->count();
        $todayRevenue = Payment::successful()
            ->where('paid_at', '>=', $today)
            ->sum('amount');

        return [
            'revenue' => [
                'total' => $totalRevenue,
                'this_month' => $thisMonthRevenue,
                'today' => $todayRevenue,
                'change_percentage' => $revenueChange,
                'formatted_total' => config('app.currency_symbol') . number_format($totalRevenue, 2),
                'formatted_this_month' => config('app.currency_symbol') . number_format($thisMonthRevenue, 2),
                'formatted_today' => config('app.currency_symbol') . number_format($todayRevenue, 2),
            ],
            'orders' => [
                'total' => $totalOrders,
                'pending' => $pendingOrders,
                'processing' => $processingOrders,
                'this_month' => $thisMonthOrders,
                'today' => $todayOrders,
                'change_percentage' => $ordersChange,
            ],
            'products' => [
                'total' => $totalProducts,
                'active' => $activeProducts,
                'low_stock' => $lowStockProducts,
                'out_of_stock' => $outOfStockProducts,
            ],
            'customers' => [
                'total' => $totalCustomers,
                'new_this_month' => $newCustomersThisMonth,
                'change_percentage' => $customersChange,
            ],
        ];
    }

    /**
     * Get sales chart data.
     */
    private function getSalesChartData(string $period = 'monthly'): array
    {
        $data = [];

        switch ($period) {
            case 'daily':
                // Last 30 days
                for ($i = 29; $i >= 0; $i--) {
                    $date = Carbon::now()->subDays($i);
                    $revenue = Payment::successful()
                        ->whereDate('paid_at', $date)
                        ->sum('amount');

                    $data[] = [
                        'label' => $date->format('M d'),
                        'value' => (float) $revenue,
                    ];
                }
                break;

            case 'weekly':
                // Last 12 weeks
                for ($i = 11; $i >= 0; $i--) {
                    $startOfWeek = Carbon::now()->subWeeks($i)->startOfWeek();
                    $endOfWeek = Carbon::now()->subWeeks($i)->endOfWeek();

                    $revenue = Payment::successful()
                        ->whereBetween('paid_at', [$startOfWeek, $endOfWeek])
                        ->sum('amount');

                    $data[] = [
                        'label' => $startOfWeek->format('M d'),
                        'value' => (float) $revenue,
                    ];
                }
                break;

            case 'monthly':
            default:
                // Last 12 months
                for ($i = 11; $i >= 0; $i--) {
                    $month = Carbon::now()->subMonths($i);
                    $revenue = Payment::successful()
                        ->whereYear('paid_at', $month->year)
                        ->whereMonth('paid_at', $month->month)
                        ->sum('amount');

                    $data[] = [
                        'label' => $month->format('M Y'),
                        'value' => (float) $revenue,
                    ];
                }
                break;
        }

        return $data;
    }

    /**
     * Get recent orders.
     */
    private function getRecentOrders()
    {
        return Order::with(['user', 'items'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();
    }

    /**
     * Get low stock products.
     */
    private function getLowStockProducts()
    {
        return Product::with(['category', 'images'])
            ->where(function ($query) {
                $query->lowStock()->orWhere(function ($q) {
                    $q->outOfStock();
                });
            })
            ->orderBy('stock_quantity', 'asc')
            ->limit(10)
            ->get();
    }
}
