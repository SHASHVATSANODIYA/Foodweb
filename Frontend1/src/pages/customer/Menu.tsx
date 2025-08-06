import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ShoppingCart, Search, Filter, Plus, Clock, Star } from 'lucide-react';
import { AppDispatch, RootState } from '@/store/store';
import { fetchMenu, setSelectedCategory } from '@/store/slices/menuSlice';
import { addToCart, toggleCart } from '@/store/slices/cartSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { MenuItemCard } from '@/components/common/MenuItemCard';
import { CartSidebar } from '@/components/common/CartSidebar';
import { Header } from '@/components/common/Header';

export default function Menu() {
  const dispatch = useDispatch<AppDispatch>();
  const { categories, items, selectedCategory, isLoading, error } = useSelector(
    (state: RootState) => state.menu
  );
  const { items: cartItems, total } = useSelector(
    (state: RootState) => state.cart
  );
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dispatch(fetchMenu());
  }, [dispatch]);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    return matchesSearch && matchesCategory && item.available;
  });

  const handleAddToCart = (item: any) => {
    dispatch(addToCart({ menuItem: item, quantity: 1 }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-warm text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Delicious Food, Delivered Fast
          </h1>
          <p className="text-xl mb-8 opacity-90">
            Order from our fresh menu of chef-prepared dishes
          </p>
          
          {/* Search Bar */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-foreground/70 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search for dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 bg-white/10 border-white/20 text-primary-foreground placeholder:text-primary-foreground/70"
            />
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Categories Sidebar */}
          <aside className="lg:w-64">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Categories
                </h3>
                <div className="space-y-2">
                  <Button
                    variant={!selectedCategory ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => dispatch(setSelectedCategory(null))}
                  >
                    All Items
                  </Button>
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => dispatch(setSelectedCategory(category.id))}
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Menu Items */}
          <main className="flex-1">
            {error && (
              <div className="text-center py-8">
                <p className="text-destructive">{error}</p>
              </div>
            )}

            {filteredItems.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  {searchQuery ? 'No items match your search.' : 'No items available.'}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          </main>
        </div>
      </div>

      {/* Floating Cart Button */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            variant="warm"
            size="lg"
            className="rounded-full shadow-glow"
            onClick={() => dispatch(toggleCart())}
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="font-semibold">{cartItems.length}</span>
            <span className="ml-2">${total.toFixed(2)}</span>
          </Button>
        </div>
      )}

      <CartSidebar />
    </div>
  );
}