'use client';

import { useState, useEffect } from 'react';
import {
  Home as HomeIcon,
  Calendar,
  CheckSquare,
  TrendingUp,
  Clock,
  ListTodo,
  LogOut,
  User,
  MapPin,
  Briefcase,
  Plus,
  Bell,
  ChevronRight,
  Menu
} from 'lucide-react';
import PunchModal from './PunchModal';
import Sidebar from './sidebar';
import Link from 'next/link';

export default function EmployeeDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [punchInTime, setPunchInTime] = useState(null);
  const [workedHours, setWorkedHours] = useState({ hours: 5, minutes: 12 });
  const [showPunchModal, setShowPunchModal] = useState(false);
  const [punchType, setPunchType] = useState('in');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());

      // Calculate worked hours if checked in
      if (isCheckedIn && punchInTime) {
        const diff = new Date() - punchInTime;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setWorkedHours({ hours, minutes });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isCheckedIn, punchInTime]);

  const handlePunchIn = (data) => {
    setIsCheckedIn(true);
    setPunchInTime(new Date());
    setShowPunchModal(false);
  };

  const handlePunchOut = (data) => {
    setIsCheckedIn(false);
    setShowPunchModal(false);
  };

  const openPunchModal = (type) => {
    setPunchType(type);
    setShowPunchModal(true);
  };

  const tasks = [
    {
      id: 1,
      title: 'Update stock count for Electronics section',
      dueTime: '4:00 PM',
      priority: 'High',
      status: 'pending'
    },
    {
      id: 2,
      title: 'Prepare weekly sales report',
      dueTime: '10:00 AM',
      priority: 'Medium',
      status: 'in-progress'
    },
    {
      id: 3,
      title: 'Verify return requests',
      dueTime: '3:30 PM',
      priority: 'Low',
      status: 'pending'
    }
  ];

  const shiftDetails = {
    startTime: '09:00 AM',
    endTime: '06:00 PM',
    shiftName: 'Morning A',
    location: 'Main Store',
    manager: 'Suffyan Sir'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex">
      {/* Sidebar Component */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentPage="home"
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            {/* Hamburger Menu */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5 text-slate-600" />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center lg:hidden">
                <HomeIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-800">Home</h1>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* User Profile - Desktop only */}
            <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-lg border border-slate-200">
              <User className="w-4 h-4 text-slate-600" />
              <div>
                <p className="text-sm font-semibold text-slate-800">Vikram Singh</p>
              </div>
            </div>

            {/* Notification Bell */}
            {/* <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors relative">
              <Bell className="w-5 h-5 text-slate-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button> */}
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            {/* Greeting */}
            <div className="mb-6 sm:mb-8">
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
                Good Morning, Vikram!
              </h3>
              <p className="text-sm sm:text-base text-slate-600">
                Here's what's happening with your shift today.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {/* Current Status Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wider">
                    Current Status
                  </p>
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                </div>
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2 h-2 rounded-full ${isCheckedIn ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                    <p className="text-base sm:text-lg font-bold text-slate-800">
                      {isCheckedIn ? 'Checked In' : 'Not Checked In'}
                    </p>
                  </div>
                  {isCheckedIn && punchInTime && (
                    <p className="text-xs sm:text-sm text-slate-500">
                      Since {punchInTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => openPunchModal(isCheckedIn ? 'out' : 'in')}
                  className={`w-full py-2.5 sm:py-3 px-4 rounded-lg font-semibold transition-all text-sm sm:text-base ${isCheckedIn
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    }`}
                >
                  {isCheckedIn ? 'Check Out' : 'Check In'}
                </button>
              </div>

              {/* Worked Hours Card */}
              <div className="bg-white rounded-xl p-5 sm:p-6 text-black">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs sm:text-sm font-semibold text-black uppercase tracking-wider">
                    Worked Today
                  </p>
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
                </div>
                <div className="mb-2">
                  <p className="text-3xl sm:text-4xl font-bold">
                    {workedHours.hours}h {workedHours.minutes}m
                  </p>
                </div>
                <p className="text-xs sm:text-sm text-black">
                  {isCheckedIn ? 'Currently working' : 'Not checked in'}
                </p>
              </div>

              {/* Pending Tasks Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wider">
                    Pending Tasks
                  </p>
                  <ListTodo className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                </div>
                <div className="mb-2">
                  <p className="text-3xl sm:text-4xl font-bold text-slate-800">3</p>
                </div>
                <p className="text-xs sm:text-sm text-slate-500">Pending Tasks</p>
              </div>
            </div>

            {/* Information Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Shift Details Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h4 className="text-base sm:text-lg font-bold text-slate-800">Shift Details</h4>
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                </div>

                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <p className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1">
                      {shiftDetails.startTime}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-500">to {shiftDetails.endTime}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Shift Name
                      </p>
                      <p className="text-sm sm:text-base font-semibold text-slate-800">
                        {shiftDetails.shiftName}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Location
                      </p>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-slate-400 flex-shrink-0" />
                        <p className="text-sm sm:text-base font-semibold text-slate-800 truncate">
                          {shiftDetails.location}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      Manager
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-slate-400 to-slate-500 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                        SS
                      </div>
                      <p className="text-sm sm:text-base font-semibold text-slate-800">
                        {shiftDetails.manager}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assigned Tasks Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6">
                

                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h4 className="text-base sm:text-lg font-bold text-slate-800">
                    Assigned Tasks
                  </h4>

                  <Link
                    href="/employee/tasks"
                    className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    View All
                  </Link>
                </div>

                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-3 sm:p-4 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-all cursor-pointer group"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="text-xs sm:text-sm font-semibold text-slate-800 flex-1 group-hover:text-blue-600 transition-colors">
                          {task.title}
                        </p>
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0 ${task.priority === 'High'
                              ? 'bg-red-100 text-red-700'
                              : task.priority === 'Medium'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-green-100 text-green-700'
                            }`}
                        >
                          {task.priority}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">Due today at {task.dueTime}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>


      {/* Punch In/Out Modal */}
      {showPunchModal && (
        <PunchModal
          type={punchType}
          onClose={() => setShowPunchModal(false)}
          onSubmit={punchType === 'in' ? handlePunchIn : handlePunchOut}
        />
      )}

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-30 safe-bottom">
        <div className="grid grid-cols-4 gap-1 px-2 py-2">
          <button className="flex flex-col items-center gap-1 py-2 px-3 bg-blue-50 text-blue-600 rounded-lg">
            <HomeIcon className="w-5 h-5" />
            <span className="text-xs font-medium">Home</span>
          </button>
          <button className="flex flex-col items-center gap-1 py-2 px-3 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
            <Calendar className="w-5 h-5" />
            <span className="text-xs font-medium">Attendance</span>
          </button>
          <button className="flex flex-col items-center gap-1 py-2 px-3 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
            <CheckSquare className="w-5 h-5" />
            <span className="text-xs font-medium">Tasks</span>
          </button>
          <button className="flex flex-col items-center gap-1 py-2 px-3 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
            <User className="w-5 h-5" />
            <span className="text-xs font-medium">Profile</span>
          </button>
        </div>
      </nav>

      {/* Floating Action Button */}
      {/* <button className="fixed bottom-20 sm:bottom-8 right-6 sm:right-8 w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full shadow-lg shadow-blue-300 flex items-center justify-center text-white hover:scale-110 transition-transform z-20">
        <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
      </button> */}
    </div>
  );
}
