import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const message =
      (error.response?.data as { message?: string })?.message || 'An error occurred';

    switch (error.response?.status) {
      case 401:
        localStorage.removeItem('auth_token');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        break;
      case 403:
        toast.error('You do not have permission to perform this action.');
        break;
      case 404:
        toast.error('Resource not found.');
        break;
      case 422:
        break;
      case 429:
        toast.error('Too many requests. Please slow down.');
        break;
      case 500:
        toast.error('Server error. Please try again later.');
        break;
      default:
        if (!error.response) {
          toast.error('Network error. Please check your connection.');
        } else {
          toast.error(message);
        }
    }

    return Promise.reject(error);
  }
);

// Generic request function
export async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await api(config);
  return response.data;
}

// Auth API
export const authApi = {
  register: (data: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    password_confirmation: string;
    phone?: string;
    newsletter_subscribed?: boolean;
  }) => request({ method: 'POST', url: '/auth/register', data }),

  login: (data: { email: string; password: string; remember?: boolean }) =>
    request({ method: 'POST', url: '/auth/login', data }),

  logout: () => request({ method: 'POST', url: '/auth/logout' }),

  logoutAll: () => request({ method: 'POST', url: '/auth/logout-all' }),

  getUser: () => request({ method: 'GET', url: '/auth/user' }),

  updateProfile: (data: Partial<{
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
    newsletter_subscribed: boolean;
  }>) => request({ method: 'PUT', url: '/auth/profile', data }),

  changePassword: (data: {
    current_password: string;
    password: string;
    password_confirmation: string;
  }) => request({ method: 'PUT', url: '/auth/change-password', data }),

  forgotPassword: (email: string) =>
    request({ method: 'POST', url: '/auth/forgot-password', data: { email } }),

  resetPassword: (data: {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
  }) => request({ method: 'POST', url: '/auth/reset-password', data }),

  resendVerification: () => request({ method: 'POST', url: '/auth/resend-verification' }),
};

// Products API
export const productsApi = {
  getAll: (params?: {
    page?: number;
    per_page?: number;
    category?: string;
    search?: string;
    min_price?: number;
    max_price?: number;
    in_stock?: boolean;
    sort_by?: string;
    sort_order?: string;
  }) => request({ method: 'GET', url: '/products', params }),

  getFeatured: (limit?: number) =>
    request({ method: 'GET', url: '/products/featured', params: { limit } }),

  search: (q: string, params?: { page?: number; per_page?: number }) =>
    request({ method: 'GET', url: '/products/search', params: { q, ...params } }),

  getOne: (slug: string) => request({ method: 'GET', url: `/products/${slug}` }),

  getRelated: (slug: string) => request({ method: 'GET', url: `/products/${slug}/related` }),

  getReviews: (slug: string) => request({ method: 'GET', url: `/products/${slug}/reviews` }),
};

// Categories API
export const categoriesApi = {
  getAll: (params?: { root_only?: boolean; with_children?: boolean }) =>
    request({ method: 'GET', url: '/categories', params }),

  getTree: () => request({ method: 'GET', url: '/categories/tree' }),

  getFeatured: (limit?: number) =>
    request({ method: 'GET', url: '/categories/featured', params: { limit } }),

  getOne: (slug: string) => request({ method: 'GET', url: `/categories/${slug}` }),

  getProducts: (slug: string, params?: {
    page?: number;
    per_page?: number;
    include_children?: boolean;
    min_price?: number;
    max_price?: number;
    in_stock?: boolean;
    sort_by?: string;
  }) => request({ method: 'GET', url: `/categories/${slug}/products`, params }),
};

// Cart API
export const cartApi = {
  get: () => request({ method: 'GET', url: '/cart' }),

  add: (productId: number, quantity?: number, options?: Record<string, string>) =>
    request({
      method: 'POST',
      url: '/cart/add',
      data: { product_id: productId, quantity, options },
    }),

  update: (cartItemId: number, quantity: number) =>
    request({ method: 'PUT', url: `/cart/update/${cartItemId}`, data: { quantity } }),

  remove: (cartItemId: number) =>
    request({ method: 'DELETE', url: `/cart/remove/${cartItemId}` }),

  clear: () => request({ method: 'DELETE', url: '/cart/clear' }),

  applyCoupon: (code: string) =>
    request({ method: 'POST', url: '/cart/apply-coupon', data: { code } }),

  removeCoupon: () => request({ method: 'DELETE', url: '/cart/remove-coupon' }),
};

// Checkout API
export const checkoutApi = {
  getSummary: () => request({ method: 'GET', url: '/checkout/summary' }),

  process: (data: any) => request({ method: 'POST', url: '/checkout', data }),
};

// Orders API
export const ordersApi = {
  getAll: (params?: {
    page?: number;
    per_page?: number;
    status?: string;
    payment_status?: string;
    from_date?: string;
    to_date?: string;
  }) => request({ method: 'GET', url: '/orders', params }),

  getOne: (id: number) => request({ method: 'GET', url: `/orders/${id}` }),

  cancel: (id: number, reason?: string) =>
    request({ method: 'POST', url: `/orders/${id}/cancel`, data: { reason } }),

  track: (id: number) => request({ method: 'GET', url: `/orders/${id}/track` }),

  getInvoice: (id: number) =>
    request({ method: 'GET', url: `/orders/${id}/invoice`, responseType: 'blob' } as any),
};

// Payments API
export const paymentsApi = {
  initialize: (orderId: number) =>
    request({ method: 'POST', url: '/payments/initialize', data: { order_id: orderId } }),

  verify: (reference: string) =>
    request({ method: 'GET', url: `/payments/verify/${reference}` }),
};

// Wishlist API
export const wishlistApi = {
  get: () => request({ method: 'GET', url: '/wishlist' }),

  toggle: (productId: number) =>
    request({ method: 'POST', url: `/wishlist/toggle/${productId}` }),

  remove: (productId: number) =>
    request({ method: 'DELETE', url: `/wishlist/remove/${productId}` }),

  clear: () => request({ method: 'DELETE', url: '/wishlist/clear' }),

  moveToCart: (productId: number) =>
    request({ method: 'POST', url: `/wishlist/move-to-cart/${productId}` }),
};

// Reviews API
export const reviewsApi = {
  create: (data: {
    product_id: number;
    rating: number;
    title?: string;
    comment?: string;
  }) => request({ method: 'POST', url: '/reviews', data }),

  update: (id: number, data: { rating?: number; title?: string; comment?: string }) =>
    request({ method: 'PUT', url: `/reviews/${id}`, data }),

  delete: (id: number) => request({ method: 'DELETE', url: `/reviews/${id}` }),

  vote: (id: number, isHelpful: boolean) =>
    request({ method: 'POST', url: `/reviews/${id}/vote`, data: { is_helpful: isHelpful } }),
};

// Newsletter API
export const newsletterApi = {
  subscribe: (email: string, name?: string, source?: string) =>
    request({ method: 'POST', url: '/newsletter/subscribe', data: { email, name, source } }),

  unsubscribe: (token: string) =>
    request({ method: 'GET', url: `/newsletter/unsubscribe/${token}` }),
};

// Recently Viewed API
export const recentlyViewedApi = {
  get: (limit?: number) =>
    request({ method: 'GET', url: '/recently-viewed', params: { limit } }),
};

// Admin API
export const adminApi = {
  // Dashboard
  dashboard: {
    getStats: () => request({ method: 'GET', url: '/admin/dashboard/stats' }),
    getRecentOrders: () => request({ method: 'GET', url: '/admin/dashboard/recent-orders' }),
    getSalesChart: (period?: string) =>
      request({ method: 'GET', url: '/admin/dashboard/sales-chart', params: { period } }),
  },

  // Categories
  categories: {
    getAll: (params?: { page?: number; per_page?: number; search?: string }) =>
      request({ method: 'GET', url: '/admin/categories', params }),
    getOne: (id: number) => request({ method: 'GET', url: `/admin/categories/${id}` }),
    create: (data: any) => request({ method: 'POST', url: '/admin/categories', data }),
    update: (id: number, data: any) =>
      request({ method: 'PUT', url: `/admin/categories/${id}`, data }),
    delete: (id: number) => request({ method: 'DELETE', url: `/admin/categories/${id}` }),
  },

  // Products
  products: {
    getAll: (params?: { page?: number; per_page?: number; search?: string; category?: string }) =>
      request({ method: 'GET', url: '/admin/products', params }),
    getOne: (id: number) => request({ method: 'GET', url: `/admin/products/${id}` }),
    create: (data: any) => request({ method: 'POST', url: '/admin/products', data }),
    update: (id: number, data: any) =>
      request({ method: 'PUT', url: `/admin/products/${id}`, data }),
    delete: (id: number) => request({ method: 'DELETE', url: `/admin/products/${id}` }),
  },

  // Orders
  orders: {
    getAll: (params?: {
      page?: number;
      per_page?: number;
      status?: string;
      search?: string;
    }) => request({ method: 'GET', url: '/admin/orders', params }),
    getOne: (id: number) => request({ method: 'GET', url: `/admin/orders/${id}` }),
    updateStatus: (id: number, status: string) =>
      request({ method: 'PUT', url: `/admin/orders/${id}/status`, data: { status } }),
  },

  // Users/Customers
  users: {
    getAll: (params?: { page?: number; per_page?: number; search?: string; role?: string }) =>
      request({ method: 'GET', url: '/admin/users', params }),
    getOne: (id: number) => request({ method: 'GET', url: `/admin/users/${id}` }),
    toggleActive: (id: number) => request({ method: 'PUT', url: `/admin/users/${id}/toggle-active` }),
  },
};

export default api;
