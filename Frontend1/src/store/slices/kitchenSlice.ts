import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { rpcClient } from '@/lib/rpcClient';
import { Order } from './orderSlice';

interface KitchenState {
  orders: Order[];
  activeOrders: Order[];
  completedOrders: Order[];
  isLoading: boolean;
  error: string | null;
  updatingOrder: string | null;
}

const initialState: KitchenState = {
  orders: [],
  activeOrders: [],
  completedOrders: [],
  isLoading: false,
  error: null,
  updatingOrder: null,
};

export const fetchKitchenOrders = createAsyncThunk(
  'kitchen/fetchKitchenOrders',
  async () => {
    const response = await rpcClient.getKitchenOrders();
    return response;
  }
);

export const updateOrderStatus = createAsyncThunk(
  'kitchen/updateOrderStatus',
  async ({ orderId, status }: { orderId: string; status: string }) => {
    const response = await rpcClient.updateOrderStatus(orderId, status);
    return { orderId, status, ...response };
  }
);

const kitchenSlice = createSlice({
  name: 'kitchen',
  initialState,
  reducers: {
    addNewOrder: (state, action) => {
      const newOrder = action.payload;
      state.orders.unshift(newOrder);
      
      if (['pending', 'confirmed', 'preparing'].includes(newOrder.status)) {
        state.activeOrders.unshift(newOrder);
      }
    },
    updateOrder: (state, action) => {
      const { orderId, updates } = action.payload;
      
      // Update in all lists
      [state.orders, state.activeOrders, state.completedOrders].forEach(orderList => {
        const orderIndex = orderList.findIndex(order => order.id === orderId);
        if (orderIndex !== -1) {
          orderList[orderIndex] = { ...orderList[orderIndex], ...updates };
        }
      });

      // Move order between lists if status changed
      if (updates.status) {
        const order = state.orders.find(o => o.id === orderId);
        if (order) {
          if (['ready', 'delivered', 'cancelled'].includes(updates.status)) {
            // Move to completed
            state.activeOrders = state.activeOrders.filter(o => o.id !== orderId);
            if (!state.completedOrders.find(o => o.id === orderId)) {
              state.completedOrders.unshift(order);
            }
          } else if (['pending', 'confirmed', 'preparing'].includes(updates.status)) {
            // Move to active
            state.completedOrders = state.completedOrders.filter(o => o.id !== orderId);
            if (!state.activeOrders.find(o => o.id === orderId)) {
              state.activeOrders.unshift(order);
            }
          }
        }
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Kitchen Orders
      .addCase(fetchKitchenOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchKitchenOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload;
        state.activeOrders = action.payload.filter((order: Order) => 
          ['pending', 'confirmed', 'preparing'].includes(order.status)
        );
        state.completedOrders = action.payload.filter((order: Order) => 
          ['ready', 'delivered', 'cancelled'].includes(order.status)
        );
      })
      .addCase(fetchKitchenOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch orders';
      })
      // Update Order Status
      .addCase(updateOrderStatus.pending, (state, action) => {
        state.updatingOrder = action.meta.arg.orderId;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.updatingOrder = null;
        const { orderId, status } = action.payload;
        
        // Update order in all relevant lists
        [state.orders, state.activeOrders, state.completedOrders].forEach(orderList => {
          const orderIndex = orderList.findIndex(order => order.id === orderId);
          if (orderIndex !== -1) {
            orderList[orderIndex].status = status as Order['status'];
            orderList[orderIndex].updatedAt = new Date().toISOString();
          }
        });
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.updatingOrder = null;
        state.error = action.error.message || 'Failed to update order';
      });
  },
});

export const { addNewOrder, updateOrder, clearError } = kitchenSlice.actions;
export default kitchenSlice.reducer;