export type UserRole = 'admin' | 'manager' | 'waiter' | 'kitchen' | 'delivery';

export type OrderType = 'dine_in' | 'delivery' | 'takeout' | 'bar';

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

export type PaymentMethod = 'cash' | 'credit' | 'debit' | 'pix' | 'voucher';

export type TableStatus = 'free' | 'occupied' | 'reserved' | 'vip';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  company_id: string;
  avatar_url?: string;
  created_at: string;
}

export interface Company {
  id: string;
  name: string;
  document: string;
  address: string;
  phone: string;
  logo_url?: string;
  settings: CompanySettings;
  created_at: string;
}

export interface CompanySettings {
  currency: string;
  timezone: string;
  receipt_footer: string;
  nfe_enabled: boolean;
  ifood_enabled: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  order: number;
  active: boolean;
  company_id: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  cost: number;
  category_id: string;
  image_url?: string;
  active: boolean;
  preparation_time: number;
  modifiers: Modifier[];
  company_id: string;
}

export interface Modifier {
  id: string;
  name: string;
  options: ModifierOption[];
}

export interface ModifierOption {
  id: string;
  name: string;
  price: number;
}

export interface Table {
  id: string;
  number: number;
  seats: number;
  status: TableStatus;
  current_order_id?: string;
  company_id: string;
}

export interface Order {
  id: string;
  table_id?: string;
  customer_id?: string;
  type: OrderType;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  payments: Payment[];
  notes?: string;
  created_by: string;
  company_id: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  modifiers: OrderItemModifier[];
  total: number;
  notes?: string;
  status: 'pending' | 'preparing' | 'ready';
}

export interface OrderItemModifier {
  modifier_id: string;
  option_id: string;
  name: string;
  price: number;
}

export interface Payment {
  id: string;
  method: PaymentMethod;
  amount: number;
  card_brand?: string;
  authorization_code?: string;
  created_at: string;
}

export interface OpenTab {
  id: string;
  customer_name: string;
  customer_phone?: string;
  table_id?: string;
  pre_authorized_amount: number;
  current_amount: number;
  status: 'open' | 'closed' | 'cancelled';
  notes?: string;
  created_by: string;
  company_id: string;
  created_at: string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone: string;
  document?: string;
  loyalty_points: number;
  loyalty_tier: 'standard' | 'silver' | 'gold' | 'vip';
  total_spent: number;
  visit_count: number;
  company_id: string;
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  min_order_value: number;
  max_uses: number;
  used_count: number;
  valid_from: string;
  valid_until: string;
  active: boolean;
  company_id: string;
}

export interface Inventory {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  min_quantity: number;
  cost: number;
  company_id: string;
}

export interface Reservation {
  id: string;
  customer_id?: string;
  customer_name: string;
  customer_phone: string;
  table_id: string;
  date: string;
  time: string;
  guests: number;
  notes?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  company_id: string;
  created_at: string;
}

export interface CashClosing {
  id: string;
  user_id: string;
  opening_balance: number;
  cash_sales: number;
  card_sales: number;
  pix_sales: number;
  other_sales: number;
  withdrawals: number;
  supplies: number;
  closing_balance: number;
  notes?: string;
  created_at: string;
}

export interface DashboardMetrics {
  orders_today: number;
  revenue_today: number;
  average_ticket: number;
  tables_available: number;
  tables_occupied: number;
  pending_orders: number;
  top_products: { name: string; quantity: number }[];
  top_customers: { name: string; spent: number }[];
  revenue_by_hour: { hour: number; revenue: number }[];
}