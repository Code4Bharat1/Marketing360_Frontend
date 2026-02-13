'use client';

import { useState, useEffect } from 'react';
import { 
  Home as HomeIcon, 
  Calendar, 
  CheckSquare, 
  User,
  Clock,
  MapPin,
  TrendingUp,
  Bell,
  Plus,
  ChevronRight,
  Download,
  Filter,
  Menu,
  X
} from 'lucide-react';
import PunchModal from './PunchModal';
import Sidebar from './sidebar';
import { toast } from 'react-toastify';

export default function AttendancePage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isCheckedIn, setIsCheckedIn] = useState(true);
  const [punchInTime, setPunchInTime] = useState(new Date('2024-10-24T09:02:00'));
  const [showPunchModal, setShowPunchModal] = useState(false);
  const [punchType, setPunchType] = useState('in');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('October');
  const [showFilterModal, setShowFilterModal] = useState(false);

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // Monthly data for different months
  const monthlyData = {
    'January': { daysWorked: 20, totalHours: '158h', averageDaily: '7.9h', onTimeArrivals: 18, lateArrivals: 2, shortDays: 0 },
    'February': { daysWorked: 19, totalHours: '149h', averageDaily: '7.8h', onTimeArrivals: 17, lateArrivals: 2, shortDays: 1 },
    'March': { daysWorked: 21, totalHours: '165h', averageDaily: '7.9h', onTimeArrivals: 19, lateArrivals: 2, shortDays: 1 },
    'April': { daysWorked: 20, totalHours: '157h', averageDaily: '7.9h', onTimeArrivals: 18, lateArrivals: 2, shortDays: 0 },
    'May': { daysWorked: 22, totalHours: '173h', averageDaily: '7.9h', onTimeArrivals: 20, lateArrivals: 2, shortDays: 1 },
    'June': { daysWorked: 21, totalHours: '165h', averageDaily: '7.9h', onTimeArrivals: 19, lateArrivals: 2, shortDays: 1 },
    'July': { daysWorked: 20, totalHours: '158h', averageDaily: '7.9h', onTimeArrivals: 18, lateArrivals: 2, shortDays: 0 },
    'August': { daysWorked: 22, totalHours: '174h', averageDaily: '7.9h', onTimeArrivals: 20, lateArrivals: 2, shortDays: 1 },
    'September': { daysWorked: 21, totalHours: '166h', averageDaily: '7.9h', onTimeArrivals: 19, lateArrivals: 2, shortDays: 1 },
    'October': { daysWorked: 18, totalHours: '142h', averageDaily: '7.9h', onTimeArrivals: 16, lateArrivals: 2, shortDays: 1 },
    'November': { daysWorked: 15, totalHours: '118h', averageDaily: '7.9h', onTimeArrivals: 13, lateArrivals: 2, shortDays: 0 },
    'December': { daysWorked: 16, totalHours: '126h', averageDaily: '7.9h', onTimeArrivals: 14, lateArrivals: 2, shortDays: 1 }
  };

  // Get current month's data
  const attendanceStats = monthlyData[selectedMonth];

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate worked hours
  const calculateWorkedHours = () => {
    if (isCheckedIn && punchInTime) {
      const diff = currentTime - punchInTime;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${minutes}m`;
    }
    return '0h 0m';
  };

  const handlePunchIn = (data) => {
    setIsCheckedIn(true);
    setPunchInTime(new Date());
    setShowPunchModal(false);
    toast.success('Punched in successfully!');
  };

  const handlePunchOut = (data) => {
    setIsCheckedIn(false);
    setShowPunchModal(false);
    toast.success('Punched out successfully!');
  };

  const openPunchModal = (type) => {
    setPunchType(type);
    setShowPunchModal(true);
  };

  const handleMonthChange = (month) => {
    setSelectedMonth(month);
    setShowFilterModal(false);
    toast.info(`Showing data for ${month}`);
  };

  const handleDownload = () => {
    toast.success(`Downloading ${selectedMonth} attendance report...`);
    // Add actual download logic here
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex">
      {/* Sidebar Component */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        currentPage="attendance"
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
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-800">Attendance</h1>
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
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            {/* Page Header */}
            <div className="mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
                Attendance
              </h2>
              <p className="text-sm sm:text-base text-slate-600">
                Punch in / out and review your working hours
              </p>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Today's Attendance Card - Takes 2 columns on large screens */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">Today's Attendance</h3>
                    <p className="text-sm text-slate-500">
                      Track the time below to set as in or out.
                    </p>
                  </div>
                  <button className="p-2 hover:bg-slate-50 rounded-lg transition-colors">
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                {/* Current Time Display */}
                <div className="mb-6">
                  <p className="text-sm text-slate-500 mb-2">Current Time</p>
                  <p className="text-5xl font-bold text-slate-800 mb-2">
                    {currentTime.toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      hour12: true 
                    })}
                  </p>
                  <p className="text-sm text-slate-600">
                    {currentTime.toLocaleDateString('en-US', { 
                      weekday: 'long',
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric' 
                    })}
                  </p>
                </div>

                {/* Status and Action Button */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
                  {isCheckedIn ? (
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-semibold text-green-700">
                        Checked in today at {punchInTime.toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit',
                          hour12: true 
                        })}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                      <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
                      <span className="text-sm font-semibold text-slate-600">Not checked in</span>
                    </div>
                  )}
                  
                  <button
                    onClick={() => openPunchModal(isCheckedIn ? 'out' : 'in')}
                    className={`px-6 py-2.5 rounded-lg font-semibold transition-all text-sm flex items-center gap-2 ${
                      isCheckedIn
                        ? 'bg-slate-800 hover:bg-slate-900 text-white'
                        : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    {isCheckedIn ? 'Punch Out' : 'Punch In'}
                  </button>
                </div>

                {/* Time Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      Punch-in Time
                    </p>
                    <p className="text-xl font-bold text-slate-800">
                      {isCheckedIn ? punchInTime.toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        hour12: true 
                      }) : '--:--'}
                    </p>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      Expected End
                    </p>
                    <p className="text-xl font-bold text-slate-800">05:30 PM</p>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      Status
                    </p>
                    <p className="text-xl font-bold text-emerald-600">On Time</p>
                  </div>
                </div>
              </div>

              {/* Daily Summary Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-slate-800">Daily Summary</h3>
                  <button className="p-2 hover:bg-slate-50 rounded-lg transition-colors">
                    <TrendingUp className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                <p className="text-sm text-slate-500 mb-6">
                  Summary of today's working hours
                </p>

                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <p className="text-sm font-medium text-slate-600">Punch-in time</p>
                    <p className="text-sm font-bold text-slate-800">
                      {isCheckedIn ? punchInTime.toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        hour12: true 
                      }) : '--:--'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <p className="text-sm font-medium text-slate-600">Punch-out time</p>
                    <p className="text-sm font-bold text-slate-800">--:--</p>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <p className="text-sm font-medium text-slate-600">Total hours (today)</p>
                    <p className="text-sm font-bold text-blue-600">{calculateWorkedHours()}</p>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <p className="text-sm font-medium text-slate-600">Attendance status</p>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                      Present
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly Summary Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">
                    Monthly Summary ({selectedMonth})
                  </h3>
                  <p className="text-sm text-slate-500">Your attendance performance this month</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setShowFilterModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    <Filter className="w-4 h-4 text-slate-600" />
                    <span className="text-sm font-medium text-slate-700">Filter</span>
                  </button>
                  <button 
                    onClick={handleDownload}
                    className="p-2 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    <Download className="w-5 h-5 text-slate-400" />
                  </button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">
                    Days Worked
                  </p>
                  <p className="text-3xl font-bold text-blue-700 mb-1">{attendanceStats.daysWorked}</p>
                  <p className="text-xs text-blue-600">Out of 22 working days</p>
                </div>

                <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
                  <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-2">
                    Total Hours
                  </p>
                  <p className="text-3xl font-bold text-emerald-700 mb-1">{attendanceStats.totalHours}</p>
                  <p className="text-xs text-emerald-600">Logged this month</p>
                </div>

                <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                  <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-2">
                    Average Daily
                  </p>
                  <p className="text-3xl font-bold text-purple-700 mb-1">{attendanceStats.averageDaily}</p>
                  <p className="text-xs text-purple-600">Hours per day</p>
                </div>
              </div>

              {/* Detailed Stats */}
              <div className="space-y-3">
                <div className="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <p className="text-sm font-medium text-slate-700">On time arrivals</p>
                  <span className="text-sm font-bold text-slate-800">{attendanceStats.onTimeArrivals}</span>
                </div>

                <div className="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <p className="text-sm font-medium text-slate-700">Late arrivals</p>
                  <span className="text-sm font-bold text-slate-800">{attendanceStats.lateArrivals}</span>
                </div>

                <div className="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <p className="text-sm font-medium text-slate-700">Short days (&lt; 8h)</p>
                  <span className="text-sm font-bold text-slate-800">{attendanceStats.shortDays}</span>
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

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowFilterModal(false)}
          />

          {/* Modal */}
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800">Select Month</h3>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              {/* Month Grid */}
              <div className="p-6">
                <div className="grid grid-cols-3 gap-3">
                  {months.map((month) => (
                    <button
                      key={month}
                      onClick={() => handleMonthChange(month)}
                      className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                        selectedMonth === month
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {month.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-slate-200">
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="w-full px-4 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-30">
        <div className="grid grid-cols-4 gap-1 px-2 py-2">
          <button className="flex flex-col items-center gap-1 py-2 px-3 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
            <HomeIcon className="w-5 h-5" />
            <span className="text-xs font-medium">Home</span>
          </button>
          <button className="flex flex-col items-center gap-1 py-2 px-3 bg-blue-50 text-blue-600 rounded-lg">
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
    </div>
  );
}