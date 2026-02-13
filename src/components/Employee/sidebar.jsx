'use client';

import React, { useState } from 'react';
import { 
  Home, 
  Calendar, 
  Briefcase, 
  BarChart3,
  X,
  User,
  CheckSquare,
  LogOut
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

export default function Sidebar({ isOpen, onClose, currentPage = 'home' }) {
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const menuItems = [
    { id: 'home', label: 'Home', icon: Home, href: '/employee/dashboard' },
    { id: 'attendance', label: 'Attendance', icon: Calendar, href: '/employee/attendance' },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, href: '/employee/tasks' },
    { id: 'workLogs', label: 'Work Logs', icon: Briefcase, href: '/employee/work-logs' },
    { id: 'performance', label: 'Performance', icon: BarChart3, href: '/employee/performance' },
    { id: 'profile', label: 'Profile', icon: User, href: '/employee/profile' },
  ];

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);
    
    try {
      // Simulate API call - replace with your actual logout logic
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Clear any stored tokens/data
      // localStorage.removeItem('authToken');
      // sessionStorage.clear();
      
      // Show success toast
      toast.success('Logged out successfully!', {
        position: 'top-right',
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Close modal
      setShowLogoutModal(false);
      setIsLoggingOut(false);

      // Redirect to login page after a short delay
      setTimeout(() => {
        router.push('/');
      }, 500);

    } catch (error) {
      setIsLoggingOut(false);
      toast.error('Logout failed. Please try again.', {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 lg:w-56 bg-gray-50 border-r border-gray-200 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className="p-6 lg:p-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h1 className="text-xs font-semibold text-gray-900">Marketing360</h1>
            <h2 className="text-xs font-medium text-gray-900 mt-0.5">Employee Portal</h2>
          </div>
          <button 
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
            MENU
          </p>
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <li key={item.id}>
                  <Link 
                    href={item.href}
                    onClick={onClose}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm
                      ${isActive 
                        ? 'bg-teal-700 text-white font-medium shadow-sm' 
                        : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile at Bottom */}
        <div className="p-4 border-t border-gray-200 space-y-3">
          {/* Profile Card */}
          <Link 
            href="/employee/profile"
            onClick={onClose}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-400 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
              VS
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">Vikash Singh</p>
              <p className="text-xs text-gray-500 truncate">Store Manager</p>
            </div>
          </Link>

          {/* Logout Button */}
          <button
            onClick={handleLogoutClick}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[60] overflow-y-auto">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleLogoutCancel}
          />

          {/* Modal */}
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Confirm Logout
                </h3>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <LogOut className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-2">
                      Are you sure you want to logout from your account?
                    </p>
                    <p className="text-xs text-gray-500">
                      You will need to login again to access your account.
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col-reverse sm:flex-row gap-3">
                <button
                  onClick={handleLogoutCancel}
                  disabled={isLoggingOut}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogoutConfirm}
                  disabled={isLoggingOut}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoggingOut ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Logging out...</span>
                    </>
                  ) : (
                    <>
                      <LogOut size={16} />
                      <span>Logout</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}