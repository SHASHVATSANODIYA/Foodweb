import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { rpcClient } from '@/lib/rpcClient';
import { CartItem } from './cartSlice';

export interface Order {
  id: string;
  customerId: string;
  items: CartItem[];
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  total: number;
  createdAt: string;
  updatedAt: string;
  estimatedDeliveryTime?: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address?: string;
  };
  notes?: string;
}

interface OrderState {
  currentOrder: Order | null;
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  placingOrder: boolean;
}

const initialState: OrderState = {
  currentOrder: null,
  orders: [],
  isLoading: false,
  error: null,
  placingOrder: false,
};

export const placeOrder = createAsyncThunk(
  'order/placeOrder',
  async (orderData: {
    items: { menuItemId: string; quantity: number; price: number }[];
    customerInfo: { name: string; phone: string; address?: string };
    notes?: string;
  }, { rejectWithValue }) => {
    try {
      // Destructure the orderData and pass items and customerInfo separately
      const { items, customerInfo, notes } = orderData;
      const response = await rpcClient.placeOrder(items, { ...customerInfo, notes });
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to place order');
    }
  }
);

export const fetchOrder = createAsyncThunk('order/fetchOrder', async (orderId: string) => {
  const response = await rpcClient.getOrder(orderId);
  return response;
});

export const fetchCustomerOrders = createAsyncThunk('order/fetchCustomerOrders', async () => {
  const response = await rpcClient.getCustomerOrders();
  return response;
});

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateOrderStatus: (state, action) => {
      const { orderId, status } = action.payload;
      if (state.currentOrder?.id === orderId) {
        state.currentOrder.status = status;
        state.currentOrder.updatedAt = new Date().toISOString();
      }
      const index = state.orders.findIndex((o) => o.id === orderId);
      if (index !== -1) {
        state.orders[index].status = status;
        state.orders[index].updatedAt = new Date().toISOString();
      }
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(placeOrder.pending, (state) => {
        state.placingOrder = true;
        state.error = null;
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.placingOrder = false;
        state.currentOrder = action.payload;
        state.orders.unshift(action.payload);
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.placingOrder = false;
        state.error = action.error.message || 'Failed to place order';
      })
      .addCase(fetchOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch order';
      })
      .addCase(fetchCustomerOrders.fulfilled, (state, action) => {
        state.orders = action.payload;
      });
  },
});

export const { clearError, updateOrderStatus, clearCurrentOrder } = orderSlice.actions;
export default orderSlice.reducer;
