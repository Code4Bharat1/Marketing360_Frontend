'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Bell, 
  Lock, 
  HelpCircle, 
  ChevronRight,
  LogOut,
  Menu
} from 'lucide-react';
import Sidebar from './sidebar';

export default function ProfilePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Fetch profile data on component mount
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        
        const response = await axios.get(`${API_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Profile Data:', response.data); // Debug log
     setProfileData(response.data.data || response.data.user || response.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch profile data');
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [API_URL]);

  // Handle logout
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      await axios.post(`${API_URL}/auth/logout`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      localStorage.removeItem('authToken');
      
    } catch (err) {
      console.error('Logout error:', err);
      // Even if logout fails on server, clear local storage and redirect
      localStorage.removeItem('authToken');
      
    }
  };

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return 'AP';
    const names = name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Stats using actual API data
  const profileStats = [
    { label: 'Status', value: profileData?.Status || 'N/A' },
    { label: 'Shift', value: profileData?.shiftName || 'N/A' },
    { label: 'Location', value: profileData?.Location || 'N/A' }
  ];

  const contactInfo = [
    { 
      icon: Mail, 
      label: 'Email', 
      value: profileData?.email || 'Not available'
    },
    { 
      icon: Phone, 
      label: 'Phone', 
      value: profileData?.phoneNumber || 'Not available'
    },
    { 
      icon: MapPin, 
      label: 'Department', 
      value: profileData?.department || 'Not available'
    }
  ];

  // Loading state
  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          currentPage="profile"
        />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          currentPage="profile"
        />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center bg-red-50 p-6 rounded-lg max-w-md">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentPage="profile"
      />

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>

            {/* Title */}
            <div className="flex-1">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">
                My Profile
              </h1>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Profile Header */}
              <div className="p-6 sm:p-8 text-center border-b border-gray-100">
                {/* Avatar */}
                <div className="relative inline-block mb-4">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-emerald-500
                   flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                    {getInitials(profileData?.name)}
                  </div>
                  {/* Online Status */}
                  <div className={`absolute bottom-2 right-2 w-5 h-5 rounded-full border-4 border-white ${
                    profileData?.Status === 'Active' ? 'bg-green-500' : 'bg-gray-400'
                  }`}></div>
                </div>

                {/* Name and Title */}
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                  {profileData?.name || 'User'}
                </h2>
                <p className="text-sm text-gray-500 capitalize">
                  {profileData?.designation || profileData?.role || 'Employee'}
                </p>
                {profileData?.department && (
                  <p className="text-xs text-gray-400 mt-1">
                    {profileData.department}
                  </p>
                )}
                {profileData?.managerName && (
                  <p className="text-xs text-gray-400 mt-1">
                    Manager: {profileData.managerName}
                  </p>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-px bg-gray-200 border-b border-gray-200">
                {profileStats.map((stat, index) => (
                  <div 
                    key={index}
                    className="bg-white p-4 sm:p-6 text-center"
                  >
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                      {stat.value}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Contact Information */}
              <div className="p-6 sm:p-8 border-b border-gray-100">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                  Contact Information
                </h3>
                <div className="space-y-4">
                  {contactInfo.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <div 
                        key={index}
                        className="flex items-center justify-between py-2"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Icon className="w-5 h-5 text-gray-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            {item.label}
                          </span>
                        </div>
                        <span className="text-sm text-gray-900 font-medium text-right break-all">
                          {item.value}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Shift & Schedule Information */}
              {profileData?.shiftName && (
                <div className="p-6 sm:p-8 border-b border-gray-100">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                    Shift & Schedule
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Shift</span>
                      <span className="text-sm font-medium text-gray-900">
                        {profileData.shiftName}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Work Hours</span>
                      <span className="text-sm font-medium text-gray-900">
                        {profileData.assignedStartTime} - {profileData.assignedEndTime}
                      </span>
                    </div>
                    {profileData.joiningDate && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Joining Date</span>
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(profileData.joiningDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Account Info */}
              <div className="p-6 sm:p-8 border-b border-gray-100">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                  Account Details
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    {/* <span className="text-sm text-gray-600">User ID</span>
                    <span className="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">
                      {profileData?._id?.slice(-8) || 'N/A'}
                    </span> */}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Account Status</span>
                    <span className={`text-sm font-medium px-2 py-1 rounded ${
                      profileData?.Status === 'Active'
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {profileData?.Status || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Password Status</span>
                    <span className={`text-sm font-medium px-2 py-1 rounded ${
                      profileData?.isPasswordChanged 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {profileData?.isPasswordChanged ? 'Updated' : 'Default'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              {/* <div className="p-6 sm:p-8">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                >
                  <LogOut className="w-5 h-5" />
                  Log Out
                </button>
              </div> */}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}