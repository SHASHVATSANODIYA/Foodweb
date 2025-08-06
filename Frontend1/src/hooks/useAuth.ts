import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { RootState } from '@/store/store';
import { setCredentials, clearCredentials, User } from '@/store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, token, isAuthenticated, isLoading, error } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    // Check for stored auth data on mount
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('authUser');

    if (storedToken && storedUser && !isAuthenticated) {
      try {
        const parsedUser: User = JSON.parse(storedUser);
        dispatch(setCredentials({ user: parsedUser, token: storedToken }));
      } catch (error) {
        // Clear invalid stored data
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        dispatch(clearCredentials());
      }
    }
  }, [dispatch, isAuthenticated]);

  // Store user data when auth state changes
  useEffect(() => {
    if (isAuthenticated && user) {
      localStorage.setItem('authUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('authUser');
    }
  }, [isAuthenticated, user]);

  const isCustomer = user?.role === 'customer';
  const isKitchen = user?.role === 'kitchen';
  const isAdmin = user?.role === 'admin';

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    isCustomer,
    isKitchen,
    isAdmin,
  };
};