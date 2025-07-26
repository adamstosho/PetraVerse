import React, { useEffect } from 'react';
import { useAuthStore } from './store/auth';
import { authAPI } from './lib/auth';
import AppRouter from './router/AppRouter';

function App() {
  const { setAuth, clearAuth, setLoading, isLoading } = useAuthStore();

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      if (token && userStr) {
        try {
          // Verify token is still valid by fetching current user
          const response = await authAPI.getCurrentUser();
          setAuth(response.user, token);
        } catch (error) {
          // Token is invalid, clear auth
          clearAuth();
        }
      } else {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [setAuth, clearAuth, setLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading PetraVerse...</p>
        </div>
      </div>
    );
  }

  return <AppRouter />;
}

export default App;