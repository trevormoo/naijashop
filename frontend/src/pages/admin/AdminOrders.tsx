import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../services/api';
import {
  Package,
  Search,
  Eye,
  Loader2,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  ChevronLeft,
  ChevronRight,
  X,
  User,
  MapPin,
  CreditCard,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Order {
  id: number;
  order_number: string;
  status: string;
  payment_status: string;
  subtotal: number;
  total: number;
  items_count: number;
  created_at: string;
  user?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  billing?: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
  };
  items?: Array<{
    id: number;
    product_name: string;
    quantity: number;
    unit_price: number;
    total: number;
  }>;
}

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  pending: { label: 'Pending', color: 'text-amber-600', bg: 'bg-amber-100', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'text-blue-600', bg: 'bg-blue-100', icon: CheckCircle },
  processing: { label: 'Processing', color: 'text-indigo-600', bg: 'bg-indigo-100', icon: Package },
  shipped: { label: 'Shipped', color: 'text-purple-600', bg: 'bg-purple-100', icon: Truck },
  delivered: { label: 'Delivered', color: 'text-emerald-600', bg: 'bg-emerald-100', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'text-red-600', bg: 'bg-red-100', icon: XCircle },
};

const statusFlow: string[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

export default function AdminOrders() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['adminOrders', page, search, statusFilter],
    queryFn: () => adminApi.orders.getAll({
      page,
      per_page: 10,
      search: search || undefined,
      status: statusFilter || undefined
    }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      adminApi.orders.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
      toast.success('Order status updated');
    },
    onError: () => {
      toast.error('Failed to update order status');
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getNextStatus = (currentStatus: string): string | null => {
    const currentIndex = statusFlow.indexOf(currentStatus);
    if (currentIndex === -1 || currentIndex === statusFlow.length - 1) return null;
    return statusFlow[currentIndex + 1];
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Failed to load orders</p>
        </div>
      </div>
    );
  }

  const orders = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-500 mt-1">Manage customer orders</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Statuses</option>
            {Object.entries(statusConfig).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Order</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order: Order) => {
                const status = statusConfig[order.status] || statusConfig.pending;
                const StatusIcon = status.icon;
                const nextStatus = getNextStatus(order.status);

                return (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{order.order_number}</p>
                        <p className="text-sm text-gray-500">{order.items_count} items</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {order.user ? `${order.user.first_name} ${order.user.last_name}` : 'Guest'}
                        </p>
                        <p className="text-sm text-gray-500">{order.user?.email || order.billing?.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{formatCurrency(order.total)}</p>
                      <p className={`text-sm ${order.payment_status === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {order.payment_status === 'paid' ? 'Paid' : 'Pending'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">{formatDate(order.created_at)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {nextStatus && order.status !== 'cancelled' && (
                          <button
                            onClick={() => updateStatusMutation.mutate({ id: order.id, status: nextStatus })}
                            disabled={updateStatusMutation.isPending}
                            className="px-3 py-1.5 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors disabled:opacity-50"
                          >
                            Mark {statusConfig[nextStatus].label}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {orders.length === 0 && (
          <div className="py-12 text-center">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No orders found</p>
          </div>
        )}

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {orders.length} of {meta.total} orders
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm text-gray-600">Page {meta.current_page} of {meta.last_page}</span>
              <button
                onClick={() => setPage(p => Math.min(meta.last_page, p + 1))}
                disabled={page === meta.last_page}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Order {selectedOrder.order_number}</h2>
                <p className="text-sm text-gray-500">{formatDate(selectedOrder.created_at)}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status */}
              <div className="flex items-center gap-4">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${statusConfig[selectedOrder.status].bg} ${statusConfig[selectedOrder.status].color}`}>
                  {React.createElement(statusConfig[selectedOrder.status].icon, { className: 'w-4 h-4' })}
                  {statusConfig[selectedOrder.status].label}
                </span>
                <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${selectedOrder.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  <CreditCard className="w-4 h-4 inline mr-1" />
                  {selectedOrder.payment_status === 'paid' ? 'Paid' : 'Payment Pending'}
                </span>
              </div>

              {/* Customer Info */}
              {(selectedOrder.user || selectedOrder.billing) && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <User className="w-4 h-4 text-gray-400" />
                    <h3 className="font-medium text-gray-900">Customer</h3>
                  </div>
                  <p className="text-gray-700">
                    {selectedOrder.user ? `${selectedOrder.user.first_name} ${selectedOrder.user.last_name}` : `${selectedOrder.billing?.first_name} ${selectedOrder.billing?.last_name}`}
                  </p>
                  <p className="text-sm text-gray-500">{selectedOrder.user?.email || selectedOrder.billing?.email}</p>
                  {selectedOrder.billing?.phone && (
                    <p className="text-sm text-gray-500">{selectedOrder.billing.phone}</p>
                  )}
                </div>
              )}

              {/* Shipping Address */}
              {selectedOrder.billing && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <h3 className="font-medium text-gray-900">Shipping Address</h3>
                  </div>
                  <p className="text-gray-700">{selectedOrder.billing.address}</p>
                  <p className="text-sm text-gray-500">
                    {selectedOrder.billing.city}, {selectedOrder.billing.state}
                  </p>
                </div>
              )}

              {/* Order Items */}
              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Items</h3>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{item.product_name}</p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity} × {formatCurrency(item.unit_price)}</p>
                        </div>
                        <p className="font-medium text-gray-900">{formatCurrency(item.total)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Total */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-emerald-600">{formatCurrency(selectedOrder.total)}</span>
                </div>
              </div>

              {/* Actions */}
              {selectedOrder.status !== 'delivered' && selectedOrder.status !== 'cancelled' && (
                <div className="flex gap-3">
                  {getNextStatus(selectedOrder.status) && (
                    <button
                      onClick={() => {
                        const next = getNextStatus(selectedOrder.status);
                        if (next) {
                          updateStatusMutation.mutate({ id: selectedOrder.id, status: next });
                          setSelectedOrder(null);
                        }
                      }}
                      className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      Mark as {statusConfig[getNextStatus(selectedOrder.status)!].label}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      updateStatusMutation.mutate({ id: selectedOrder.id, status: 'cancelled' });
                      setSelectedOrder(null);
                    }}
                    className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Cancel Order
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
