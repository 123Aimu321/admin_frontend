// components/layout/Sidebar.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FiUsers, 
  FiBook, 
  FiGrid, 
  FiUserPlus, 
  FiLink,
  FiHome,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiSettings,
  FiBarChart2,
  FiBell,
  FiFileText,
  FiCalendar,
  FiMessageSquare,
  FiChevronsLeft,
  FiChevronsRight
} from 'react-icons/fi';
import { useAuth } from '@/hooks/useAuth';

interface SidebarProps {
  initialCollapsed?: boolean;
  onToggle?: (collapsed: boolean) => void;
}

const menuItems = [
  { 
    path: '/admin', 
    label: 'Dashboard', 
    icon: <FiHome size={20} />,
    description: 'Overview and analytics'
  },
  { 
    path: '/admin/users', 
    label: 'Users', 
    icon: <FiUsers size={20} />,
    description: 'Manage all users'
  },
  { 
    path: '/admin/classes', 
    label: 'Classes', 
    icon: <FiGrid size={20} />,
    description: 'Manage classes'
  },
  { 
    path: '/admin/subjects', 
    label: 'Subjects', 
    icon: <FiBook size={20} />,
    description: 'Manage subjects'
  },
  { 
    path: '/admin/class-teachers', 
    label: 'Class Teachers', 
    icon: <FiUserPlus size={20} />,
    description: 'Assign teachers'
  },
  { 
    path: '/admin/class-subjects', 
    label: 'Class Subjects', 
    icon: <FiLink size={20} />,
    description: 'Assign subjects'
  },
  // Optional additional items
  { 
    path: '/admin/reports', 
    label: 'Reports', 
    icon: <FiBarChart2 size={20} />,
    description: 'View reports'
  },
  { 
    path: '/admin/announcements', 
    label: 'Announcements', 
    icon: <FiBell size={20} />,
    description: 'Manage announcements'
  },
  { 
    path: '/admin/settings', 
    label: 'Settings', 
    icon: <FiSettings size={20} />,
    description: 'System settings'
  },
];

export const Sidebar = ({ initialCollapsed = false, onToggle }: SidebarProps) => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const [isMobile, setIsMobile] = useState(false);
  const [hovered, setHovered] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile && !collapsed) {
        setCollapsed(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [collapsed]);

  const handleToggle = () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    if (onToggle) onToggle(newCollapsed);
  };

  const handleMouseEnter = () => {
    if (collapsed && !isMobile) {
      setHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (collapsed && !isMobile) {
      setHovered(false);
    }
  };

  const sidebarWidth = collapsed ? (hovered ? 'w-64' : 'w-16') : 'w-64';
  const isExpanded = !collapsed || hovered;

  return (
    <>
      {/* Sidebar Container - Fixed position */}
      <div 
        className="fixed left-0 top-0 h-screen z-40 flex-shrink-0"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Main Sidebar */}
        <div 
          className={`
            h-full bg-gray-800 text-white
            transition-all duration-300 ease-in-out
            flex flex-col
            ${sidebarWidth}
            ${collapsed && !hovered ? 'shadow-lg' : 'shadow-xl'}
          `}
        >
          {/* Header Section - Fixed height */}
          <div className="p-4 border-b border-gray-700 flex-shrink-0">
            <div className="flex items-center justify-between">
              {isExpanded ? (
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <FiHome size={20} />
                  </div>
                  <div className="overflow-hidden">
                    <h1 className="text-lg font-bold truncate">Admin Panel</h1>
                    <p className="text-xs text-gray-400 truncate">
                      School ID: {user?.school_id || 'Loading...'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mx-auto">
                  <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                    <FiHome size={20} />
                  </div>
                </div>
              )}
              
              {/* Toggle Button */}
              <button
                onClick={handleToggle}
                className={`
                  p-2 rounded-lg hover:bg-gray-700 transition-colors
                  ${isExpanded ? '' : 'absolute -right-3 top-4 bg-gray-800 border border-gray-700'}
                `}
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {collapsed ? (
                  <FiChevronsRight size={18} className="text-gray-300" />
                ) : (
                  <FiChevronsLeft size={18} className="text-gray-300" />
                )}
              </button>
            </div>
          </div>

          {/* Scrollable Navigation Area - Flex-1 with overflow-auto */}
          <div className="flex-1 overflow-y-auto py-4">
            <style jsx global>{`
              /* Custom scrollbar for sidebar */
              .sidebar-scrollbar::-webkit-scrollbar {
                width: 4px;
              }
              .sidebar-scrollbar::-webkit-scrollbar-track {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 2px;
              }
              .sidebar-scrollbar::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.2);
                border-radius: 2px;
              }
              .sidebar-scrollbar::-webkit-scrollbar-thumb:hover {
                background: rgba(255, 255, 255, 0.3);
              }
              .sidebar-scrollbar {
                scrollbar-width: thin;
                scrollbar-color: rgba(255, 255, 255, 0.2) rgba(255, 255, 255, 0.05);
              }
            `}</style>
            
            <nav className={`px-2 space-y-1 sidebar-scrollbar ${isExpanded ? '' : 'flex flex-col items-center'}`}>
              {menuItems.map((item) => {
                const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
                
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`
                      flex items-center rounded-lg transition-all duration-200
                      ${isExpanded ? 'px-3 py-3 justify-start' : 'p-3 justify-center'}
                      ${isActive 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }
                      group relative
                    `}
                    title={!isExpanded ? `${item.label} - ${item.description}` : ''}
                  >
                    <span className={`${isExpanded ? 'mr-3' : ''} flex-shrink-0`}>
                      {item.icon}
                    </span>
                    
                    {isExpanded && (
                      <div className="flex-1 min-w-0">
                        <span className="font-medium truncate">{item.label}</span>
                        <span className="text-xs text-gray-400 truncate block mt-1">
                          {item.description}
                        </span>
                      </div>
                    )}
                    
                    {/* Tooltip for collapsed state */}
                    {!isExpanded && (
                      <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 whitespace-nowrap">
                        <div className="font-medium">{item.label}</div>
                        <div className="text-xs text-gray-300 mt-1">{item.description}</div>
                      </div>
                    )}
                    
                    {/* Active indicator */}
                    {isActive && !isExpanded && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-r-full"></div>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Footer Section - Fixed at bottom of sidebar */}
          <div className="border-t border-gray-700 flex-shrink-0">
            {/* Logout Button */}
            <button
              onClick={logout}
              className={`
                flex items-center w-full p-4
                text-gray-300 hover:bg-gray-700 hover:text-white
                transition-colors
                ${isExpanded ? 'justify-start px-4' : 'justify-center'}
              `}
              title={!isExpanded ? "Logout" : ""}
            >
              <FiLogOut size={20} className="flex-shrink-0" />
              {isExpanded && <span className="ml-3 font-medium">Logout</span>}
            </button>

            {/* User Profile */}
            {user && (
              <div className={`p-4 border-t border-gray-700 ${isExpanded ? '' : 'flex justify-center'}`}>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {user.first_name?.[0] || user.email?.[0] || 'A'}
                  </div>
                  
                  {isExpanded && (
                    <div className="ml-3 overflow-hidden">
                      <p className="font-medium truncate">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {user.role} • School {user.school_id}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Version Info */}
            {isExpanded && (
              <div className="px-4 py-3 border-t border-gray-700">
                <div className="text-xs text-gray-500 text-center">
                  <div className="flex justify-between">
                    <span>Admin Panel</span>
                    <span>v1.0</span>
                  </div>
                  <div className="mt-1">
                    <span className="inline-flex items-center">
                      <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                      Connected
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {!collapsed && isMobile && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setCollapsed(true)}
        />
      )}
    </>
  );
};