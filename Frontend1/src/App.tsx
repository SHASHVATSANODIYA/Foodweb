import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store/store';

// Pages
import Index from "./pages/common/Index";
import Login from "./pages/auth/Login";
import CustomerRegister from "./pages/auth/register/Customer";
import KitchenRegister from "./pages/auth/register/Kitchen";
import Menu from "./pages/customer/Menu";
import Cart from "./pages/customer/Cart";
import Checkout from "./pages/customer/Checkout";
import OrderTracking from "./pages/customer/OrderTracking";
import Kitchen from "./pages/kitchen/Kitchen";
import Dashboard from "./pages/admin/Dashboard";
import NotFound from "./pages/common/NotFound";
import Unauthorized from "./pages/common/Unauthorized";

// Components
import { ProtectedRoute } from "./components/common/ProtectedRoute";
import { LoadingSpinner } from "./components/ui/LoadingSpinner";

const queryClient = new QueryClient();

const App = () => (
  <Provider store={store}>
    <PersistGate 
      loading={
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      } 
      persistor={persistor}
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register/customer" element={<CustomerRegister />} />
              <Route path="/register/kitchen" element={<KitchenRegister />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* Customer Routes */}
              <Route 
                path="/menu" 
                element={
                  <ProtectedRoute requiredRole="customer">
                    <Menu />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/cart" 
                element={
                  <ProtectedRoute requiredRole="customer">
                    <Cart />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/checkout" 
                element={
                  <ProtectedRoute requiredRole="customer">
                    <Checkout />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/order/:id" 
                element={
                  <ProtectedRoute requiredRole="customer">
                    <OrderTracking />
                  </ProtectedRoute>
                } 
              />

              {/* Kitchen Routes */}
              <Route 
                path="/kitchen" 
                element={
                  <ProtectedRoute requiredRole="kitchen">
                    <Kitchen />
                  </ProtectedRoute>
                } 
              />

              {/* Admin Routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={["admin", "kitchen"]}>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </PersistGate>
  </Provider>
);

export default App;
