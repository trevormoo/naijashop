<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminReportController extends Controller
{
    /**
     * Sales report
     */
    public function sales(Request $request): JsonResponse
    {
        $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'period' => 'nullable|in:daily,weekly,monthly,yearly',
        ]);

        $startDate = $request->start_date ? Carbon::parse($request->start_date) : now()->subDays(30);
        $endDate = $request->end_date ? Carbon::parse($request->end_date) : now();
        $period = $request->period ?? 'daily';

        $query = Order::where('payment_status', 'paid')
            ->whereBetween('created_at', [$startDate, $endDate]);

        // Get overall stats
        $totalSales = (clone $query)->sum('total');
        $totalOrders = (clone $query)->count();
        $averageOrderValue = $totalOrders > 0 ? $totalSales / $totalOrders : 0;

        // Get sales by period
        $format = match ($period) {
            'daily' => '%Y-%m-%d',
            'weekly' => '%Y-%u',
            'monthly' => '%Y-%m',
            'yearly' => '%Y',
        };

        $salesByPeriod = (clone $query)
            ->select(
                DB::raw("DATE_FORMAT(created_at, '{$format}') as period"),
                DB::raw('SUM(total) as total_sales'),
                DB::raw('COUNT(*) as total_orders')
            )
            ->groupBy('period')
            ->orderBy('period')
            ->get();

        // Get sales by category
        $salesByCategory = DB::table('order_items')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->join('products', 'products.id', '=', 'order_items.product_id')
            ->join('categories', 'categories.id', '=', 'products.category_id')
            ->where('orders.payment_status', 'paid')
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->select(
                'categories.name',
                DB::raw('SUM(order_items.quantity * order_items.price) as total_sales'),
                DB::raw('SUM(order_items.quantity) as total_quantity')
            )
            ->groupBy('categories.id', 'categories.name')
            ->orderByDesc('total_sales')
            ->limit(10)
            ->get();

        return response()->json([
            'summary' => [
                'total_sales' => $totalSales,
                'formatted_total_sales' => '₦' . number_format($totalSales),
                'total_orders' => $totalOrders,
                'average_order_value' => round($averageOrderValue, 2),
                'formatted_average_order_value' => '₦' . number_format($averageOrderValue),
            ],
            'sales_by_period' => $salesByPeriod,
            'sales_by_category' => $salesByCategory,
            'period' => [
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
                'grouping' => $period,
            ],
        ]);
    }

    /**
     * Products report
     */
    public function products(Request $request): JsonResponse
    {
        $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        $startDate = $request->start_date ? Carbon::parse($request->start_date) : now()->subDays(30);
        $endDate = $request->end_date ? Carbon::parse($request->end_date) : now();

        // Top selling products
        $topSellingProducts = DB::table('order_items')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->join('products', 'products.id', '=', 'order_items.product_id')
            ->where('orders.payment_status', 'paid')
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->select(
                'products.id',
                'products.name',
                'products.slug',
                DB::raw('SUM(order_items.quantity) as total_sold'),
                DB::raw('SUM(order_items.quantity * order_items.price) as total_revenue')
            )
            ->groupBy('products.id', 'products.name', 'products.slug')
            ->orderByDesc('total_sold')
            ->limit(20)
            ->get();

        // Low stock products
        $lowStockProducts = Product::where('stock_quantity', '<=', 10)
            ->where('stock_quantity', '>', 0)
            ->select('id', 'name', 'slug', 'stock_quantity')
            ->orderBy('stock_quantity')
            ->limit(20)
            ->get();

        // Out of stock products
        $outOfStockProducts = Product::where('stock_quantity', 0)
            ->select('id', 'name', 'slug')
            ->limit(20)
            ->get();

        // Products with no sales
        $productsWithNoSales = Product::whereDoesntHave('orderItems', function ($query) use ($startDate, $endDate) {
            $query->whereHas('order', function ($q) use ($startDate, $endDate) {
                $q->where('payment_status', 'paid')
                    ->whereBetween('created_at', [$startDate, $endDate]);
            });
        })
            ->select('id', 'name', 'slug', 'created_at')
            ->limit(20)
            ->get();

        return response()->json([
            'top_selling' => $topSellingProducts,
            'low_stock' => $lowStockProducts,
            'out_of_stock' => $outOfStockProducts,
            'no_sales' => $productsWithNoSales,
            'period' => [
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
            ],
        ]);
    }

    /**
     * Customers report
     */
    public function customers(Request $request): JsonResponse
    {
        $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        $startDate = $request->start_date ? Carbon::parse($request->start_date) : now()->subDays(30);
        $endDate = $request->end_date ? Carbon::parse($request->end_date) : now();

        // New customers
        $newCustomers = User::where('role', 'customer')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();

        // Total customers
        $totalCustomers = User::where('role', 'customer')->count();

        // Top customers
        $topCustomers = User::where('role', 'customer')
            ->withCount(['orders' => function ($query) use ($startDate, $endDate) {
                $query->where('payment_status', 'paid')
                    ->whereBetween('created_at', [$startDate, $endDate]);
            }])
            ->withSum(['orders' => function ($query) use ($startDate, $endDate) {
                $query->where('payment_status', 'paid')
                    ->whereBetween('created_at', [$startDate, $endDate]);
            }], 'total')
            ->having('orders_count', '>', 0)
            ->orderByDesc('orders_sum_total')
            ->limit(20)
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->full_name,
                    'email' => $user->email,
                    'total_orders' => $user->orders_count,
                    'total_spent' => $user->orders_sum_total ?? 0,
                    'formatted_total_spent' => '₦' . number_format($user->orders_sum_total ?? 0),
                ];
            });

        // Customers by registration date
        $customersByDate = User::where('role', 'customer')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as count')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json([
            'summary' => [
                'total_customers' => $totalCustomers,
                'new_customers' => $newCustomers,
            ],
            'top_customers' => $topCustomers,
            'customers_by_date' => $customersByDate,
            'period' => [
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
            ],
        ]);
    }

    /**
     * Export orders
     */
    public function exportOrders(Request $request): JsonResponse
    {
        $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'status' => 'nullable|string',
        ]);

        $startDate = $request->start_date ? Carbon::parse($request->start_date) : now()->subDays(30);
        $endDate = $request->end_date ? Carbon::parse($request->end_date) : now();

        $query = Order::with(['user', 'items.product'])
            ->whereBetween('created_at', [$startDate, $endDate]);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $orders = $query->get()->map(function ($order) {
            return [
                'order_number' => $order->order_number,
                'customer_name' => $order->user->full_name ?? 'Guest',
                'customer_email' => $order->user->email ?? 'N/A',
                'date' => $order->created_at->format('Y-m-d H:i:s'),
                'status' => $order->status,
                'payment_status' => $order->payment_status,
                'subtotal' => $order->subtotal,
                'discount' => $order->discount_amount,
                'shipping' => $order->shipping_cost,
                'total' => $order->total,
                'items_count' => $order->items->count(),
                'shipping_address' => $order->shipping_address,
            ];
        });

        return response()->json([
            'data' => $orders,
            'count' => $orders->count(),
            'period' => [
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
            ],
        ]);
    }
}
