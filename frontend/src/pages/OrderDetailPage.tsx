import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
  ChevronLeft,
  Download,
  AlertCircle,
} from 'lucide-react';
import { ordersApi } from '@/services/api';
import { Order } from '@/types';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const statusSteps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

const statusConfig: Record<string, { icon: React.ElementType; color: string }> = {
  pending: { icon: Clock, color: 'text-yellow-500' },
  confirmed: { icon: CheckCircle, color: 'text-blue-500' },
  processing: { icon: Package, color: 'text-indigo-500' },
  shipped: { icon: Truck, color: 'text-purple-500' },
  delivered: { icon: CheckCircle, color: 'text-green-500' },
  cancelled: { icon: XCircle, color: 'text-red-500' },
  refunded: { icon: AlertCircle, color: 'text-gray-500' },
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  const fetchOrder = async () => {
  setIsLoading(true);
  try {
    const response = await ordersApi.getOne(Number(id));
    const res = response as any;
    setOrder(res.data.data);
    } catch (error) {
      console.error('Failed to fetch order:', error);
      toast.error('Failed to load order details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order || !confirm('Are you sure you want to cancel this order?')) return;

    setIsCancelling(true);
    try {
      await ordersApi.cancel(order.id);
      toast.success('Order cancelled successfully');
      fetchOrder();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!order) {
    return (
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="container-custom text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Order not found</h2>
          <Link to="/orders" className="btn btn-primary">
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const currentStepIndex = statusSteps.indexOf(order.status);
  const StatusIcon = statusConfig[order.status]?.icon || Clock;
  const statusColor = statusConfig[order.status]?.color || 'text-gray-500';

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container-custom">
        <Link
          to="/orders"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Orders
        </Link>

        {/* Order Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold">{order.order_number}</h1>
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium capitalize ${statusColor} bg-opacity-10`}
                  style={{
                    backgroundColor: `currentColor`,
                    color: statusColor.replace('text-', ''),
                  }}
                >
                  <StatusIcon className="w-4 h-4" />
                  {order.status}
                </span>
              </div>
              <p className="text-gray-500">
                Placed on{' '}
                {new Date(order.created_at).toLocaleDateString('en-NG', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <div className="flex gap-3">
              {order.status === 'pending' && (
                <button
                  onClick={handleCancelOrder}
                  disabled={isCancelling}
                  className="btn btn-secondary text-red-600 border-red-200 hover:bg-red-50"
                >
                  {isCancelling ? 'Cancelling...' : 'Cancel Order'}
                </button>
              )}
              <button className="btn btn-secondary">
                <Download className="w-4 h-4 mr-2" />
                Invoice
              </button>
            </div>
          </div>
        </div>

        {/* Order Progress */}
        {!['cancelled', 'refunded'].includes(order.status) && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="font-semibold mb-6">Order Progress</h2>
            <div className="flex items-center justify-between">
              {statusSteps.map((step, index) => {
                const isActive = index <= currentStepIndex;
                const StepIcon = statusConfig[step]?.icon || Clock;

                return (
                  <div key={step} className="flex flex-col items-center flex-1">
                    <div className="relative flex items-center w-full">
                      {index > 0 && (
                        <div
                          className={`absolute left-0 right-1/2 h-1 -translate-y-1/2 top-5 ${
                            isActive ? 'bg-primary-600' : 'bg-gray-200'
                          }`}
                        />
                      )}
                      {index < statusSteps.length - 1 && (
                        <div
                          className={`absolute left-1/2 right-0 h-1 -translate-y-1/2 top-5 ${
                            index < currentStepIndex ? 'bg-primary-600' : 'bg-gray-200'
                          }`}
                        />
                      )}
                      <div
                        className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center mx-auto ${
                          isActive
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        <StepIcon className="w-5 h-5" />
                      </div>
                    </div>
                    <span
                      className={`mt-2 text-xs font-medium capitalize ${
                        isActive ? 'text-primary-600' : 'text-gray-400'
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b">
                <h2 className="font-semibold">Order Items ({order.items?.length || 0})</h2>
              </div>
              <div className="divide-y">
                {order.items?.map((item) => (
                  <div key={item.id} className="p-4 flex gap-4">
                    <img
                      src={item.product?.primary_image || '/images/placeholder-product.png'}
                      alt={item.product?.name || 'Product'}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <Link
                        to={`/products/${item.product?.slug}`}
                        className="font-medium hover:text-primary-600"
                      >
                        {item.product?.name || 'Product'}
                      </Link>
                      <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                      <p className="text-sm text-gray-500">
                        Price: ₦{(item.price ?? item.unit_price).toLocaleString()} each

                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        ₦{(((item.price ?? item.unit_price) * item.quantity)).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Payment Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold mb-4">Payment Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>₦{order.subtotal.toLocaleString()}</span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₦{order.discount_amount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>
                    {(order.shipping_cost ?? 0) > 0
                      ? `₦${(order.shipping_cost ?? 0).toLocaleString()}`
                      : 'Free'}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>₦{order.total.toLocaleString()}</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Payment Status</span>
                  <span
                    className={`font-medium capitalize ${
                      order.payment_status === 'paid'
                        ? 'text-green-600'
                        : order.payment_status === 'failed'
                        ? 'text-red-600'
                        : 'text-yellow-600'
                    }`}
                  >
                    {order.payment_status}
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600">Payment Method</span>
                  <span className="capitalize">{order.payment_method}</span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold mb-4">Shipping Address</h3>
              {order.shipping_address && (
                <div className="text-sm text-gray-600 space-y-2">
                  <p className="font-medium text-gray-900">
                    {order.shipping_address.first_name} {order.shipping_address.last_name}
                  </p>
                  <p className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    {order.shipping_address.address}, {order.shipping_address.city},{' '}
                    {order.shipping_address.state}
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {order.shipping_address.phone}
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {order.shipping_address.email}
                  </p>
                </div>
              )}
            </div>

            {/* Order Notes */}
            {order.notes && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-semibold mb-2">Order Notes</h3>
                <p className="text-sm text-gray-600">{order.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
