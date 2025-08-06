import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { X, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { AppDispatch, RootState } from '@/store/store';
import { 
  removeFromCart, 
  updateCartItemQuantity, 
  setCartOpen, 
  clearCart 
} from '@/store/slices/cartSlice';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export const CartSidebar = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items, total, isOpen } = useSelector((state: RootState) => state.cart);

  const handleClose = () => {
    dispatch(setCartOpen(false));
  };

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    dispatch(updateCartItemQuantity({ itemId, quantity }));
  };

  const handleRemoveItem = (itemId: string) => {
    dispatch(removeFromCart(itemId));
  };

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Your Cart ({items.length})
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Your cart is empty</p>
                <Button 
                  variant="outline" 
                  className="mt-4" 
                  onClick={handleClose}
                >
                  Continue Shopping
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto py-4 space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 p-3 border border-border rounded-lg">
                    <div className="w-16 h-16 bg-gradient-subtle rounded-md flex items-center justify-center">
                      {item.menuItem.image ? (
                        <img 
                          src={item.menuItem.image} 
                          alt={item.menuItem.name}
                          className="w-full h-full object-cover rounded-md"
                        />
                      ) : (
                        <span className="text-primary font-medium">
                          {item.menuItem.name.charAt(0)}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{item.menuItem.name}</h4>
                      <p className="text-sm text-muted-foreground truncate">
                        {item.menuItem.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {item.menuItem.category}
                        </Badge>
                        <span className="text-sm font-medium text-primary">
                          ${item.menuItem.price.toFixed(2)}
                        </span>
                      </div>
                      
                      {item.notes && (
                        <p className="text-xs text-muted-foreground mt-1 italic">
                          Note: {item.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>

                      <div className="text-sm font-semibold">
                        ${(item.menuItem.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Cart Summary */}
              <div className="space-y-4 py-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-xl font-bold text-primary">
                    ${total.toFixed(2)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handleClearCart}
                    disabled={items.length === 0}
                  >
                    Clear Cart
                  </Button>
                  <Button 
                    variant="warm" 
                    asChild
                    disabled={items.length === 0}
                  >
                    <Link to="/checkout" onClick={handleClose}>
                      Checkout
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};