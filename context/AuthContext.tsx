// context/AuthContext.tsx
'use client';

import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, AuthState, LoginResponse } from '@/types/auth';
import { authApi } from '@/api/auth';
import { api } from '@/api/axios';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (user: User) => void;
  clearError: () => void;
  refreshToken: () => Promise<boolean>;
  initializeAuth: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: true,
    error: null,
    initialized: false,
  });

  // Helper to set axios default headers
  const setAxiosAuthHeader = useCallback((token: string | null) => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, []);

  // Refresh token function
  const refreshToken = useCallback(async (): Promise<boolean> => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) return false;

    try {
      const response = await authApi.refreshToken(refreshToken);
      
      localStorage.setItem('access_token', response.access_token);
      if (response.refresh_token) {
        localStorage.setItem('refresh_token', response.refresh_token);
      }
      
      setAxiosAuthHeader(response.access_token);
      setState(prev => ({
        ...prev,
        token: response.access_token,
      }));
      
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Auto logout on refresh failure
      logout();
      return false;
    }
  }, [setAxiosAuthHeader]);

  // Initialize auth state
  const initializeAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      const userStr = localStorage.getItem('user');
      const refreshTokenValue = localStorage.getItem('refresh_token');
      
      if (token && userStr && refreshTokenValue) {
        // Validate token by making a test request
        setAxiosAuthHeader(token);
        
        try {
          // Optional: Verify token is still valid by making a lightweight API call
          const user = JSON.parse(userStr);
          
          setState({
            user,
            token,
            isAuthenticated: true,
            loading: false,
            error: null,
            initialized: true,
          });
          
          // Set up auto token refresh (5 minutes before expiry)
          const expiryTime = 55 * 60 * 1000; // 55 minutes in milliseconds
          setTimeout(() => {
            if (state.isAuthenticated) {
              refreshToken();
            }
          }, expiryTime);
          
        } catch (error) {
          console.error('Token validation failed:', error);
          // Try to refresh token
          const refreshed = await refreshToken();
          if (!refreshed) {
            logout();
          }
        }
      } else {
        // Clear any invalid auth data
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        localStorage.removeItem('refresh_token');
        setState({
          user: null,
          token: null,
          isAuthenticated: false,
          loading: false,
          error: null,
          initialized: true,
        });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      setState({
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: 'Failed to initialize authentication',
        initialized: true,
      });
    }
  }, [refreshToken, setAxiosAuthHeader]);

  // Initialize on mount
  useEffect(() => {
    initializeAuth();
    
    // Set up periodic token refresh (every 50 minutes)
    const refreshInterval = setInterval(() => {
      if (state.isAuthenticated) {
        refreshToken();
      }
    }, 50 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, [initializeAuth, refreshToken, state.isAuthenticated]);

  const login = async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await authApi.login({ email, password });
      
      // Validate response structure
      if (!response.access_token || !response.user_id) {
        throw new Error('Invalid login response from server');
      }
      
      // Save to localStorage
      localStorage.setItem('access_token', response.access_token);
      if (response.refresh_token) {
        localStorage.setItem('refresh_token', response.refresh_token);
      }
      
      // Extract user data from response
      const user: User = {
        user_id: response.user_id,
        school_id: response.school_id || 1, // Default to 1 if not provided
        first_name: response.first_name || '',
        last_name: response.last_name || '',
        email: response.email || email,
        role: (response.role || 'admin') as User['role'],
        is_active: true,
        created_at: new Date().toISOString(),
      };
      
      localStorage.setItem('user', JSON.stringify(user));
      
      // Set axios headers
      setAxiosAuthHeader(response.access_token);
      
      setState({
        user,
        token: response.access_token,
        isAuthenticated: true,
        loading: false,
        error: null,
        initialized: true,
      });
      
      return { success: true };
      
    } catch (error: any) {
      console.error('Login error:', error);
      
      let errorMessage = 'Login failed. Please check your credentials.';
      let shouldClearStorage = false;
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        errorMessage = 'Invalid email or password';
        shouldClearStorage = true;
      } else if (error.response?.status === 404) {
        errorMessage = 'Account not found';
      } else if (error.response?.status === 403) {
        errorMessage = 'Account is not active or has been suspended';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.message === 'Network Error') {
        errorMessage = 'Unable to connect to server. Please check your internet connection.';
      } else if (error.response?.data) {
        const errorData = error.response.data;
        
        if (errorData.detail) {
          if (typeof errorData.detail === 'string') {
            errorMessage = errorData.detail;
          } else if (Array.isArray(errorData.detail)) {
            errorMessage = errorData.detail
              .map((err: any) => err.msg || err.message || 'Validation error')
              .join(', ');
          }
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      }
      
      if (shouldClearStorage) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
      }
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        initialized: true,
      }));
      
      return { success: false, error: errorMessage };
    }
  };

  const logout = useCallback(() => {
    // Clear all auth data
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    
    // Clear axios headers
    setAxiosAuthHeader(null);
    
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,
      initialized: true,
    });
    
    // Optional: Call logout API if exists
    // authApi.logout().catch(console.error);
    
    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }, [setAxiosAuthHeader]);

  const updateUser = useCallback((user: User) => {
    localStorage.setItem('user', JSON.stringify(user));
    setState(prev => ({ ...prev, user }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    updateUser,
    clearError,
    refreshToken,
    initializeAuth,
  };

  // Show loading while initializing
  if (state.loading && !state.initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using auth context
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Optional: Higher-order component for protected routes
export const withAuth = <P extends object>(Component: React.ComponentType<P>) => {
  return function WithAuthComponent(props: P) {
    const { isAuthenticated, loading } = useAuth();
    
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }
    
    if (!isAuthenticated) {
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return null;
    }
    
    return <Component {...props} />;
  };
};