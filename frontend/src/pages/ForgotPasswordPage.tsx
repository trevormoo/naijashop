import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '@/services/api';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
      toast.success('Password reset link sent!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send reset link');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link to="/" className="text-3xl font-bold text-primary-600">
            Naija<span className="text-gray-900">Shop</span>
          </Link>
          <h2 className="mt-6 text-2xl font-bold text-gray-900">Reset your password</h2>
        </div>

        {sent ? (
          <div className="card p-8 text-center">
            <p className="text-gray-600 mb-4">Check your email for a password reset link.</p>
            <Link to="/login" className="text-primary-600 font-medium hover:underline">Back to login</Link>
          </div>
        ) : (
          <form className="mt-8 space-y-6 card p-8" onSubmit={handleSubmit}>
            <div>
              <label className="label">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input"
                placeholder="you@example.com"
              />
            </div>
            <button type="submit" disabled={isLoading} className="w-full btn btn-primary btn-lg">
              {isLoading ? 'Sending...' : 'Send reset link'}
            </button>
            <p className="text-center">
              <Link to="/login" className="text-primary-600 hover:underline">Back to login</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
