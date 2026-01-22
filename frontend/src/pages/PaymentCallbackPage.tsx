import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { paymentsApi } from '@/services/api';
import { useCart } from '@/context/CartContext';

export default function PaymentCallbackPage() {
  const [searchParams] = useSearchParams();
  const { refreshCart } = useCart();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [message, setMessage] = useState('');
  const [orderNumber, setOrderNumber] = useState('');

  useEffect(() => {
    const verifyPayment = async () => {
      const reference = searchParams.get('reference') || searchParams.get('trxref');

      if (!reference) {
        setStatus('failed');
        setMessage('Invalid payment reference');
        return;
      }

      try {
        const response = await paymentsApi.verify(reference);
        const { status: paymentStatus, order } = response.data;

        if (paymentStatus === 'success') {
          setStatus('success');
          setMessage('Your payment was successful!');
          setOrderNumber(order.order_number);
          await refreshCart();
        } else {
          setStatus('failed');
          setMessage('Payment verification failed. Please contact support.');
        }
      } catch (error: any) {
        setStatus('failed');
        setMessage(error.response?.data?.message || 'Payment verification failed');
      }
    };

    verifyPayment();
  }, [searchParams, refreshCart]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-primary-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">Verifying your payment...</h2>
          <p className="text-gray-600 mt-2">Please wait while we confirm your transaction</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
            <p className="text-gray-600 mb-6">{message}</p>

            {orderNumber && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600">Order Number</p>
                <p className="text-xl font-bold text-primary-600">{orderNumber}</p>
              </div>
            )}

            <p className="text-sm text-gray-500 mb-6">
              We've sent a confirmation email with your order details.
            </p>

            <div className="space-y-3">
              <Link to="/orders" className="btn btn-primary w-full py-3">
                View My Orders
              </Link>
              <Link to="/products" className="btn btn-secondary w-full py-3">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h1>
          <p className="text-gray-600 mb-6">{message}</p>

          <div className="space-y-3">
            <Link to="/cart" className="btn btn-primary w-full py-3">
              Try Again
            </Link>
            <Link to="/products" className="btn btn-secondary w-full py-3">
              Continue Shopping
            </Link>
          </div>

          <p className="text-sm text-gray-500 mt-6">
            If you believe this is an error, please{' '}
            <Link to="/help" className="text-primary-600 hover:underline">
              contact our support team
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
