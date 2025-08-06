import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { rpcClient } from '@/lib/rpcClient';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'kitchen' | 'admin';
  kitchenCode?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }: { email: string; password: string }) => {
    const response = await rpcClient.login(email, password);
    localStorage.setItem('authToken', response.token);
    return response;
  }
);

export const registerCustomer = createAsyncThunk(
  'auth/registerCustomer',
  async ({ name, email, password }: { name: string; email: string; password: string }) => {
    const response = await rpcClient.registerCustomer(name, email, password);
    localStorage.setItem('authToken', response.token);
    return response;
  }
);

export const registerKitchen = createAsyncThunk(
  'auth/registerKitchen',
  async ({ name, email, password, kitchenCode }: { 
    name: string; 
    email: string; 
    password: string; 
    kitchenCode?: string 
  }) => {
    const response = await rpcClient.registerKitchen(name, email, password, kitchenCode);
    localStorage.setItem('authToken', response.token);
    return response;
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async () => {
    try {
      await rpcClient.logout();
    } catch (error) {
      // Continue with logout even if server call fails
      console.error('Logout error:', error);
    }
    localStorage.removeItem('authToken');
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
    },
    clearCredentials: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Login failed';
      })
      // Register Customer
      .addCase(registerCustomer.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerCustomer.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerCustomer.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Registration failed';
      })
      // Register Kitchen
      .addCase(registerKitchen.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerKitchen.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerKitchen.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Registration failed';
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = null;
      });
  },
});

export const { clearError, setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;