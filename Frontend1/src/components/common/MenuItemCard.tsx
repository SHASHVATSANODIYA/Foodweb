import { useState } from 'react';
import { Plus, Clock, Star, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MenuItem } from '@/store/slices/menuSlice';

interface MenuItemCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
}

export const MenuItemCard = ({ item, onAddToCart }: MenuItemCardProps) => {
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      onAddToCart(item);
    }
    setQuantity(1);
  };

  return (
    <Card className="group hover:shadow-warm transition-all duration-200 hover:scale-[1.02] overflow-hidden">
      <div className="aspect-video bg-gradient-subtle relative overflow-hidden">
        {item.image ? (
          <img 
            src={item.image} 
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-warm">
            <span className="text-primary-foreground text-lg font-medium">
              {item.name.charAt(0)}
            </span>
          </div>
        )}
        <div className="absolute top-2 left-2">
          <Badge variant="secondary" className="bg-background/90">
            {item.category}
          </Badge>
        </div>
        {item.preparationTime && (
          <div className="absolute top-2 right-2">
            <Badge variant="outline" className="bg-background/90">
              <Clock className="w-3 h-3 mr-1" />
              {item.preparationTime}m
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg line-clamp-1">{item.name}</h3>
            <p className="text-muted-foreground text-sm line-clamp-2 mt-1">
              {item.description}
            </p>
          </div>

          {item.allergens && item.allergens.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {item.allergens.map((allergen) => (
                <Badge key={allergen} variant="outline" className="text-xs">
                  {allergen}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-primary">
                ${item.price.toFixed(2)}
              </span>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Star className="w-3 h-3 fill-warning text-warning" />
                <span className="text-xs">4.5</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="w-3 h-3" />
                </Button>
                <span className="w-8 text-center text-sm font-medium">
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>

              <Button 
                variant="warm" 
                size="sm" 
                onClick={handleAddToCart}
                className="ml-2"
              >
                <Plus className="w-4 h-4" />
                Add
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};