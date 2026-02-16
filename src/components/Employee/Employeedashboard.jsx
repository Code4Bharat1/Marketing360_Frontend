'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  Home as HomeIcon,
  Calendar,
  CheckSquare,
  Clock,
  ListTodo,
  User,
  MapPin,
  Menu,
  AlertCircle,
  Loader2
} from 'lucide-react';
import PunchModal from './PunchModal';
import Sidebar from './sidebar';
import Link from 'next/link';
import { punchIn, punchOut, getTodayAttendance } from '../../services/attendanceService';

export default function EmployeeDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [punchInTime, setPunchInTime] = useState(null);
  const [workedHours, setWorkedHours] = useState({ hours: 0, minutes: 0 });
  const [showPunchModal, setShowPunchModal] = useState(false);
  const [punchType, setPunchType] = useState('in');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [attendanceLoading, setAttendanceLoading] = useState(true);

  // User state
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState(null);

  // Tasks state
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksError, setTasksError] = useState(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Fetch attendance status from database
  const fetchAttendanceStatus = useCallback(async () => {
    try {
      setAttendanceLoading(true);
      console.log('🔍 Fetching attendance status from database...');

      // Use getTodayAttendance from the service
      const response = await getTodayAttendance();

      console.log('✅ Attendance Response:', response);

      // Check if there's attendance data for today
      const attendanceData = response?.data || null;

      // Determine if user is checked in using loginTime and logoutTime
      const hasLoginTime = attendanceData && attendanceData.loginTime;
      const hasLogoutTime = attendanceData && attendanceData.logoutTime;

      // User is checked in if there's a loginTime but no logoutTime
      const checkedIn = hasLoginTime && !hasLogoutTime;

      // Update state based on database
      setIsCheckedIn(checkedIn);
      setTodayAttendance(attendanceData);

      // Set punch in time if checked in
      if (checkedIn && attendanceData.loginTime) {
        setPunchInTime(new Date(attendanceData.loginTime));
      } else {
        setPunchInTime(null);
      }

      console.log('📊 State Updated:', {
        isCheckedIn: checkedIn,
        hasLoginTime,
        hasLogoutTime,
        punchInTime: checkedIn ? new Date(attendanceData.loginTime) : null,
        hasAttendanceData: !!attendanceData
      });

    } catch (error) {
      console.error('❌ Fetch attendance status error:', error);
      // If error or no attendance found, reset to not checked in
      setIsCheckedIn(false);
      setPunchInTime(null);
      setTodayAttendance(null);
    } finally {
      setAttendanceLoading(false);
    }
  }, []);

  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setUserLoading(true);
        setUserError(null);
        const token = localStorage.getItem('authToken');
        const response = await axios.get(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success) {
          setUser(response.data.data);
        }
      } catch (error) {
        const message =
          error.response?.data?.message || 'Failed to fetch user details';
        setUserError(message);
        console.error('Fetch user error:', error);
      } finally {
        setUserLoading(false);
      }
    };

    fetchUser();
  }, [API_URL]);

  // Fetch attendance status on mount and after actions
  useEffect(() => {
    fetchAttendanceStatus();
  }, [fetchAttendanceStatus]);

  // Fetch assigned tasks
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setTasksLoading(true);
        setTasksError(null);
        const token = localStorage.getItem('authToken');
        const response = await axios.get(`${API_URL}/tasks/my-tasks`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success) {
          setTasks(response.data.data);
        }
      } catch (error) {
        const message =
          error.response?.data?.message || 'Failed to fetch tasks';
        setTasksError(message);
        console.error('Fetch tasks error:', error);
      } finally {
        setTasksLoading(false);
      }
    };

    fetchTasks();
  }, [API_URL]);

  // Update current time and worked hours every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());

      // Calculate worked hours if checked in
      if (isCheckedIn && punchInTime) {
        const diff = new Date() - punchInTime;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setWorkedHours({ hours, minutes });
      } else {
        setWorkedHours({ hours: 0, minutes: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isCheckedIn, punchInTime]);

  const handlePunchIn = async (data) => {
    try {
      console.log('⏰ Punching in...');

      const loadingToast = toast.loading('Punching in...', {
        position: 'top-right',
      });

      const response = await punchIn({
        latitude: data.latitude,
        longitude: data.longitude,
        address: data.address,
        photo: data.photo,
        notes: data.notes,
      });

      toast.dismiss(loadingToast);

      if (response.success) {
        console.log('✅ Punch in successful!');

        // Close modal first
        setShowPunchModal(false);

        // Show success message
        toast.success('Successfully punched in!', {
          position: 'top-right',
          autoClose: 3000,
        });

        // Refetch attendance status from database
        await fetchAttendanceStatus();
      }
    } catch (error) {
      console.error('❌ Punch in error:', error);

      // Check if already punched in
      if (error.message?.includes('already punched in') || error.message?.includes('Already checked in')) {
        toast.warning('You are already punched in!', {
          position: 'top-right',
          autoClose: 3000,
        });

        // Refetch to sync with database
        await fetchAttendanceStatus();
      } else {
        toast.error(error.message || 'Failed to punch in. Please try again.', {
          position: 'top-right',
          autoClose: 4000,
        });
      }
    }
  };

  const handlePunchOut = async (data) => {
    try {
      console.log('⏰ Punching out...');

      const loadingToast = toast.loading('Punching out...', {
        position: 'top-right',
      });

      const response = await punchOut({
        latitude: data.latitude,
        longitude: data.longitude,
        address: data.address,
        photo: data.photo,
        notes: data.notes,
      });

      toast.dismiss(loadingToast);

      if (response.success) {
        console.log('✅ Punch out successful!');

        // Calculate total worked hours from response using loginTime and logoutTime
        if (response.data?.loginTime && response.data?.logoutTime) {
          const loginTime = new Date(response.data.loginTime);
          const logoutTime = new Date(response.data.logoutTime);
          const diff = logoutTime - loginTime;
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

          toast.success(
            `Successfully punched out! Total hours: ${hours}h ${minutes}m`,
            {
              position: 'top-right',
              autoClose: 4000,
            }
          );
        } else {
          toast.success('Successfully punched out!', {
            position: 'top-right',
            autoClose: 3000,
          });
        }

        // Close modal
        setShowPunchModal(false);

        // Refetch attendance status from database
        await fetchAttendanceStatus();
      }
    } catch (error) {
      console.error('❌ Punch out error:', error);

      // Check if not punched in
      if (error.message?.includes('not punched in') || error.message?.includes('No active check-in') || error.message?.includes('Please punch in first')) {
        toast.warning('You are not punched in yet!', {
          position: 'top-right',
          autoClose: 3000,
        });

        // Refetch to sync with database
        await fetchAttendanceStatus();
      } else {
        toast.error(error.message || 'Failed to punch out. Please try again.', {
          position: 'top-right',
          autoClose: 4000,
        });
      }
    }
  };

  const openPunchModal = (type) => {
    console.log(`🔔 Opening ${type} modal. Current status:`, { isCheckedIn });
    setPunchType(type);
    setShowPunchModal(true);
  };

  // Greeting based on time
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Get initials from name
  const getInitials = (name = '') => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Pending tasks count
  const pendingCount = tasks.filter(
    (t) => t.status === 'Pending' || t.status === 'in-progress'
  ).length;

  const shiftDetails = {
    startTime: user?.assignedStartTime || 'N/A',
    endTime: user?.assignedEndTime || 'N/A',
    shiftName: user?.shiftName || 'N/A',
    location: user?.Location || 'N/A',
    manager: user?.managerName || 'N/A',
  };
  const formatTo12Hour = (time) => {
    if (!time) return "";
    const [hour, minute] = time.split(":");
    const h = parseInt(hour);
    const ampm = h >= 12 ? "PM" : "AM";
    const formattedHour = h % 12 || 12;
    return `${formattedHour}:${minute} ${ampm}`;
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
              {userLoading ? (
                <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
              ) : (
                <>
                  <User className="w-4 h-4 text-slate-600" />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {user?.name || 'Employee'}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            {/* Greeting */}
            <div className="mb-6 sm:mb-8">
              {userLoading ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
                  <span className="text-slate-500">Loading...</span>
                </div>
              ) : (
                <>
                  <h3 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
                    {getGreeting()}, {user?.name?.split(' ')[0] || 'Employee'}!
                  </h3>
                  <p className="text-sm sm:text-base text-slate-600">
                    Here's what's happening with your shift today.
                  </p>
                </>
              )}
            </div>

            {/* User Error Banner */}
            {userError && (
              <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{userError}</span>
              </div>
            )}

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
                    <div
                      className={`w-2 h-2 rounded-full ${isCheckedIn ? 'bg-green-500 animate-pulse' : 'bg-slate-300'
                        }`}
                    ></div>
                    <p className="text-base sm:text-lg font-bold text-slate-800">
                      {attendanceLoading
                        ? 'Loading...'
                        : isCheckedIn
                          ? 'Checked In'
                          : 'Not Checked In'}
                    </p>
                  </div>
                  {isCheckedIn && punchInTime && (
                    <p className="text-xs sm:text-sm text-slate-500">
                      Since{' '}
                      {punchInTime.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => openPunchModal(isCheckedIn ? 'out' : 'in')}
                  disabled={attendanceLoading}
                  className={`w-full py-2.5 sm:py-3 px-4 rounded-lg font-semibold transition-all text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed ${isCheckedIn
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    }`}
                >
                  {attendanceLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading...
                    </span>
                  ) : isCheckedIn ? (
                    'Check Out'
                  ) : (
                    'Check In'
                  )}
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
                  {tasksLoading ? (
                    <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
                  ) : (
                    <p className="text-3xl sm:text-4xl font-bold text-slate-800">
                      {pendingCount}
                    </p>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-slate-500">Pending Tasks</p>
              </div>
            </div>

            {/* Information Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Shift Details Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h4 className="text-base sm:text-lg font-bold text-slate-800">
                    Shift Details
                  </h4>
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                </div>

                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <p className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1">
                      {formatTo12Hour(shiftDetails.startTime)}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-500">
                      to {formatTo12Hour(shiftDetails.endTime)}
                    </p>
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
                        {getInitials(shiftDetails.manager)}
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

                {/* Tasks Loading State */}
                {tasksLoading && (
                  <div className="flex flex-col items-center justify-center py-10 gap-3">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    <p className="text-sm text-slate-500">Loading tasks...</p>
                  </div>
                )}

                {/* Tasks Error State */}
                {!tasksLoading && tasksError && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{tasksError}</span>
                  </div>
                )}

                {/* Tasks Empty State */}
                {!tasksLoading && !tasksError && tasks.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-10 gap-2 text-slate-400">
                    <ListTodo className="w-10 h-10" />
                    <p className="text-sm font-medium">No tasks assigned</p>
                  </div>
                )}

                {/* Tasks List */}
                {!tasksLoading && !tasksError && tasks.length > 0 && (
                  <div className="space-y-3">
                    {tasks.slice(0, 3).map((task) => (
                      <div
                        key={task._id}
                        className="p-3 sm:p-4 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-all cursor-pointer group"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p className="text-xs sm:text-sm font-semibold text-slate-800 flex-1 group-hover:text-blue-600 transition-colors">
                            {task.title}
                          </p>
                          <span
                            className={`text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0 ${task.priority === 'high'
                                ? 'bg-red-100 text-red-700'
                                : task.priority === 'medium'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-green-100 text-green-700'
                              }`}
                          >
                            {task.priority?.charAt(0).toUpperCase() +
                              task.priority?.slice(1)}
                          </span>
                        </div>
                        {task.dueDate && (
                          <p className="text-xs text-slate-500">
                            Due:{' '}
                            {new Date(task.dueDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        )}
                        {task.assignedBy?.name && (
                          <p className="text-xs text-slate-400 mt-1">
                            Assigned by: {task.assignedBy.name}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
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
          <Link
            href="/employee/attendance"
            className="flex flex-col items-center gap-1 py-2 px-3 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <Calendar className="w-5 h-5" />
            <span className="text-xs font-medium">Attendance</span>
          </Link>
          <Link
            href="/employee/tasks"
            className="flex flex-col items-center gap-1 py-2 px-3 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <CheckSquare className="w-5 h-5" />
            <span className="text-xs font-medium">Tasks</span>
          </Link>
          <Link
            href="/employee/profile"
            className="flex flex-col items-center gap-1 py-2 px-3 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <User className="w-5 h-5" />
            <span className="text-xs font-medium">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}