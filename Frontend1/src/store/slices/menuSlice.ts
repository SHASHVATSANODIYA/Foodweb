import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { rpcClient } from '@/lib/rpcClient';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  available: boolean;
  preparationTime?: number;
  ingredients?: string[];
  allergens?: string[];
}

export interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}

interface MenuState {
  categories: MenuCategory[];
  items: MenuItem[];
  selectedCategory: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: MenuState = {
  categories: [],
  items: [],
  selectedCategory: null,
  isLoading: false,
  error: null,
};

// ✅ FIXED: Use rpcClient.call('menu.list')
export const fetchMenu = createAsyncThunk('menu/fetchMenu', async () => {
  const response = await rpcClient.call<{
    items: MenuItem[];
    categories: MenuCategory[];
  }>('menu.list', {});
  return response;
});

export const fetchMenuItem = createAsyncThunk('menu/fetchMenuItem', async (itemId: string) => {
  const response = await rpcClient.call<MenuItem>('menu.getItem', { itemId });
  return response;
});

export const addMenuItem = createAsyncThunk(
  'menu/addItem',
  async (newItem: Omit<MenuItem, 'id'>, { rejectWithValue }) => {
    try {
      const response = await rpcClient.call<MenuItem>('menu.addItem', newItem);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to add menu item');
    }
  }
);

const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMenu.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMenu.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = action.payload.categories || [];
        state.items = action.payload.items || [];
      })
      .addCase(fetchMenu.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch menu';
      })
      .addCase(fetchMenuItem.fulfilled, (state, action) => {
        const updatedItem = action.payload;
        const index = state.items.findIndex((item) => item.id === updatedItem.id);
        if (index !== -1) {
          state.items[index] = updatedItem;
        } else {
          state.items.push(updatedItem);
        }
      })
      .addCase(addMenuItem.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(addMenuItem.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedCategory, clearError } = menuSlice.actions;
export default menuSlice.reducer;
