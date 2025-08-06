export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'customer' | 'kitchen' | 'admin';
  kitchenCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  available: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  quantity: number;
  price: number;
  menuItem?: MenuItem;
}

export interface Order {
  id: string;
  customerId: string;
  items: OrderItem[];
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered';
  total: number;
  createdAt: string;
  updatedAt: string;
  customerInfo: {
    name: string;
    phone: string;
    address?: string;
  };
  customer?: User;
}

export interface Analytics {
  totalOrders: number;
  revenue: number;
  popularItems: MenuItem[];
  ordersToday: number;
}

export interface RpcRequest {
  jsonrpc: '2.0';
  method: string;
  params?: any;
  id: string | number;
}

export interface RpcResponse {
  jsonrpc: '2.0';
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
  id: string | number;
}

export interface AuthenticatedRequest extends Express.Request {
  user?: User;
}