import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { ChefHat, User, LogOut, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { logoutUser } from '@/store/slices/authSlice';
import { AppDispatch } from '@/store/store';

export const Header = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user, isCustomer, isKitchen } = useAuth();

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  return (
    <header className="bg-background border-b border-border shadow-soft">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to={isCustomer ? "/menu" : "/kitchen"} className="flex items-center gap-2 font-bold text-xl">
          <div className="p-2 bg-gradient-warm rounded-lg">
            <ChefHat className="w-6 h-6 text-primary-foreground" />
          </div>
          DishDash
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {isCustomer && (
            <>
              <Link to="/menu" className="text-foreground hover:text-primary transition-colors">
                Menu
              </Link>
              <Link to="/cart" className="text-foreground hover:text-primary transition-colors">
                Cart
              </Link>
            </>
          )}
          {isKitchen && (
            <>
              <Link to="/kitchen" className="text-foreground hover:text-primary transition-colors">
                Kitchen
              </Link>
              <Link to="/dashboard" className="text-foreground hover:text-primary transition-colors">
                Analytics
              </Link>
            </>
          )}
        </nav>

        {/* User Menu */}
        <div className="flex items-center gap-4">
          {isCustomer && (
            <Button variant="outline" size="sm" asChild>
              <Link to="/cart">
                <ShoppingCart className="w-4 h-4" />
                Cart
              </Link>
            </Button>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {user?.name}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                {user?.email}
              </div>
              <DropdownMenuSeparator />
              {isCustomer && (
                <>
                  <DropdownMenuItem asChild>
                    <Link to="/menu">Menu</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/cart">Cart</Link>
                  </DropdownMenuItem>
                </>
              )}
              {isKitchen && (
                <>
                  <DropdownMenuItem asChild>
                    <Link to="/kitchen">Kitchen</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard">Analytics</Link>
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};