interface JsonRpcRequest {
  jsonrpc: '2.0';
  method: string;
  params?: any;
  id: string | number;
}

interface JsonRpcError {
  code: number;
  message: string;
  data?: any;
}

interface JsonRpcResponse {
  jsonrpc: '2.0';
  result?: any;
  error?: JsonRpcError;
  id: string | number;
}

export class RpcClient {
  private baseUrl: string;
  private requestId = 0;

  constructor(baseUrl: string = import.meta.env.VITE_RPC_BASE_URL || 'http://localhost:3001/rpc') {
    this.baseUrl = baseUrl;
  }

  private getNextId(): number {
    return ++this.requestId;
  }

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async call<T = any>(method: string, params?: any): Promise<T> {
    const request: JsonRpcRequest = {
      jsonrpc: '2.0',
      method,
      params,
      id: this.getNextId(),
    };

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP ${response.status}: ${text || response.statusText}`);
      }

      const data: JsonRpcResponse = await response.json();

      if (data.error) {
        throw new Error(data.error.message || 'Unknown RPC error');
      }

      return data.result;
    } catch (error: any) {
      console.error('❌ RPC call failed:', { method, params, error });
      throw new Error(error.message || 'RPC call failed');
    }
  }

  // ───── AUTH METHODS ─────
  async login(email: string, password: string) {
    return this.call('auth.login', { email, password });
  }

  async registerCustomer(name: string, email: string, password: string) {
    return this.call('auth.registerCustomer', { name, email, password });
  }

  async registerKitchen(name: string, email: string, password: string, kitchenCode?: string) {
    return this.call('auth.registerKitchen', { name, email, password, kitchenCode });
  }

  async logout() {
    return this.call('auth.logout');
  }

  // ───── MENU METHODS ─────
  async getMenu() {
    return this.call('menu.getMenu');
  }

  async getMenuItem(itemId: string) {
    return this.call('menu.getItem', { itemId });
  }

  async addMenuItem(item: {
    name: string;
    description: string;
    price: number;
    category: string;
    image: string;
    available: boolean;
    preparationTime: number;
    ingredients: string[];
    allergens: string[];
  }) {
    return this.call('menu.addItem', { item });
  }

  // ───── ORDER METHODS ─────
  async placeOrder(items: any[], customerInfo: any) {
    return this.call('orders.placeOrder', { items, customerInfo });
  }

  async getOrder(orderId: string) {
    return this.call('orders.getOrder', { orderId });
  }

  async getCustomerOrders() {
    return this.call('orders.getCustomerOrders');
  }

  async updateOrderStatus(orderId: string, status: string) {
    return this.call('orders.updateStatus', { orderId, status });
  }

  // ───── KITCHEN METHODS ─────
  async getKitchenOrders() {
    return this.call('kitchen.getOrders');
  }

  // ───── ANALYTICS METHODS ─────
  async getDashboardStats() {
    return this.call('analytics.getDashboardStats');
  }
}

export const rpcClient = new RpcClient();
