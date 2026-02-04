// app/admin/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { StatCard } from '@/components/dashboard/StatCard';
import { FiUsers, FiGrid, FiBook, FiUserPlus, FiRefreshCw, FiAlertCircle, FiCheck, FiX, FiLoader } from 'react-icons/fi';
import { api } from '@/api/axios';

interface DashboardStats {
  users: number;
  classes: number;
  subjects: number;
  teachers: number;
}

interface ApiStatus {
  users: 'loading' | 'success' | 'error' | 'idle';
  classes: 'loading' | 'success' | 'error' | 'idle';
  subjects: 'loading' | 'success' | 'error' | 'idle';
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    users: 0,
    classes: 0,
    subjects: 0,
    teachers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<string[]>([]);
  const [apiStatus, setApiStatus] = useState<ApiStatus>({
    users: 'idle',
    classes: 'idle',
    subjects: 'idle',
  });
  const [apiErrors, setApiErrors] = useState<string[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setApiErrors([]);
    
    if (!user?.school_id) {
      console.error('No school_id found in user');
      setLoading(false);
      return;
    }

    const schoolId = user.school_id;
    
    try {
      console.log('Fetching dashboard data for school:', schoolId);
      
      // Set loading status
      setApiStatus({
        users: 'loading',
        classes: 'loading',
        subjects: 'loading',
      });

      // Reset stats while loading
      setStats(prev => ({
        ...prev,
        classes: 0,
        subjects: 0,
      }));

      // Fetch all endpoints in parallel
      const [usersPromise, classesPromise, subjectsPromise] = [
        api.get(`/admin/users/${schoolId}`),
        api.get(`/admin/classes/${schoolId}`),
        api.get(`/admin/subjects/${schoolId}`),
      ];

      // Handle each promise separately
      let usersData: any[] = [];
      let classesData: any[] = [];
      let subjectsData: any[] = [];
      const errors: string[] = [];

      try {
        const response = await usersPromise;
        usersData = Array.isArray(response.data) ? response.data : [];
        setApiStatus(prev => ({ ...prev, users: 'success' }));
      } catch (error: any) {
        setApiStatus(prev => ({ ...prev, users: 'error' }));
        errors.push(`Users: ${error.message || 'Request failed'}`);
        usersData = [];
      }

      try {
        const response = await classesPromise;
        classesData = Array.isArray(response.data) ? response.data : [];
        setApiStatus(prev => ({ ...prev, classes: 'success' }));
      } catch (error: any) {
        setApiStatus(prev => ({ ...prev, classes: 'error' }));
        errors.push(`Classes: ${error.message || 'Request failed'}`);
        classesData = [];
      }

      try {
        const response = await subjectsPromise;
        subjectsData = Array.isArray(response.data) ? response.data : [];
        setApiStatus(prev => ({ ...prev, subjects: 'success' }));
      } catch (error: any) {
        setApiStatus(prev => ({ ...prev, subjects: 'error' }));
        errors.push(`Subjects: ${error.message || 'Request failed'}`);
        subjectsData = [];
      }

      // Set any errors
      if (errors.length > 0) {
        setApiErrors(errors);
      }

      // Calculate teachers count
      const teachersCount = usersData.filter(u => u.role === 'teacher').length;

      // Update stats
      setStats({
        users: usersData.length,
        classes: classesData.length,
        subjects: subjectsData.length,
        teachers: teachersCount,
      });

      // Generate recent activity
      const activities: string[] = [];
      
      if (usersData.length > 0) {
        activities.push(`${usersData.length} total users in system`);
        if (teachersCount > 0) {
          activities.push(`${teachersCount} teachers registered`);
        }
      }
      
      if (classesData.length > 0) {
        activities.push(`${classesData.length} classes created`);
      }
      
      if (subjectsData.length > 0) {
        activities.push(`${subjectsData.length} subjects available`);
      }

      // Add timestamp
      const now = new Date();
      const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastUpdated(timestamp);
      activities.push(`Last updated: ${timestamp}`);
      
      setRecentActivity(activities);

      // Log results for debugging
      console.log('Dashboard data fetched:', {
        users: usersData.length,
        classes: classesData.length,
        subjects: subjectsData.length,
        teachers: teachersCount,
        errors: errors.length > 0 ? errors : 'none'
      });

    } catch (error: any) {
      console.error('Failed to fetch dashboard data:', error);
      const errorMsg = `Dashboard: ${error.message || 'Unknown error'}`;
      setApiErrors(prev => [...prev, errorMsg]);
      
      // Don't reset to 0, keep previous data
      setRecentActivity([
        '⚠️ Error fetching data from server',
        `Error: ${errorMsg}`,
        'Check if backend is running',
        `API URL: ${process.env.NEXT_PUBLIC_API_BASE_URL}`
      ]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.school_id) {
      fetchDashboardData();
      
      // Auto-refresh every 30 seconds
      const interval = setInterval(() => {
        fetchDashboardData();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [user, fetchDashboardData]);

  const getStatusIcon = (status: 'loading' | 'success' | 'error' | 'idle') => {
    switch (status) {
      case 'success': 
        return <FiCheck className="text-green-500 text-lg" />;
      case 'error': 
        return <FiX className="text-red-500 text-lg" />;
      case 'loading': 
        return <FiLoader className="text-blue-500 text-lg animate-spin" />;
      default: 
        return <span className="text-gray-500">-</span>;
    }
  };

  const getStatusText = (status: 'loading' | 'success' | 'error' | 'idle', count: number) => {
    switch (status) {
      case 'success': 
        return count > 0 ? `${count} items` : 'Empty';
      case 'error': 
        return 'Offline';
      case 'loading': 
        return 'Loading...';
      default: 
        return 'Idle';
    }
  };

  if (loading && stats.users === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
        <p className="text-gray-600">Loading dashboard data...</p>
        <p className="text-sm text-gray-500 mt-2">
          School ID: {user?.school_id || 'Unknown'}
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
          <p className="text-gray-600 text-sm mt-1">
            Real-time statistics for School ID: {user?.school_id}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-sm text-gray-500">
              Last updated: {lastUpdated}
            </span>
          )}
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
      </div>

      {/* API Status Bar */}
      {(apiErrors.length > 0 || Object.values(apiStatus).some(s => s === 'error')) && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <FiAlertCircle className="text-red-500" />
            <h3 className="font-medium text-red-800">API Connection Issues</h3>
          </div>
          <div className="space-y-1">
            {apiErrors.map((error, index) => (
              <p key={index} className="text-sm text-red-700">{error}</p>
            ))}
          </div>
          <div className="mt-3 text-sm text-gray-600">
            <p>Check if your backend is running at: 
              <code className="bg-gray-100 px-2 py-1 rounded ml-2">
                {process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}
              </code>
            </p>
            <button
              onClick={fetchDashboardData}
              className="mt-2 text-red-700 hover:text-red-900 text-sm font-medium"
            >
              Retry Connection
            </button>
          </div>
        </div>
      )}

      {/* API Status Indicators */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">Users API</span>
            {getStatusIcon(apiStatus.users)}
          </div>
          <p className="text-sm text-gray-600 truncate">
            GET /admin/users/{user?.school_id}
          </p>
          <div className="mt-2 text-xs">
            <span className={`font-medium ${
              apiStatus.users === 'success' ? 'text-green-600' :
              apiStatus.users === 'error' ? 'text-red-600' :
              'text-blue-600'
            }`}>
              {getStatusText(apiStatus.users, stats.users)}
            </span>
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">Classes API</span>
            {getStatusIcon(apiStatus.classes)}
          </div>
          <p className="text-sm text-gray-600 truncate">
            GET /admin/classes/{user?.school_id}
          </p>
          <div className="mt-2 text-xs">
            <span className={`font-medium ${
              apiStatus.classes === 'success' ? 'text-green-600' :
              apiStatus.classes === 'error' ? 'text-red-600' :
              'text-blue-600'
            }`}>
              {getStatusText(apiStatus.classes, stats.classes)}
            </span>
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">Subjects API</span>
            {getStatusIcon(apiStatus.subjects)}
          </div>
          <p className="text-sm text-gray-600 truncate">
            GET /admin/subjects/{user?.school_id}
          </p>
          <div className="mt-2 text-xs">
            <span className={`font-medium ${
              apiStatus.subjects === 'success' ? 'text-green-600' :
              apiStatus.subjects === 'error' ? 'text-red-600' :
              'text-blue-600'
            }`}>
              {getStatusText(apiStatus.subjects, stats.subjects)}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Users"
          value={stats.users}
          icon={<FiUsers size={20} />}
          color="blue"
          trend={getStatusText(apiStatus.users, stats.users)}
          isLoading={apiStatus.users === 'loading'}
        />
        <StatCard
          title="Classes"
          value={stats.classes}
          icon={<FiGrid size={20} />}
          color="green"
          trend={getStatusText(apiStatus.classes, stats.classes)}
          isLoading={apiStatus.classes === 'loading'}
        />
        <StatCard
          title="Subjects"
          value={stats.subjects}
          icon={<FiBook size={20} />}
          color="yellow"
          trend={getStatusText(apiStatus.subjects, stats.subjects)}
          isLoading={apiStatus.subjects === 'loading'}
        />
        <StatCard
          title="Teachers"
          value={stats.teachers}
          icon={<FiUserPlus size={20} />}
          color="red"
          trend={`${stats.teachers} active`}
          isLoading={apiStatus.users === 'loading'}
        />
      </div>

      {/* Welcome Panel */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Welcome to Admin Panel
        </h2>
        <p className="text-gray-600 mb-4">
          Hello <span className="font-medium">{user?.first_name || 'Admin'}</span>, 
          you are logged in as <span className="font-medium">{user?.role || 'admin'}</span> 
          for <span className="font-medium">School ID: {user?.school_id || 'Unknown'}</span>.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-medium text-gray-800 mb-2">Quick Actions</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2 hover:text-blue-600 cursor-pointer transition-colors">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <a href="/admin/users" className="flex-1">Manage users and permissions</a>
              </li>
              <li className="flex items-center gap-2 hover:text-blue-600 cursor-pointer transition-colors">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <a href="/admin/classes" className="flex-1">Create and edit classes</a>
              </li>
              <li className="flex items-center gap-2 hover:text-blue-600 cursor-pointer transition-colors">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <a href="/admin/class-teachers" className="flex-1">Assign teachers to classes</a>
              </li>
              <li className="flex items-center gap-2 hover:text-blue-600 cursor-pointer transition-colors">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <a href="/admin/subjects" className="flex-1">Set up subjects and curriculum</a>
              </li>
            </ul>
          </div>
          
          <div className="border-l-4 border-green-500 pl-4">
            <h3 className="font-medium text-gray-800 mb-2">Recent Activity</h3>
            <ul className="space-y-2 text-sm text-gray-600 max-h-48 overflow-y-auto">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></span>
                    <span className="truncate">{activity}</span>
                  </li>
                ))
              ) : (
                <li className="text-gray-500">No recent activity</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Debug Info (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 className="font-medium text-gray-700 mb-2">Debug Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong>User:</strong> {user?.first_name} {user?.last_name}</p>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Role:</strong> {user?.role}</p>
              <p><strong>School ID:</strong> {user?.school_id}</p>
            </div>
            <div>
              <p><strong>API Base:</strong> {process.env.NEXT_PUBLIC_API_BASE_URL}</p>
              <p><strong>Token:</strong> {user ? 'Present ✓' : 'Missing ✗'}</p>
              <p><strong>Current Time:</strong> {new Date().toLocaleString()}</p>
              <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <button
              onClick={() => {
                console.log('Current auth state:', { user });
                console.log('Dashboard stats:', stats);
                console.log('API status:', apiStatus);
                console.log('API errors:', apiErrors);
                console.log('Last updated:', lastUpdated);
              }}
              className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200"
            >
              Log debug info
            </button>
            <button
              onClick={() => {
                localStorage.clear();
                console.log('LocalStorage cleared');
                window.location.reload();
              }}
              className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200"
            >
              Clear Storage
            </button>
            <button
              onClick={() => fetchDashboardData()}
              className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200"
            >
              Force Refresh
            </button>
          </div>
        </div>
      )}
    </>
  );
}