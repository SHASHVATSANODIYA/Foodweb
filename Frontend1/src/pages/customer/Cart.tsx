import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, ArrowRight } from 'lucide-react';
import { RootState } from '@/store/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/common/Header';
import { CartSidebar } from '@/components/common/CartSidebar';

export default function Cart() {
  const { items, total } = useSelector((state: RootState) => state.cart);
  const deliveryFee = 2.99;
  const tax = total * 0.1;
  const grandTotal = total + deliveryFee + tax;

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
              <h1 className="text-3xl font-bold">Your Cart</h1>
              <p className="text-muted-foreground">{items.length} items</p>
            </div>
          </div>

          {items.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
                <p className="text-muted-foreground mb-6">
                  Add some delicious items from our menu to get started!
                </p>
                <Button variant="warm" asChild>
                  <Link to="/menu">
                    Browse Menu
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Cart Items</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between border p-4 rounded-md"
                      >
                        <div>
                          <h4 className="font-semibold">{item.menuItem.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {item.menuItem.description}
                          </p>
                          <p className="text-sm">
                            Qty: {item.quantity} × ${item.menuItem.price.toFixed(2)}
                          </p>
                          {item.notes && (
                            <p className="text-xs italic text-muted-foreground mt-1">
                              Note: {item.notes}
                            </p>
                          )}
                        </div>
                        <div className="text-right font-semibold">
                          ${(item.menuItem.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Fee</span>
                      <span>${deliveryFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    <hr />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span>${grandTotal.toFixed(2)}</span>
                    </div>

                    <Button variant="warm" size="lg" className="w-full" asChild>
                      <Link to="/checkout">
                        Proceed to Checkout
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>

      <CartSidebar />
    </div>
  );
}
