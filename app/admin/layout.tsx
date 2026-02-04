// app/admin/layout.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { FiAlertTriangle, FiRefreshCw, FiExternalLink } from 'react-icons/fi';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, loading, user, logout, refreshToken } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastHealthCheck, setLastHealthCheck] = useState<Date | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated && pathname !== '/login') {
      console.log('Not authenticated, redirecting to login');
      router.push('/login');
    }
  }, [isAuthenticated, loading, router, pathname]);

  // Check if user is admin
  useEffect(() => {
    if (!loading && user && user.role !== 'admin') {
      console.warn('Non-admin user trying to access admin panel:', user.role);
      // Redirect to appropriate dashboard based on role
      if (user.role === 'principal') {
        router.push('/principal');
      } else if (user.role === 'teacher') {
        router.push('/teacher');
      } else if (user.role === 'student') {
        router.push('/student');
      } else {
        router.push('/unauthorized');
      }
    }
  }, [user, loading, router]);

  // Connection health check
  const checkConnection = useCallback(async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
      
      // Try to ping the docs endpoint
      const response = await fetch(`${apiUrl}/docs`, {
        method: 'HEAD',
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Backend responded with ${response.status}`);
      }
      
      setConnectionError(null);
      setLastHealthCheck(new Date());
      
      return true;
    } catch (error) {
      console.error('Connection check failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setConnectionError(`Unable to connect to server (${errorMessage})`);
      return false;
    }
  }, []);

  useEffect(() => {
    // Initial connection check
    checkConnection();
    
    // Set up periodic health checks
    const healthCheckInterval = setInterval(checkConnection, 30000); // Every 30 seconds
    
    return () => clearInterval(healthCheckInterval);
  }, [checkConnection]);

  const handleRefreshToken = async () => {
    setIsRefreshing(true);
    try {
      const success = await refreshToken();
      if (success) {
        setConnectionError(null);
        // Soft refresh - reload data without full page reload
        window.location.reload();
      } else {
        setConnectionError('Session expired. Please login again.');
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      setConnectionError('Failed to refresh session. Please login again.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSidebarToggle = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
  };

  const openApiDocs = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
    window.open(`${apiUrl}/docs`, '_blank');
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 bg-blue-500 rounded-full animate-ping"></div>
          </div>
        </div>
        <div className="mt-8 text-center max-w-md">
          <h2 className="text-xl font-semibold text-gray-800">Loading Admin Panel</h2>
          <p className="text-gray-600 mt-2">Initializing your session and checking permissions...</p>
          <div className="mt-6 space-y-2">
            <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 animate-pulse"></div>
            </div>
            <div className="text-xs text-gray-500">
              {user?.school_id ? `School ID: ${user.school_id}` : 'Authenticating...'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show unauthorized state
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center max-w-md mx-4">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <FiAlertTriangle className="text-red-500 text-3xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Access Denied</h2>
          <p className="text-gray-600 mb-6 text-lg">You need to be logged in to access the admin panel.</p>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/login')}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
            >
              Go to Login Page
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Back to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check if user is admin
  if (user && user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center max-w-md mx-4">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {user.role.charAt(0).toUpperCase()}
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Role-Based Access</h2>
          <p className="text-gray-600 mb-2">
            You are logged in as <span className="font-semibold text-blue-600">{user.role}</span>.
          </p>
          <p className="text-gray-600 mb-6">
            This panel is only accessible to users with <span className="font-semibold">Admin</span> role.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => {
                if (user.role === 'principal') router.push('/principal');
                else if (user.role === 'teacher') router.push('/teacher');
                else if (user.role === 'student') router.push('/student');
                else router.push('/');
              }}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
            >
              Go to {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Dashboard
            </button>
            <button
              onClick={logout}
              className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Logout & Switch Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Connection Error Banner */}
      {connectionError && (
        <div className="bg-gradient-to-r from-red-50 to-red-100 border-b border-red-200 shadow-sm">
          <div className="max-w-full mx-auto px-4 py-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center">
                <FiAlertTriangle className="text-red-500 mr-3 flex-shrink-0" size={20} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">{connectionError}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <p className="text-xs text-red-600">
                      API: {process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}
                    </p>
                    {lastHealthCheck && (
                      <p className="text-xs text-red-600">
                        • Last check: {lastHealthCheck.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => checkConnection()}
                  className="flex items-center text-sm bg-red-600 text-white hover:bg-red-700 px-3 py-2 rounded-md transition-colors shadow-sm"
                >
                  <FiRefreshCw className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Retry Connection
                </button>
                <button
                  onClick={openApiDocs}
                  className="flex items-center text-sm bg-gray-800 text-white hover:bg-gray-900 px-3 py-2 rounded-md transition-colors shadow-sm"
                >
                  <FiExternalLink className="mr-2" />
                  API Docs
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Panel Layout */}
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <Sidebar 
          initialCollapsed={sidebarCollapsed}
          onToggle={handleSidebarToggle}
        />

        {/* Main Content Area - Adjusted for sidebar width */}
        <div className={`flex-1 min-w-0 transition-all duration-300 ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'}`}>
          {/* Main Content */}
          <main className="flex-1 overflow-auto bg-gray-50">
            <div className="p-4 md:p-6">
              {/* Simplified Page Header - No duplicate breadcrumb */}
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800 capitalize">
                  {pathname === '/admin' 
                    ? 'Dashboard' 
                    : pathname.split('/').pop()?.replace(/-/g, ' ') || 'Page'
                  }
                </h1>
                {user && (
                  <p className="text-gray-600 mt-1">
                    Welcome, <span className="font-medium">{user.first_name} {user.last_name}</span> • 
                    School ID: <span className="font-medium">{user.school_id}</span>
                  </p>
                )}
              </div>

              {/* Page Content */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
                {children}
              </div>

              {/* Footer */}
              <footer className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex flex-col md:flex-row justify-between items-center gap-3 text-sm text-gray-600">
                  <div>
                    <span className="text-gray-800 font-medium">School Management System</span>
                    <span className="mx-2">•</span>
                    <span>v1.0</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center">
                      <span className={`w-2 h-2 rounded-full mr-2 ${connectionError ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></span>
                      <span className={connectionError ? 'text-red-600' : 'text-green-600'}>
                        {connectionError ? 'Connection Issues' : 'Connected'}
                      </span>
                    </div>
                    <button
                      onClick={openApiDocs}
                      className="text-blue-600 hover:text-blue-800 transition-colors text-sm flex items-center"
                    >
                      <FiExternalLink className="mr-1" size={14} />
                      API Docs
                    </button>
                  </div>
                </div>
              </footer>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}