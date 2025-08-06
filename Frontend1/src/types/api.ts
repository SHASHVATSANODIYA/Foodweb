// API Response Types for Food Ordering Platform

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'kitchen' | 'admin';
  kitchenCode?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  available: boolean;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  quantity: number;
  price: number;
  specialInstructions?: string;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  address?: string;
}

export interface Order {
  id: string;
  customerId: string;
  items: OrderItem[];
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered';
  total: number;
  createdAt: string;
  updatedAt: string;
  customerInfo: CustomerInfo;
}

export interface DashboardStats {
  totalOrders: number;
  revenue: number;
  popularItems: MenuItem[];
  ordersToday: number;
  revenueToday: number;
  averageOrderValue: number;
}

// WebSocket Event Types
export interface WebSocketEvent<T = any> {
  type: string;
  data: T;
}

export interface OrderCreatedEvent {
  order: Order;
}

export interface OrderUpdatedEvent {
  order: Order;
}

export interface AnalyticsUpdateEvent {
  stats: DashboardStats;
}

// JSON-RPC Request/Response Types
export interface JsonRpcRequest {
  jsonrpc: '2.0';
  method: string;
  params?: any;
  id: string | number;
}

export interface JsonRpcResponse<T = any> {
  jsonrpc: '2.0';
  result?: T;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
  id: string | number;
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface CustomerRegistrationForm {
  name: string;
  email: string;
  password: string;
}

export interface KitchenRegistrationForm {
  name: string;
  email: string;
  password: string;
  kitchenCode?: string;
}

export interface CheckoutForm {
  customerInfo: CustomerInfo;
  paymentMethod?: string;
  notes?: string;
}