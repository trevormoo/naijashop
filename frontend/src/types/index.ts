// User Types
export interface User {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country: string;
  postal_code?: string;
  role: 'customer' | 'admin';
  avatar?: string;
  is_active: boolean;
  newsletter_subscribed: boolean;
  email_verified_at?: string;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
  orders_count?: number;
  wishlist_count?: number;
  reviews_count?: number;
}

// Category Types
export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent_id?: number;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  products_count?: number;
  path: string;
  parent?: Category;
  children?: Category[];
  created_at: string;
  updated_at: string;
}

// Product Types
export interface ProductImage {
  id: number;
  url: string;
  thumbnail_url: string;
  alt_text?: string;
  is_primary: boolean;
  sort_order: number;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  sku?: string;
  short_description?: string;
  description?: string;
  price: number;
  formatted_price: string;
  compare_price?: number;
  discount_percentage?: number;
  category_id?: number;
  stock_quantity: number;
  low_stock_threshold: number;
  track_quantity: boolean;
  allow_backorders: boolean;
  in_stock: boolean;
  is_low_stock: boolean;
  is_out_of_stock: boolean;
  weight?: number;
  dimensions?: string;
  is_active: boolean;
  is_featured: boolean;
  is_digital: boolean;
  view_count: number;
  sales_count: number;
  average_rating: number;
  review_count: number;
  meta_title?: string;
  meta_description?: string;
  tags: string[];
  attributes: Record<string, string>;
  primary_image?: string;
  images: ProductImage[];
  category?: Category;
  in_wishlist?: boolean;
  created_at: string;
  updated_at: string;
}

// Cart Types
export interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
  subtotal: number;
  options?: Record<string, string>;
  is_available: boolean;
  has_sufficient_stock: boolean;
  max_quantity: number;
  formatted_price: string;
  formatted_subtotal: string;
  product: Product;
  created_at: string;
  updated_at: string;
}

export interface Cart {
  id: number;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total: number;
  coupon_code?: string;
  items_count: number;
  is_empty: boolean;
  items: CartItem[];
  formatted_subtotal: string;
  formatted_discount: string;
  formatted_tax: string;
  formatted_total: string;
  updated_at: string;
  discount?: number;
  shipping_cost?: number;
  coupon?: { code: string };
}

// Order Types
export interface OrderItem {
  id: number;
  product_id?: number;
  product_name: string;
  product_sku?: string;
  product_image?: string;
  quantity: number;
  unit_price: number;
  price?: number;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total: number;
  options?: Record<string, string>;
  formatted_unit_price: string;
  formatted_total: string;
  product?: Product;
}

export interface OrderAddress {
  first_name: string;
  last_name: string;
  full_name: string;
  email?: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code?: string;
  formatted_address: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';

export interface Order {
  id: number;
  order_number: string;
  status: OrderStatus;
  status_label: string;
  payment_status: PaymentStatus;
  payment_status_label: string;
  subtotal: number;
  discount_amount: number;
  shipping_amount: number;
  tax_amount: number;
  total: number;
  currency: string;
  coupon_code?: string;
  coupon_discount: number;
  billing: OrderAddress;
  shipping: OrderAddress & { method?: string; tracking_number?: string };
  shipping_address?: OrderAddress & { method?: string; tracking_number?: string };
  notes?: string;
  items_count: number;
  can_be_cancelled: boolean;
  can_be_refunded: boolean;
  is_paid: boolean;
  available_status_transitions: OrderStatus[];
  shipped_at?: string;
  delivered_at?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  user?: User;
  payments?: Payment[];
  formatted_subtotal: string;
  formatted_discount: string;
  formatted_shipping: string;
  formatted_tax: string;
  formatted_total: string;
  shipping_cost?: number;
  payment_method?: string;
}

// Payment Types
export type PaymentMethod = 'paystack' | 'bank_transfer';

export interface Payment {
  id: number;
  payment_reference: string;
  gateway: string;
  gateway_reference?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'success' | 'failed' | 'cancelled' | 'refunded' | 'partially_refunded';
  status_label: string;
  payment_method?: string;
  card_type?: string;
  card_last_four?: string;
  bank_name?: string;
  refunded_amount: number;
  refundable_amount: number;
  can_be_refunded: boolean;
  formatted_amount: string;
  formatted_refunded: string;
  paid_at?: string;
  refunded_at?: string;
  created_at: string;
}

// Review Types
export interface Review {
  id: number;
  rating: number;
  title?: string;
  comment?: string;
  is_verified_purchase: boolean;
  is_approved: boolean;
  is_featured: boolean;
  helpful_votes: number;
  not_helpful_votes: number;
  helpfulness_percentage?: number;
  admin_response?: string;
  admin_responded_at?: string;
  user: {
    id: number;
    name: string;
    avatar?: string;
  };
  product?: Product;
  user_vote?: boolean;
  created_at: string;
  updated_at: string;
}

// API Response Types
export interface PaginatedResponse<T> {
  data: T[];
  links: {
    first: string;
    last: string;
    prev?: string;
    next?: string;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
}

export interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
  newsletter_subscribed?: boolean;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

// Checkout Types
export interface CheckoutData {
  billing_first_name: string;
  billing_last_name: string;
  billing_email: string;
  billing_phone: string;
  billing_address: string;
  billing_city: string;
  billing_state: string;
  billing_country?: string;
  billing_postal_code?: string;
  same_as_billing: boolean;
  shipping_first_name?: string;
  shipping_last_name?: string;
  shipping_phone?: string;
  shipping_address?: string;
  shipping_city?: string;
  shipping_state?: string;
  shipping_country?: string;
  shipping_postal_code?: string;
  shipping_method?: string;
  notes?: string;
  payment_method: PaymentMethod;
}

// Dashboard Types (Admin)
export interface DashboardStats {
  revenue: {
    total: number;
    this_month: number;
    today: number;
    change_percentage: number;
    formatted_total: string;
    formatted_this_month: string;
    formatted_today: string;
  };
  orders: {
    total: number;
    pending: number;
    processing: number;
    this_month: number;
    today: number;
    change_percentage: number;
  };
  products: {
    total: number;
    active: number;
    low_stock: number;
    out_of_stock: number;
  };
  customers: {
    total: number;
    new_this_month: number;
    change_percentage: number;
  };
}

export interface ChartData {
  label: string;
  value: number;
}
