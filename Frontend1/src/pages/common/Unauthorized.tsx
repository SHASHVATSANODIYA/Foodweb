import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Unauthorized() {
  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center shadow-warm">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-warning/10 rounded-full">
              <AlertTriangle className="w-8 h-8 text-warning" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Access Denied</CardTitle>
          <CardDescription>
            You don't have permission to access this page.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <p className="text-muted-foreground mb-6">
            Please check that you're logged in with the correct account type 
            or contact an administrator if you believe this is an error.
          </p>
          
          <div className="space-y-3">
            <Button variant="default" asChild className="w-full">
              <Link to="/login">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Link>
            </Button>
            
            <div className="text-sm text-muted-foreground">
              Need a different account type?
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to="/register/customer">Customer</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to="/register/kitchen">Kitchen</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}