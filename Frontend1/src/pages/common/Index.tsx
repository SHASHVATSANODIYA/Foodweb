import { Link } from 'react-router-dom';
import { ChefHat, Users, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
      <div className="text-center max-w-4xl mx-auto px-4">
        <div className="flex justify-center mb-8">
          <div className="p-4 bg-gradient-warm rounded-full shadow-warm">
            <ChefHat className="w-16 h-16 text-primary-foreground" />
          </div>
        </div>
        
        <h1 className="text-5xl font-bold mb-6 bg-gradient-warm bg-clip-text text-transparent">
          DishDash
        </h1>
        <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
          Fast, delicious food delivery with real-time kitchen management. 
          Join as a customer to order amazing meals or as kitchen staff to manage orders efficiently.
        </p>
        
        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <Button variant="warm" size="xl" asChild>
            <Link to="/register/customer" className="flex items-center gap-3">
              <Users className="w-5 h-5" />
              Join as Customer
            </Link>
          </Button>
          
          <Button variant="kitchen" size="xl" asChild>
            <Link to="/register/kitchen" className="flex items-center gap-3">
              <Clock className="w-5 h-5" />
              Join as Kitchen Staff
            </Link>
          </Button>
        </div>
        
        <div className="mt-8">
          <Link to="/login" className="text-muted-foreground hover:text-primary transition-colors">
            Already have an account? Sign in →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
