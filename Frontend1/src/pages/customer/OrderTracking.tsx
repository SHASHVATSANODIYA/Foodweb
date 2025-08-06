import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Clock, 
  CheckCircle, 
  Truck, 
  ChefHat, 
  Package, 
  MapPin,
  ArrowLeft 
} from 'lucide-react';

import { AppDispatch, RootState } from '@/store/store';
import { fetchOrder } from '@/store/slices/orderSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Header } from '@/components/common/Header';

const statusSteps = [
  { key: 'pending', label: 'Order Placed', icon: Package },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { key: 'preparing', label: 'Preparing', icon: ChefHat },
  { key: 'ready', label: 'Ready', icon: Clock },
  { key: 'delivered', label: 'Delivered', icon: Truck },
];

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

const getProgressValue = (status: string) => {
  switch (status) {
    case 'pending': return 20;
    case 'confirmed': return 40;
    case 'preparing': return 60;
    case 'ready': return 80;
    case 'delivered': return 100;
    default: return 0;
  }
};

export default function OrderTracking() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { currentOrder, isLoading, error } = useSelector(
    (state: RootState) => state.order
  );

  useEffect(() => {
    if (id) {
      dispatch(fetchOrder(id));
    }
  }, [dispatch, id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error || !currentOrder) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="py-8">
              <h2 className="text-xl font-semibold mb-4">Order Not Found</h2>
              <p className="text-muted-foreground mb-6">
                {error || 'The order you are looking for does not exist.'}
              </p>
              <Button variant="warm" asChild>
                <Link to="/menu">Browse Menu</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentStepIndex = statusSteps.findIndex(step => step.key === currentOrder.status);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" asChild>
              <Link to="/menu">
                <ArrowLeft className="w-4 h-4" />
                Back to Menu
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Order #{currentOrder.id.slice(-8)}</h1>
              <p className="text-muted-foreground">
                Placed on {new Date(currentOrder.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Order Status */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Order Status</span>
                    <Badge className={getStatusColor(currentOrder.status)}>
                      {currentOrder.status.charAt(0).toUpperCase() + currentOrder.status.slice(1)}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Progress value={getProgressValue(currentOrder.status)} className="h-2" />
                  
                  <div className="space-y-4">
                    {statusSteps.map((step, index) => {
                      const Icon = step.icon;
                      const isCompleted = index <= currentStepIndex;
                      const isCurrent = index === currentStepIndex;
                      
                      return (
                        <div 
                          key={step.key}
                          className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                            isCurrent 
                              ? 'bg-primary/10 border border-primary/20' 
                              : isCompleted 
                                ? 'bg-success/10' 
                                : 'bg-muted/50'
                          }`}
                        >
                          <div className={`p-2 rounded-full ${
                            isCurrent 
                              ? 'bg-primary text-primary-foreground' 
                              : isCompleted 
                                ? 'bg-success text-success-foreground' 
                                : 'bg-muted text-muted-foreground'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <h4 className={`font-medium ${
                              isCurrent ? 'text-primary' : isCompleted ? 'text-success' : 'text-muted-foreground'
                            }`}>
                              {step.label}
                            </h4>
                            {isCurrent && (
                              <p className="text-sm text-muted-foreground">
                                Currently in progress...
                              </p>
                            )}
                          </div>
                          {isCompleted && (
                            <CheckCircle className="w-5 h-5 text-success" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {currentOrder.estimatedDeliveryTime && (
                    <div className="p-4 bg-gradient-subtle rounded-lg">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Clock className="w-4 h-4" />
                        Estimated Delivery
                      </div>
                      <p className="text-lg font-semibold mt-1">
                        {new Date(currentOrder.estimatedDeliveryTime).toLocaleTimeString()}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Delivery Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Delivery Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-medium">{currentOrder.customerInfo.name}</h4>
                    <p className="text-muted-foreground">{currentOrder.customerInfo.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Delivery Address</p>
                    <p className="text-muted-foreground">{currentOrder.customerInfo.address}</p>
                  </div>
                  {currentOrder.notes && (
                    <div>
                      <p className="text-sm font-medium">Special Instructions</p>
                      <p className="text-muted-foreground">{currentOrder.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {currentOrder.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{item.menuItem.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            Qty: {item.quantity} × ${item.menuItem.price.toFixed(2)}
                          </p>
                        </div>
                        <span className="text-sm font-medium">
                          ${(item.menuItem.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <hr />

                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>${currentOrder.total.toFixed(2)}</span>
                  </div>

                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/menu">Order Again</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}