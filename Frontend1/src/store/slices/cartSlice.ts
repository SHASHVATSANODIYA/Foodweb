import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MenuItem } from './menuSlice';

export interface CartItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
  customizations?: Record<string, any>;
}

interface CartState {
  items: CartItem[];
  total: number;
  isOpen: boolean;
}

const initialState: CartState = {
  items: [],
  total: 0,
  isOpen: false,
};

const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => {
    return total + (item.menuItem.price * item.quantity);
  }, 0);
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<{
      menuItem: MenuItem;
      quantity?: number;
      notes?: string;
      customizations?: Record<string, any>;
    }>) => {
      const { menuItem, quantity = 1, notes, customizations } = action.payload;
      
      const existingItemIndex = state.items.findIndex(
        item => item.menuItem.id === menuItem.id && 
                 JSON.stringify(item.customizations) === JSON.stringify(customizations)
      );

      if (existingItemIndex >= 0) {
        state.items[existingItemIndex].quantity += quantity;
        if (notes) {
          state.items[existingItemIndex].notes = notes;
        }
      } else {
        state.items.push({
          id: `${menuItem.id}-${Date.now()}`,
          menuItem,
          quantity,
          notes,
          customizations,
        });
      }

      state.total = calculateTotal(state.items);
    },

    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      state.total = calculateTotal(state.items);
    },

    updateCartItemQuantity: (state, action: PayloadAction<{
      itemId: string;
      quantity: number;
    }>) => {
      const { itemId, quantity } = action.payload;
      const item = state.items.find(item => item.id === itemId);
      
      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter(item => item.id !== itemId);
        } else {
          item.quantity = quantity;
        }
        state.total = calculateTotal(state.items);
      }
    },

    updateCartItemNotes: (state, action: PayloadAction<{
      itemId: string;
      notes: string;
    }>) => {
      const { itemId, notes } = action.payload;
      const item = state.items.find(item => item.id === itemId);
      
      if (item) {
        item.notes = notes;
      }
    },

    clearCart: (state) => {
      state.items = [];
      state.total = 0;
    },

    toggleCart: (state) => {
      state.isOpen = !state.isOpen;
    },

    setCartOpen: (state, action: PayloadAction<boolean>) => {
      state.isOpen = action.payload;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateCartItemQuantity,
  updateCartItemNotes,
  clearCart,
  toggleCart,
  setCartOpen,
} = cartSlice.actions;

export default cartSlice.reducer;