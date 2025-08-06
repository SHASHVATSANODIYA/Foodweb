import { useEffect, useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  Package,
  Users,
  Clock,
  ChefHat,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/common/Header';
import { rpcClient } from '@/lib/rpcClient';
import { AddMenuItemForm } from '@/components/common/AddMenuItemForm';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  activeOrders: number;
  todayOrders: number;
  todayRevenue: number;
  popularItems: Array<{
    name: string;
    orders: number;
    revenue: number;
  }>;
  recentOrders: Array<{
    id: string;
    customerName: string;
    total: number;
    status: string;
    createdAt: string;
  }>;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    avgOrderValue: 0,
    activeOrders: 0,
    todayOrders: 0,
    todayRevenue: 0,
    popularItems: [],
    recentOrders: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const data = await rpcClient.getDashboardStats();
        setStats(data);
        setError(null);
      } catch (err) {
        setError('Failed to load dashboard statistics');
        console.error('Dashboard stats error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-warning text-warning-foreground';
      case 'confirmed': return 'bg-primary text-primary-foreground';
      case 'preparing': return 'bg-kitchen text-kitchen-foreground';
      case 'ready':
      case 'delivered': return 'bg-success text-success-foreground';
      case 'cancelled': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatCurrency = (amount: unknown) =>
    typeof amount === 'number' ? amount.toFixed(2) : '0.00';

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">

          {/* Page Title */}
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-gradient-warm rounded-lg">
              <ChefHat className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
              <p className="text-muted-foreground">Real-time insights into your restaurant performance</p>
            </div>
          </div>

          {/* ✅ Add Menu Item Form Section */}
          <div className="mb-12">
            <Card>
              <CardHeader>
                <CardTitle>Add New Menu Item</CardTitle>
              </CardHeader>
              <CardContent>
                <AddMenuItemForm />
              </CardContent>
            </Card>
          </div>

          {/* Loading and Error */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-8 bg-muted rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Card className="max-w-md mx-auto text-center">
              <CardContent className="py-8">
                <h2 className="text-xl font-semibold mb-4">Error Loading Dashboard</h2>
                <p className="text-muted-foreground mb-6">{error}</p>
                <Button variant="warm" onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardHeader className="flex justify-between pb-2">
                    <CardTitle className="text-sm">Today's Revenue</CardTitle>
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">
                      ${formatCurrency(stats.todayRevenue)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      From {stats.todayOrders} orders today
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex justify-between pb-2">
                    <CardTitle className="text-sm">Active Orders</CardTitle>
                    <Package className="w-4 h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-kitchen">{stats.activeOrders}</div>
                    <p className="text-xs text-muted-foreground">Currently being processed</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex justify-between pb-2">
                    <CardTitle className="text-sm">Total Orders</CardTitle>
                    <Users className="w-4 h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalOrders}</div>
                    <p className="text-xs text-muted-foreground">All time orders</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex justify-between pb-2">
                    <CardTitle className="text-sm">Avg Order Value</CardTitle>
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-success">
                      ${formatCurrency(stats.avgOrderValue)}
                    </div>
                    <p className="text-xs text-muted-foreground">Average per order</p>
                  </CardContent>
                </Card>
              </div>

              {/* Popular Items and Recent Orders */}
              <div className="grid lg:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Popular Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {Array.isArray(stats.popularItems) && stats.popularItems.length > 0 ? (
                      <div className="space-y-4">
                        {stats.popularItems.map((item, index) => (
                          <div key={item.name} className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-warm rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                                {index + 1}
                              </div>
                              <div>
                                <h4 className="font-medium">{item.name}</h4>
                                <p className="text-sm text-muted-foreground">{item.orders} orders</p>
                              </div>
                            </div>
                            <div className="text-right font-semibold text-primary">
                              ${formatCurrency(item.revenue)}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center py-8 text-muted-foreground">No data available</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {Array.isArray(stats.recentOrders) && stats.recentOrders.length > 0 ? (
                      <div className="space-y-4">
                        {stats.recentOrders.map((order) => (
                          <div
                            key={order.id}
                            className="flex justify-between items-center p-3 bg-muted/30 rounded-lg"
                          >
                            <div>
                              <h4 className="font-medium text-sm">Order #{order.id.slice(-6)}</h4>
                              <p className="text-xs text-muted-foreground">{order.customerName}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(order.createdAt).toLocaleTimeString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-sm">
                                ${formatCurrency(order.total)}
                              </div>
                              <Badge className={`${getStatusColor(order.status)} text-xs`}>
                                {order.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center py-8 text-muted-foreground">No recent orders</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Summary Cards */}
              <div className="grid md:grid-cols-2 gap-6 mt-8">
                <Card className="bg-gradient-warm text-primary-foreground">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Total Revenue
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-2">
                      ${formatCurrency(stats.totalRevenue)}
                    </div>
                    <p className="text-primary-foreground/80">All time restaurant revenue</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-kitchen text-kitchen-foreground">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Today's Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-2">{stats.todayOrders}</div>
                    <p className="text-kitchen-foreground/80">Orders completed today</p>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
