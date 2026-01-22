import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  ChevronRight,
  Search,
  Filter,
  Loader2,
  ShoppingBag,
  Sparkles,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  RefreshCw,
  ChevronLeft,
} from 'lucide-react';
import { ordersApi } from '@/services/api';
import { Order } from '@/types';

const statusConfig: Record<string, { bg: string; text: string; icon: any; label: string }> = {
  pending: { bg: 'bg-amber-50', text: 'text-amber-700', icon: Clock, label: 'Pending' },
  confirmed: { bg: 'bg-blue-50', text: 'text-blue-700', icon: CheckCircle, label: 'Confirmed' },
  processing: { bg: 'bg-indigo-50', text: 'text-indigo-700', icon: Package, label: 'Processing' },
  shipped: { bg: 'bg-purple-50', text: 'text-purple-700', icon: Truck, label: 'Shipped' },
  delivered: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: CheckCircle, label: 'Delivered' },
  cancelled: { bg: 'bg-red-50', text: 'text-red-700', icon: XCircle, label: 'Cancelled' },
  refunded: { bg: 'bg-gray-100', text: 'text-gray-700', icon: RefreshCw, label: 'Refunded' },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [currentPage, statusFilter]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await ordersApi.getAll({
        page: currentPage,
        status: statusFilter || undefined,
      });
      const res = response as any;
      setOrders(res.data.data);
      setTotalPages(res.data.meta.last_page);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredOrders = searchQuery
    ? orders.filter(
        (order) =>
          order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.items?.some((item) =>
            item.product?.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
      )
    : orders;

  if (isLoading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/30 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/30 py-8">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/profile"
            className="inline-flex items-center gap-1 text-gray-500 hover:text-emerald-600 text-sm mb-2 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Profile
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-500 mt-1">Track and manage your orders</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100/50 p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by order number or product..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white transition-all"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <Filter className="w-5 h-5 text-gray-400" />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full sm:w-48 pl-12 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none cursor-pointer transition-all"
              >
                <option value="">All Orders</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 rotate-90 pointer-events-none" />
            </div>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100/50 p-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl mx-auto mb-6 flex items-center justify-center">
              <ShoppingBag className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No orders found</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              {statusFilter
                ? `You don't have any ${statusFilter} orders at the moment.`
                : "You haven't placed any orders yet. Start shopping to see your orders here!"}
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300"
            >
              <Sparkles className="w-5 h-5" />
              Start Shopping
            </Link>
          </div>
        ) : (
          <>
            {/* Orders List */}
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const status = statusConfig[order.status] || statusConfig.pending;
                const StatusIcon = status.icon;

                return (
                  <Link
                    key={order.id}
                    to={`/orders/${order.id}`}
                    className="block bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100/50 hover:shadow-xl transition-all duration-300 group"
                  >
                    <div className="p-5 sm:p-6">
                      {/* Order Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-lg text-gray-900">{order.order_number}</h3>
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-sm font-medium ${status.bg} ${status.text}`}
                            >
                              <StatusIcon className="w-4 h-4" />
                              {status.label}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            Placed on{' '}
                            {new Date(order.created_at).toLocaleDateString('en-NG', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                            ₦{order.total.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-500">
                            {order.items?.length || 0} {(order.items?.length || 0) === 1 ? 'item' : 'items'}
                          </p>
                        </div>
                      </div>

                      {/* Order Items Preview */}
                      <div className="flex items-center gap-3 overflow-x-auto pb-2">
                        {order.items?.slice(0, 4).map((item) => (
                          <div
                            key={item.id}
                            className="relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border border-gray-100 bg-gray-50"
                          >
                            <img
                              src={item.product?.primary_image || '/images/placeholder-product.png'}
                              alt={item.product?.name || 'Product'}
                              className="w-full h-full object-cover"
                            />
                            {item.quantity > 1 && (
                              <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                {item.quantity}
                              </span>
                            )}
                          </div>
                        ))}
                        {(order.items?.length || 0) > 4 && (
                          <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              +{(order.items?.length || 0) - 4}
                            </span>
                          </div>
                        )}
                        <div className="flex-1" />
                        <div className="flex-shrink-0 w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                          <ChevronRight className="w-5 h-5 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-xl font-medium transition-all ${
                          currentPage === pageNum
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30'
                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
