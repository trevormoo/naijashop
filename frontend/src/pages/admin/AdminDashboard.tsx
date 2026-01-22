import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  
  Calendar,
  Sparkles,
  Activity,
  BarChart3,
  PieChart,
  Loader2,
  RefreshCw,
  ChevronRight,

  Target,
  Award,
} from 'lucide-react';

// Mock data for demonstration
const mockStats = {
  revenue: {
    total: 5000000,
    this_month: 850000,
    last_month: 755000,
    change_percentage: 12.5,
    formatted_total: '₦5,000,000',
    formatted_this_month: '₦850,000',
  },
  orders: {
    total: 1250,
    pending: 45,
    processing: 23,
    shipped: 12,
    delivered: 1150,
    cancelled: 20,
    this_month: 156,
    change_percentage: 8.3,
  },
  products: {
    total: 320,
    active: 285,
    low_stock: 18,
    out_of_stock: 7,
  },
  customers: {
    total: 890,
    new_this_month: 67,
    change_percentage: 15.2,
  },
};

const mockRecentOrders = [
  { id: 'ORD-2024-001', customer: 'Adebayo Johnson', total: 45000, status: 'pending', date: '2024-01-22', items: 3 },
  { id: 'ORD-2024-002', customer: 'Chidinma Okonkwo', total: 128500, status: 'processing', date: '2024-01-22', items: 5 },
  { id: 'ORD-2024-003', customer: 'Emmanuel Nwachukwu', total: 67000, status: 'shipped', date: '2024-01-21', items: 2 },
  { id: 'ORD-2024-004', customer: 'Fatima Ibrahim', total: 89000, status: 'delivered', date: '2024-01-21', items: 4 },
  { id: 'ORD-2024-005', customer: 'Gabriel Adekunle', total: 32000, status: 'pending', date: '2024-01-20', items: 1 },
];

const mockLowStockProducts = [
  { id: 1, name: 'iPhone 15 Pro Max', stock: 3, image: '/images/placeholder-product.png' },
  { id: 2, name: 'Samsung Galaxy S24 Ultra', stock: 5, image: '/images/placeholder-product.png' },
  { id: 3, name: 'MacBook Pro M3', stock: 2, image: '/images/placeholder-product.png' },
  { id: 4, name: 'Sony WH-1000XM5', stock: 8, image: '/images/placeholder-product.png' },
];

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  pending: { label: 'Pending', color: 'text-amber-600', bg: 'bg-amber-100', icon: Clock },
  processing: { label: 'Processing', color: 'text-blue-600', bg: 'bg-blue-100', icon: Package },
  shipped: { label: 'Shipped', color: 'text-purple-600', bg: 'bg-purple-100', icon: TrendingUp },
  delivered: { label: 'Delivered', color: 'text-emerald-600', bg: 'bg-emerald-100', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'text-red-600', bg: 'bg-red-100', icon: XCircle },
};

export default function AdminDashboard() {
  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => mockStats,
    staleTime: 60000,
  });

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const today = new Date().toLocaleDateString('en-NG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex items-center gap-2 mt-1">
            <Calendar className="w-4 h-4 text-gray-400" />
            <p className="text-gray-500 text-sm">{today}</p>
          </div>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="font-medium">Refresh</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {/* Revenue Card */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl opacity-0 group-hover:opacity-100 blur transition duration-300" />
          <div className="relative bg-white rounded-2xl p-6 shadow-lg shadow-gray-200/50 border border-gray-100/50 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full -mr-16 -mt-16" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <span className={`flex items-center gap-1 text-sm font-medium px-2.5 py-1 rounded-full ${
                  (stats?.revenue.change_percentage ?? 0) >= 0
                    ? 'text-emerald-700 bg-emerald-100'
                    : 'text-red-700 bg-red-100'
                }`}>
                  {(stats?.revenue.change_percentage ?? 0) >= 0 ? (
                    <TrendingUp className="w-3.5 h-3.5" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5" />
                  )}
                  {stats?.revenue.change_percentage}%
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">{stats?.revenue.formatted_this_month}</h3>
              <p className="text-gray-500 text-sm mt-1">Revenue this month</p>
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                  Total: <span className="text-gray-600 font-medium">{stats?.revenue.formatted_total}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Card */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-3xl opacity-0 group-hover:opacity-100 blur transition duration-300" />
          <div className="relative bg-white rounded-2xl p-6 shadow-lg shadow-gray-200/50 border border-gray-100/50 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full -mr-16 -mt-16" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
                <span className="flex items-center gap-1 text-sm font-medium px-2.5 py-1 rounded-full text-blue-700 bg-blue-100">
                  <TrendingUp className="w-3.5 h-3.5" />
                  {stats?.orders.change_percentage}%
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">{stats?.orders.this_month}</h3>
              <p className="text-gray-500 text-sm mt-1">Orders this month</p>
              <div className="mt-3 pt-3 border-t border-gray-100 flex gap-3">
                <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  {stats?.orders.pending} pending
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-blue-600">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  {stats?.orders.processing} processing
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Products Card */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl opacity-0 group-hover:opacity-100 blur transition duration-300" />
          <div className="relative bg-white rounded-2xl p-6 shadow-lg shadow-gray-200/50 border border-gray-100/50 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full -mr-16 -mt-16" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <Package className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">{stats?.products.active}</h3>
              <p className="text-gray-500 text-sm mt-1">Active products</p>
              <div className="mt-3 pt-3 border-t border-gray-100 flex gap-3">
                {(stats?.products.low_stock ?? 0) > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                    <AlertTriangle className="w-3 h-3" />
                    {stats?.products.low_stock} low stock
                  </span>
                )}
                {(stats?.products.out_of_stock ?? 0) > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs text-red-600">
                    <XCircle className="w-3 h-3" />
                    {stats?.products.out_of_stock} out
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Customers Card */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl opacity-0 group-hover:opacity-100 blur transition duration-300" />
          <div className="relative bg-white rounded-2xl p-6 shadow-lg shadow-gray-200/50 border border-gray-100/50 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full -mr-16 -mt-16" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <span className="flex items-center gap-1 text-sm font-medium px-2.5 py-1 rounded-full text-amber-700 bg-amber-100">
                  <TrendingUp className="w-3.5 h-3.5" />
                  {stats?.customers.change_percentage}%
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">{stats?.customers.total}</h3>
              <p className="text-gray-500 text-sm mt-1">Total customers</p>
              <div className="mt-3 pt-3 border-t border-gray-100">
                <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                  <Sparkles className="w-3 h-3" />
                  +{stats?.customers.new_this_month} new this month
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          to="/admin/products/create"
          className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all group"
        >
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
            <Package className="w-5 h-5 text-emerald-600 group-hover:text-white transition-colors" />
          </div>
          <span className="font-medium text-gray-700 text-sm">Add Product</span>
        </Link>
        <Link
          to="/admin/orders"
          className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group"
        >
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-500 transition-colors">
            <ShoppingCart className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" />
          </div>
          <span className="font-medium text-gray-700 text-sm">View Orders</span>
        </Link>
        <Link
          to="/admin/customers"
          className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all group"
        >
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-500 transition-colors">
            <Users className="w-5 h-5 text-purple-600 group-hover:text-white transition-colors" />
          </div>
          <span className="font-medium text-gray-700 text-sm">Customers</span>
        </Link>
        <Link
          to="/admin/reports"
          className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-amber-200 transition-all group"
        >
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center group-hover:bg-amber-500 transition-colors">
            <BarChart3 className="w-5 h-5 text-amber-600 group-hover:text-white transition-colors" />
          </div>
          <span className="font-medium text-gray-700 text-sm">Reports</span>
        </Link>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">Recent Orders</h2>
                  <p className="text-xs text-gray-500">Latest customer orders</p>
                </div>
              </div>
              <Link
                to="/admin/orders"
                className="flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                View All
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order</th>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-right py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="text-center py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {mockRecentOrders.map((order) => {
                    const config = statusConfig[order.status];
                    const StatusIcon = config.icon;
                    return (
                      <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 px-6">
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{order.id}</p>
                            <p className="text-xs text-gray-500">{order.items} item(s)</p>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-sm text-gray-900">{order.customer}</p>
                          <p className="text-xs text-gray-500">{order.date}</p>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color} ${config.bg}`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {config.label}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <p className="font-semibold text-gray-900 text-sm">₦{order.total.toLocaleString()}</p>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <Link
                            to={`/admin/orders/${order.id}`}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 text-gray-600 hover:bg-emerald-100 hover:text-emerald-600 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Low Stock Alerts */}
          <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100/50 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">Low Stock</h2>
                  <p className="text-xs text-gray-500">{mockLowStockProducts.length} products</p>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-3">
              {mockLowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-amber-50 transition-colors group">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                    <p className="text-xs text-amber-600 font-medium">{product.stock} left in stock</p>
                  </div>
                  <Link
                    to={`/admin/products/${product.id}`}
                    className="p-2 rounded-lg bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </Link>
                </div>
              ))}
            </div>

            <div className="px-5 py-3 border-t border-gray-100">
              <Link
                to="/admin/products?filter=low_stock"
                className="flex items-center justify-center gap-2 text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors"
              >
                View All Low Stock
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Performance Summary */}
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold">Store Performance</h3>
                  <p className="text-emerald-100 text-xs">This month overview</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="w-4 h-4 text-emerald-200" />
                    <span className="text-xs text-emerald-100">Conversion</span>
                  </div>
                  <p className="text-xl font-bold">3.2%</p>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Award className="w-4 h-4 text-emerald-200" />
                    <span className="text-xs text-emerald-100">Avg Order</span>
                  </div>
                  <p className="text-xl font-bold">₦45K</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-emerald-100">Monthly Target</span>
                  <span className="text-sm font-bold">85%</span>
                </div>
                <div className="mt-2 w-full bg-white/20 rounded-full h-2">
                  <div className="w-[85%] bg-white rounded-full h-2 transition-all duration-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Order Status Distribution */}
          <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100/50 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <PieChart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Order Status</h3>
                <p className="text-xs text-gray-500">Distribution overview</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="text-sm text-gray-600">Pending</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{stats?.orders.pending}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-sm text-gray-600">Processing</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{stats?.orders.processing}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-purple-500" />
                  <span className="text-sm text-gray-600">Shipped</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{stats?.orders.shipped}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-sm text-gray-600">Delivered</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{stats?.orders.delivered}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
