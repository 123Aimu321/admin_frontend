// components/layout/Header.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  FiBell, 
  FiSettings, 
  FiSearch, 
  FiHelpCircle,
  FiMessageSquare,
  FiMoon,
  FiSun,
  FiChevronDown,
  FiLogOut,
  FiUser,
  FiShield,
  FiHome
} from 'react-icons/fi';

export const Header = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(3); // Mock data
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Format page title from pathname
  const getPageTitle = () => {
    if (pathname === '/admin') return 'Dashboard';
    const segment = pathname.split('/').pop();
    if (!segment) return 'Admin';
    
    // Convert kebab-case to Title Case
    return segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
      // Implement search functionality
    }
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const notifications = [
    { id: 1, title: 'New user registered', time: '5 min ago', read: false },
    { id: 2, title: 'Class schedule updated', time: '1 hour ago', read: false },
    { id: 3, title: 'System maintenance', time: '2 hours ago', read: true },
    { id: 4, title: 'New message from principal', time: '1 day ago', read: true },
  ];

  const userMenuItems = [
    { icon: <FiUser size={16} />, label: 'My Profile', action: () => router.push('/admin/profile') },
    { icon: <FiSettings size={16} />, label: 'Settings', action: () => router.push('/admin/settings') },
    { icon: <FiShield size={16} />, label: 'Security', action: () => router.push('/admin/security') },
    { icon: <FiHelpCircle size={16} />, label: 'Help & Support', action: () => window.open('/help', '_blank') },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            {/* Left Section - Breadcrumb & Title */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin')}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Go to Dashboard"
              >
                <FiHome className="text-gray-600 dark:text-gray-400" size={20} />
              </button>
              
              <div className="hidden md:block">
                <nav className="flex items-center space-x-2 text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Admin</span>
                  <span className="text-gray-300 dark:text-gray-600">/</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {getPageTitle()}
                  </span>
                </nav>
                <h1 className="text-lg font-semibold text-gray-800 dark:text-white mt-1">
                  {getPageTitle()} Overview
                </h1>
              </div>
            </div>

            {/* Center Section - Search */}
            <div className="flex-1 max-w-2xl mx-4">
              <form onSubmit={handleSearch} className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" size={18} />
                </div>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users, classes, subjects..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:focus:ring-blue-400 dark:text-white transition-all"
                />
                <button
                  type="submit"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <kbd className="hidden sm:inline-flex items-center px-2 py-1 text-xs font-semibold text-gray-400 border border-gray-300 dark:border-gray-600 rounded">
                    ⌘K
                  </kbd>
                </button>
              </form>
            </div>

            {/* Right Section - Actions & User */}
            <div className="flex items-center space-x-2">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {darkMode ? (
                  <FiSun className="text-yellow-500" size={20} />
                ) : (
                  <FiMoon className="text-gray-600" size={20} />
                )}
              </button>

              {/* Messages */}
              <button
                onClick={() => router.push('/admin/messages')}
                className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Messages"
              >
                <FiMessageSquare className="text-gray-600 dark:text-gray-400" size={20} />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                  2
                </span>
              </button>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  title="Notifications"
                >
                  <FiBell className="text-gray-600 dark:text-gray-400" size={20} />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadNotifications}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setShowNotifications(false)}
                    />
                    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-40 overflow-hidden">
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="font-semibold text-gray-800 dark:text-white">Notifications</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {unreadNotifications} unread
                        </p>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                              !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <p className="font-medium text-gray-800 dark:text-white">
                                {notification.title}
                              </p>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {notification.time}
                              </span>
                            </div>
                            {!notification.read && (
                              <span className="inline-block mt-2 px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300 text-xs rounded-full">
                                New
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                        <button
                          onClick={() => router.push('/admin/notifications')}
                          className="w-full py-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                        >
                          View all notifications
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="hidden md:block text-right">
                    <p className="text-sm font-medium text-gray-800 dark:text-white">
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user?.role} • School {user?.school_id}
                    </p>
                  </div>
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold shadow">
                      {user?.first_name?.[0]}{user?.last_name?.[0]}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                  </div>
                  <FiChevronDown className="text-gray-500" />
                </button>

                {/* User Menu Dropdown */}
                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-40 overflow-hidden">
                      {/* User Info */}
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-lg">
                            {user?.first_name?.[0]}{user?.last_name?.[0]}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-800 dark:text-white">
                              {user?.first_name} {user?.last_name}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {user?.email}
                            </p>
                            <div className="flex items-center mt-1">
                              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300 text-xs rounded-full">
                                {user?.role}
                              </span>
                              <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                School {user?.school_id}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        {userMenuItems.map((item, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              item.action();
                              setShowUserMenu(false);
                            }}
                            className="flex items-center w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            <span className="mr-3">{item.icon}</span>
                            {item.label}
                          </button>
                        ))}
                      </div>

                      {/* Logout & Time */}
                      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {currentTime.toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </span>
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                            {currentTime.toLocaleTimeString('en-US', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                        <button
                          onClick={handleLogout}
                          className="flex items-center justify-center w-full py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        >
                          <FiLogOut className="mr-2" size={16} />
                          Logout
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Page Title */}
        <div className="md:hidden px-4 py-2 border-t border-gray-100 dark:border-gray-800">
          <h1 className="text-lg font-semibold text-gray-800 dark:text-white">
            {getPageTitle()}
          </h1>
          <div className="flex items-center justify-between mt-1">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {user?.role} • School {user?.school_id}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {currentTime.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          </div>
        </div>
      </header>

      {/* Mobile Search Bar (Hidden on desktop) */}
      <div className="md:hidden border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <form onSubmit={handleSearch} className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" size={18} />
          </div>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:focus:ring-blue-400 dark:text-white"
          />
        </form>
      </div>
    </>
  );
};