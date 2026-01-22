import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  CreditCard,
  Truck,
  MapPin,
  ChevronLeft,
  Check,
  Lock,
  Sparkles,
  Package,
  Clock,
  Gift,
  ArrowRight,
  Loader2,
  User,
  Phone,
  Mail,
  Home,
  Building,
  FileText,
  Wallet,
  BadgeCheck,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { checkoutApi, paymentsApi } from '@/services/api';
import toast from 'react-hot-toast';

interface ShippingAddress {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

const steps = [
  { id: 1, name: 'Shipping', icon: Truck, description: 'Delivery address' },
  { id: 2, name: 'Payment', icon: CreditCard, description: 'Payment method' },
  { id: 3, name: 'Review', icon: Check, description: 'Confirm order' },
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState(1);

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'Nigeria',
  });

  const [billingAddress, setBillingAddress] = useState<ShippingAddress>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'Nigeria',
  });

  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('paystack');
  const [notes, setNotes] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const nigerianStates = [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue',
    'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT',
    'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi',
    'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo',
    'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
  ];

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
      return;
    }
    if (!cart || cart.items.length === 0) {
      navigate('/cart');
    }
  }, [isAuthenticated, cart, navigate]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    type: 'shipping' | 'billing'
  ) => {
    const { name, value } = e.target;
    if (type === 'shipping') {
      setShippingAddress((prev) => ({ ...prev, [name]: value }));
    } else {
      setBillingAddress((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validateShippingForm = () => {
    const required = ['first_name', 'last_name', 'email', 'phone', 'address', 'city', 'state'];
    for (const field of required) {
      if (!shippingAddress[field as keyof ShippingAddress]) {
        toast.error(`Please fill in ${field.replace('_', ' ')}`);
        return false;
      }
    }
    return true;
  };

  const handleContinue = () => {
    if (step === 1 && validateShippingForm()) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (step === 2) {
      setStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePlaceOrder = async () => {
    if (!agreedToTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }

    setIsProcessing(true);
    try {
      const orderResponse = await checkoutApi.process({
        shipping_address: shippingAddress,
        billing_address: sameAsShipping ? shippingAddress : billingAddress,
        payment_method: paymentMethod,
        notes: notes,
      });

      const order = (orderResponse as any).data.data;

      const paymentResponse = await paymentsApi.initialize(order.id);

      const { authorization_url } = (paymentResponse as any).data;
      window.location.href = authorization_url;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to place order');
      setIsProcessing(false);
    }
  };

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/30">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-40">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/cart"
              className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors group"
            >
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back to Cart</span>
            </Link>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-gray-900 hidden sm:inline">Secure Checkout</span>
            </div>

            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <Lock className="w-4 h-4 text-emerald-500" />
              <span className="hidden sm:inline">256-bit SSL</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Progress Steps */}
        <div className="mb-10">
          <div className="flex items-center justify-center">
            {steps.map((s, index) => {
              const Icon = s.icon;
              const isActive = s.id === step;
              const isCompleted = s.id < step;

              return (
                <div key={s.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                        isCompleted
                          ? 'bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30'
                          : isActive
                          ? 'bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30 scale-110'
                          : 'bg-gray-100'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-6 h-6 text-white" />
                      ) : (
                        <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                      )}
                      {isActive && (
                        <div className="absolute -inset-1 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl opacity-30 blur animate-pulse" />
                      )}
                    </div>
                    <div className="mt-3 text-center">
                      <p className={`font-semibold ${isActive || isCompleted ? 'text-emerald-600' : 'text-gray-400'}`}>
                        {s.name}
                      </p>
                      <p className="text-xs text-gray-400 hidden sm:block">{s.description}</p>
                    </div>
                  </div>

                  {index < steps.length - 1 && (
                    <div className="w-16 sm:w-24 h-1 mx-2 sm:mx-4 -mt-8 rounded-full overflow-hidden bg-gray-200">
                      <div
                        className={`h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500 ${
                          isCompleted ? 'w-full' : 'w-0'
                        }`}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Shipping */}
            {step === 1 && (
              <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 overflow-hidden animate-fade-in">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                      <Truck className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Shipping Information</h2>
                      <p className="text-emerald-100 text-sm">Where should we deliver your order?</p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <User className="w-4 h-4 inline-block mr-1.5 text-gray-400" />
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="first_name"
                        value={shippingAddress.first_name}
                        onChange={(e) => handleInputChange(e, 'shipping')}
                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white transition-all"
                        placeholder="Enter first name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <User className="w-4 h-4 inline-block mr-1.5 text-gray-400" />
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="last_name"
                        value={shippingAddress.last_name}
                        onChange={(e) => handleInputChange(e, 'shipping')}
                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white transition-all"
                        placeholder="Enter last name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Mail className="w-4 h-4 inline-block mr-1.5 text-gray-400" />
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={shippingAddress.email}
                        onChange={(e) => handleInputChange(e, 'shipping')}
                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white transition-all"
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Phone className="w-4 h-4 inline-block mr-1.5 text-gray-400" />
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={shippingAddress.phone}
                        onChange={(e) => handleInputChange(e, 'shipping')}
                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white transition-all"
                        placeholder="+234 XXX XXX XXXX"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Home className="w-4 h-4 inline-block mr-1.5 text-gray-400" />
                        Street Address *
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={shippingAddress.address}
                        onChange={(e) => handleInputChange(e, 'shipping')}
                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white transition-all"
                        placeholder="House number and street name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Building className="w-4 h-4 inline-block mr-1.5 text-gray-400" />
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={shippingAddress.city}
                        onChange={(e) => handleInputChange(e, 'shipping')}
                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white transition-all"
                        placeholder="Enter city"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <MapPin className="w-4 h-4 inline-block mr-1.5 text-gray-400" />
                        State *
                      </label>
                      <select
                        name="state"
                        value={shippingAddress.state}
                        onChange={(e) => handleInputChange(e, 'shipping')}
                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white transition-all appearance-none cursor-pointer"
                        required
                      >
                        <option value="">Select State</option>
                        {nigerianStates.map((state) => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                      <input
                        type="text"
                        name="postal_code"
                        value={shippingAddress.postal_code}
                        onChange={(e) => handleInputChange(e, 'shipping')}
                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white transition-all"
                        placeholder="Optional"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                      <input
                        type="text"
                        value="Nigeria"
                        disabled
                        className="w-full px-4 py-3.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FileText className="w-4 h-4 inline-block mr-1.5 text-gray-400" />
                        Delivery Notes (Optional)
                      </label>
                      <textarea
                        name="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white transition-all resize-none"
                        placeholder="Special delivery instructions, landmarks, etc."
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleContinue}
                    className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 hover:scale-[1.02] group"
                  >
                    Continue to Payment
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <div className="space-y-6 animate-fade-in">
                {/* Shipping Summary */}
                <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 p-5">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Delivery Address</h3>
                        <p className="text-gray-600 text-sm mt-1">
                          {shippingAddress.first_name} {shippingAddress.last_name}<br />
                          {shippingAddress.address}<br />
                          {shippingAddress.city}, {shippingAddress.state}<br />
                          {shippingAddress.phone}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setStep(1)}
                      className="text-emerald-600 text-sm font-medium hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">Payment Method</h2>
                        <p className="text-emerald-100 text-sm">Choose how you'd like to pay</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="space-y-3">
                      <label
                        className={`flex items-center p-4 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${
                          paymentMethod === 'paystack'
                            ? 'border-emerald-500 bg-emerald-50/50'
                            : 'border-gray-200 hover:border-emerald-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value="paystack"
                          checked={paymentMethod === 'paystack'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="sr-only"
                        />
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4">
                          <Wallet className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <span className="font-semibold text-gray-900">Pay with Paystack</span>
                          <p className="text-sm text-gray-500">Card, Bank Transfer, USSD, Mobile Money</p>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          paymentMethod === 'paystack'
                            ? 'border-emerald-500 bg-emerald-500'
                            : 'border-gray-300'
                        }`}>
                          {paymentMethod === 'paystack' && <Check className="w-4 h-4 text-white" />}
                        </div>
                      </label>
                    </div>

                    {/* Security Badges */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-2xl">
                      <div className="flex items-center gap-3 mb-3">
                        <ShieldCheck className="w-5 h-5 text-emerald-500" />
                        <span className="font-medium text-gray-700">Secure Payment</span>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg text-xs text-gray-600">
                          <Lock className="w-3.5 h-3.5" /> SSL Encrypted
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg text-xs text-gray-600">
                          <BadgeCheck className="w-3.5 h-3.5" /> PCI Compliant
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg text-xs text-gray-600">
                          <ShieldCheck className="w-3.5 h-3.5" /> Fraud Protection
                        </div>
                      </div>
                    </div>

                    {/* Billing Address */}
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <h3 className="font-semibold text-gray-900 mb-4">Billing Address</h3>
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                          sameAsShipping
                            ? 'bg-emerald-500 border-emerald-500'
                            : 'border-gray-300 group-hover:border-emerald-400'
                        }`}>
                          {sameAsShipping && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <input
                          type="checkbox"
                          checked={sameAsShipping}
                          onChange={(e) => setSameAsShipping(e.target.checked)}
                          className="sr-only"
                        />
                        <span className="text-gray-700">Same as shipping address</span>
                      </label>

                      {!sameAsShipping && (
                        <div className="grid md:grid-cols-2 gap-4 mt-4 animate-fade-in">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                            <input
                              type="text"
                              name="first_name"
                              value={billingAddress.first_name}
                              onChange={(e) => handleInputChange(e, 'billing')}
                              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                            <input
                              type="text"
                              name="last_name"
                              value={billingAddress.last_name}
                              onChange={(e) => handleInputChange(e, 'billing')}
                              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                            <input
                              type="text"
                              name="address"
                              value={billingAddress.address}
                              onChange={(e) => handleInputChange(e, 'billing')}
                              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                            <input
                              type="text"
                              name="city"
                              value={billingAddress.city}
                              onChange={(e) => handleInputChange(e, 'billing')}
                              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                            <select
                              name="state"
                              value={billingAddress.state}
                              onChange={(e) => handleInputChange(e, 'billing')}
                              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                            >
                              <option value="">Select State</option>
                              {nigerianStates.map((state) => (
                                <option key={state} value={state}>{state}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={handleBack}
                        className="flex-1 px-6 py-4 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleContinue}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 group"
                      >
                        Review Order
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div className="space-y-6 animate-fade-in">
                {/* Summary Cards */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 p-5">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Shipping</h3>
                        <p className="text-sm text-gray-600">
                          {shippingAddress.first_name} {shippingAddress.last_name}<br />
                          {shippingAddress.address}, {shippingAddress.city}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 p-5">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Payment</h3>
                        <p className="text-sm text-gray-600">
                          Paystack<br />
                          Card, Bank Transfer, USSD
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                        <Package className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">Order Review</h2>
                        <p className="text-emerald-100 text-sm">{cart.items.length} item(s) in your order</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="divide-y divide-gray-100">
                      {cart.items.map((item) => (
                        <div key={item.id} className="py-4 flex gap-4 first:pt-0 last:pb-0">
                          <div className="relative">
                            <img
                              src={item.product.primary_image || '/images/placeholder-product.png'}
                              alt={item.product.name}
                              className="w-20 h-20 object-cover rounded-xl"
                            />
                            <span className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                              {item.quantity}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 truncate">{item.product.name}</h4>
                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                            <p className="text-sm text-gray-500">₦{item.price.toLocaleString()} each</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">
                              ₦{(item.price * item.quantity).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Terms Agreement */}
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <div className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                          agreedToTerms
                            ? 'bg-emerald-500 border-emerald-500'
                            : 'border-gray-300 group-hover:border-emerald-400'
                        }`}>
                          {agreedToTerms && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <input
                          type="checkbox"
                          checked={agreedToTerms}
                          onChange={(e) => setAgreedToTerms(e.target.checked)}
                          className="sr-only"
                        />
                        <span className="text-sm text-gray-600">
                          I agree to the{' '}
                          <a href="#" className="text-emerald-600 hover:underline">Terms of Service</a>
                          {' '}and{' '}
                          <a href="#" className="text-emerald-600 hover:underline">Privacy Policy</a>
                        </span>
                      </label>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={handleBack}
                        className="flex-1 px-6 py-4 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                      >
                        Back
                      </button>
                      <button
                        onClick={handlePlaceOrder}
                        disabled={isProcessing || !agreedToTerms}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Lock className="w-5 h-5" />
                            Pay ₦{cart.total.toLocaleString()}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 overflow-hidden sticky top-24">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>
              </div>

              <div className="p-6">
                <div className="space-y-3 mb-6">
                  {cart.items.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative">
                        <img
                          src={item.product.primary_image || '/images/placeholder-product.png'}
                          alt={item.product.name}
                          className="w-14 h-14 object-cover rounded-lg"
                        />
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-gray-900 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">{item.product.name}</h4>
                        <p className="text-sm text-gray-500">₦{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                  {cart.items.length > 3 && (
                    <p className="text-sm text-gray-500 text-center">
                      +{cart.items.length - 3} more item(s)
                    </p>
                  )}
                </div>

                <div className="space-y-3 py-4 border-t border-gray-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">₦{cart.subtotal.toLocaleString()}</span>
                  </div>
                  {(cart.discount ?? 0) > 0 && (
                  <div className="flex justify-between text-sm text-emerald-600">
                    <span>Discount</span>
                    <span>-₦{(cart.discount ?? 0).toLocaleString()}</span>
                  </div>
                )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      {(cart.shipping_cost ?? 0) > 0
                        ? `₦${(cart.shipping_cost ?? 0).toLocaleString()}`
                        : 'Free'}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center py-4 border-t border-gray-100">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    ₦{cart.total.toLocaleString()}
                  </span>
                </div>

                {cart.coupon && (
                  <div className="mt-4 p-3 bg-emerald-50 rounded-xl flex items-center gap-2">
                    <Gift className="w-5 h-5 text-emerald-600" />
                    <p className="text-sm text-emerald-700">
                      <strong>{cart.coupon.code}</strong> applied
                    </p>
                  </div>
                )}

                {/* Trust Badges */}
                <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <Truck className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span>Free delivery over ₦50,000</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-4 h-4 text-blue-600" />
                    </div>
                    <span>2-5 business days delivery</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4 text-purple-600" />
                    </div>
                    <span>100% secure checkout</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}
