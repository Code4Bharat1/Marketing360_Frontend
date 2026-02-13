'use client';

import React, { useState } from 'react';
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

  const profileStats = [
    { label: 'Performance', value: '98%' },
    { label: 'Hrs This Week', value: '42.5' },
    { label: 'Peer Rating', value: '4.8' }
  ];

  const contactInfo = [
    { 
      icon: Mail, 
      label: 'Email', 
      value: 'aarav.patel@techno360.com' 
    },
    { 
      icon: Phone, 
      label: 'Phone', 
      value: '+91 98765 43210' 
    },
    { 
      icon: MapPin, 
      label: 'Location', 
      value: 'Mumbai Branch' 
    }
  ];

//   const accountSettings = [
//     { icon: Bell, label: 'Notifications', hasArrow: true },
//     { icon: Lock, label: 'Change Password', hasArrow: true },
//     { icon: HelpCircle, label: 'Help & Support', hasArrow: true }
//   ];

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
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-orange-400 to-pink-400 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                    AP
                  </div>
                  {/* Online Status */}
                  <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 rounded-full border-4 border-white"></div>
                </div>

                {/* Name and Title */}
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                  Aarav Patel
                </h2>
                <p className="text-sm text-gray-500">
                  Senior Sales Associate
                </p>
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
                        <span className="text-sm text-gray-900 font-medium text-right">
                          {item.value}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Account Settings */}
              {/* <div className="p-6 sm:p-8 border-b border-gray-100">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                  Account Settings
                </h3>
                <div className="space-y-1">
                  {accountSettings.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={index}
                        className="w-full flex items-center justify-between py-3 px-3 hover:bg-gray-50 rounded-lg transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-gray-200 transition-colors">
                            <Icon className="w-5 h-5 text-gray-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            {item.label}
                          </span>
                        </div>
                        {item.hasArrow && (
                          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div> */}

              {/* Logout Button */}
              <div className="p-6 sm:p-8">
                <button className="w-full flex items-center justify-center gap-2 py-3 px-4 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium">
                  <LogOut className="w-5 h-5" />
                  Log Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}