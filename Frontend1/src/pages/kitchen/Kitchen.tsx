import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ChefHat, Clock, Package, CheckCircle, AlertCircle } from 'lucide-react';

import { AppDispatch, RootState } from '@/store/store';
import { fetchKitchenOrders, updateOrderStatus } from '@/store/slices/kitchenSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Header } from '@/components/common/Header';
import { Order } from '@/store/slices/orderSlice';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-warning text-warning-foreground';
    case 'confirmed': return 'bg-primary text-primary-foreground';
    case 'preparing': return 'bg-kitchen text-kitchen-foreground';
    case 'ready': return 'bg-success text-success-foreground';
    case 'delivered': return 'bg-success text-success-foreground';
    case 'cancelled': return 'bg-destructive text-destructive-foreground';
    default: return 'bg-muted text-muted-foreground';
  }
};

const getNextStatus = (currentStatus: string) => {
  switch (currentStatus) {
    case 'pending': return 'confirmed';
    case 'confirmed': return 'preparing';
    case 'preparing': return 'ready';
    case 'ready': return 'delivered';
    default: return null;
  }
};

const getNextStatusLabel = (currentStatus: string) => {
  switch (currentStatus) {
    case 'pending': return 'Confirm Order';
    case 'confirmed': return 'Start Preparing';
    case 'preparing': return 'Mark Ready';
    case 'ready': return 'Mark Delivered';
    default: return null;
  }
};

interface OrderCardProps {
  order: Order;
  onStatusUpdate: (orderId: string, status: string) => void;
  isUpdating: boolean;
}

const OrderCard = ({ order, onStatusUpdate, isUpdating }: OrderCardProps) => {
  const nextStatus = getNextStatus(order.status);
  const nextStatusLabel = getNextStatusLabel(order.status);
  const orderTime = new Date(order.createdAt);
  const timeSinceOrder = Math.floor((Date.now() - orderTime.getTime()) / (1000 * 60));

  return (
    <Card className="hover:shadow-warm transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            Order #{order.id.slice(-8)}
          </CardTitle>
          <Badge className={getStatusColor(order.status)}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Badge>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {timeSinceOrder} min ago
          </div>
          <div>
            {order.customerInfo.name}
          </div>
          <div className="font-medium text-primary">
            ${order.total.toFixed(2)}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Order Items */}
        <div className="space-y-2">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between items-center p-2 bg-muted/30 rounded">
              <div>
                <span className="font-medium">{item.menuItem.name}</span>
                {item.notes && (
                  <p className="text-xs text-muted-foreground italic">
                    Note: {item.notes}
                  </p>
                )}
              </div>
              <Badge variant="outline">
                x{item.quantity}
              </Badge>
            </div>
          ))}
        </div>

        {/* Customer Info */}
        <div className="p-3 bg-accent/30 rounded text-sm">
          <div className="font-medium">{order.customerInfo.name}</div>
          <div className="text-muted-foreground">{order.customerInfo.phone}</div>
          <div className="text-muted-foreground">{order.customerInfo.address}</div>
        </div>

        {/* Special Instructions */}
        {order.notes && (
          <div className="p-3 bg-warning/10 border border-warning/20 rounded">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-warning mt-0.5" />
              <div>
                <p className="text-sm font-medium">Special Instructions:</p>
                <p className="text-sm text-muted-foreground">{order.notes}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {nextStatus && nextStatusLabel && (
            <Button
              variant="kitchen"
              className="flex-1"
              onClick={() => onStatusUpdate(order.id, nextStatus)}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {nextStatusLabel}
                </>
              )}
            </Button>
          )}
          
          {order.status !== 'cancelled' && order.status !== 'delivered' && (
            <Button
              variant="destructive"
              onClick={() => onStatusUpdate(order.id, 'cancelled')}
              disabled={isUpdating}
            >
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default function Kitchen() {
  const dispatch = useDispatch<AppDispatch>();
  const { 
    activeOrders, 
    completedOrders, 
    isLoading, 
    error, 
    updatingOrder 
  } = useSelector((state: RootState) => state.kitchen);

  useEffect(() => {
    dispatch(fetchKitchenOrders());
    
    // Set up polling for new orders
    const interval = setInterval(() => {
      dispatch(fetchKitchenOrders());
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, [dispatch]);

  const handleStatusUpdate = (orderId: string, status: string) => {
    dispatch(updateOrderStatus({ orderId, status }));
  };

  if (isLoading && activeOrders.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-gradient-kitchen rounded-lg">
              <ChefHat className="w-8 h-8 text-kitchen-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Kitchen Dashboard</h1>
              <p className="text-muted-foreground">
                {activeOrders.length} active orders
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-destructive">{error}</p>
            </div>
          )}

          <Tabs defaultValue="active" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="active" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Active Orders ({activeOrders.length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Completed ({completedOrders.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-6">
              {activeOrders.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h2 className="text-xl font-semibold mb-2">No Active Orders</h2>
                    <p className="text-muted-foreground">
                      All caught up! New orders will appear here automatically.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {activeOrders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onStatusUpdate={handleStatusUpdate}
                      isUpdating={updatingOrder === order.id}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-6">
              {completedOrders.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <CheckCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h2 className="text-xl font-semibold mb-2">No Completed Orders</h2>
                    <p className="text-muted-foreground">
                      Completed orders will appear here.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {completedOrders.slice(0, 20).map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onStatusUpdate={handleStatusUpdate}
                      isUpdating={updatingOrder === order.id}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}