'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Home as HomeIcon,
  Calendar,
  CheckSquare,
  User,
  Clock,
  TrendingUp,
  Plus,
  ChevronRight,
  Download,
  Filter,
  Menu,
  X,
  AlertCircle,
  Loader,
  RefreshCw,
  CheckCircle,
  LogIn,
  LogOut
} from 'lucide-react';
import PunchModal from './PunchModal';
import Sidebar from './sidebar';
import { toast } from 'react-toastify';
import {
  punchIn,
  punchOut,
  getTodayAttendance,
  getMonthlySummary,
} from '../../services/attendanceService';

// ─── Month helpers ─────────────────────────────────────────────────────────────
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

const monthIndexOf = (name) => MONTHS.indexOf(name) + 1; // 1-based

const defaultStats = {
  daysWorked: 0, totalHoursLabel: '0h', averageDaily: '0h',
  onTimeArrivals: 0, lateArrivals: 0, halfDays: 0, shortDays: 0
};

// ─── Small reusable loading spinner ──────────────────────────────────────────
const Spinner = ({ className = 'w-4 h-4' }) => (
  <Loader className={`${className} animate-spin`} />
);

export default function AttendancePage() {
  // ─── Clock ────────────────────────────────────────────────────────────────
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // ─── UI state ─────────────────────────────────────────────────────────────
  const [sidebarOpen,      setSidebarOpen]      = useState(false);
  const [showPunchModal,   setShowPunchModal]    = useState(false);
  const [punchType,        setPunchType]         = useState('in');
  const [showFilterModal,  setShowFilterModal]   = useState(false);
  const [selectedMonth,    setSelectedMonth]     = useState(MONTHS[new Date().getMonth()]);
  const [selectedYear,     setSelectedYear]      = useState(new Date().getFullYear());

  // ─── Today's record (from API) ────────────────────────────────────────────
  const [todayRecord,   setTodayRecord]   = useState(null);   // Attendance doc
  const [todayLoading,  setTodayLoading]  = useState(true);
  const [punchLoading,  setPunchLoading]  = useState(false);

  // ─── Monthly stats (from API) ─────────────────────────────────────────────
  const [monthStats,    setMonthStats]    = useState(defaultStats);
  const [monthLoading,  setMonthLoading]  = useState(true);
  const [monthError,    setMonthError]    = useState(null);

  // ─── Derived today state ──────────────────────────────────────────────────
  const isCheckedIn  = !!todayRecord?.loginTime && !todayRecord?.logoutTime;
  const isPunchedOut = !!todayRecord?.logoutTime;
  const punchInTime  = todayRecord?.loginTime  ? new Date(todayRecord.loginTime)  : null;
  const punchOutTime = todayRecord?.logoutTime ? new Date(todayRecord.logoutTime) : null;

  // ─── Live worked hours counter ────────────────────────────────────────────
  const calculateWorkedHours = () => {
    if (!punchInTime) return '0h 0m';
    const end  = punchOutTime || currentTime;
    const diff = end - punchInTime;
    const h    = Math.floor(diff / 3_600_000);
    const m    = Math.floor((diff % 3_600_000) / 60_000);
    return `${h}h ${m}m`;
  };

  // ─── Fetch today ──────────────────────────────────────────────────────────
  const fetchToday = useCallback(async () => {
    try {
      setTodayLoading(true);
      const res = await getTodayAttendance();
      setTodayRecord(res?.data ?? null);
    } catch (err) {
      toast.error(err.message || 'Failed to load today\'s attendance');
    } finally {
      setTodayLoading(false);
    }
  }, []);

  // ─── Fetch monthly summary ────────────────────────────────────────────────
  const fetchMonthly = useCallback(async (monthName, year) => {
    try {
      setMonthLoading(true);
      setMonthError(null);
      const res = await getMonthlySummary(monthIndexOf(monthName), year);
      setMonthStats(res?.data ?? defaultStats);
    } catch (err) {
      setMonthError(err.message || 'Failed to load monthly summary');
      toast.error(err.message || 'Failed to load monthly summary');
    } finally {
      setMonthLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => { fetchToday(); }, [fetchToday]);
  useEffect(() => { fetchMonthly(selectedMonth, selectedYear); }, [fetchMonthly, selectedMonth, selectedYear]);

  // ─── Punch In ────────────────────────────────────────────────────────────
  const handlePunchIn = async (modalData) => {
    try {
      setPunchLoading(true);
      const payload = {
        latitude:  modalData?.latitude,
        longitude: modalData?.longitude,
        address:   modalData?.address,
        photo:     modalData?.photo,
        notes:     modalData?.notes,
      };
      await punchIn(payload);
      await fetchToday();
      setShowPunchModal(false);
      toast.success('Punched in successfully! ');
    } catch (err) {
      toast.error(err.message || 'Punch-in failed');
    } finally {
      setPunchLoading(false);
    }
  };


  // ─── Punch Out ───────────────────────────────────────────────────────────
  const handlePunchOut = async (modalData) => {
    try {
      setPunchLoading(true);
      const payload = {
        latitude:  modalData?.latitude,
        longitude: modalData?.longitude,
        address:   modalData?.address,
        photo:     modalData?.photo,
        notes:     modalData?.notes,
      };
      await punchOut(payload);
      await fetchToday();
      // Refresh monthly stats after punch-out since totalHours is now known
      await fetchMonthly(selectedMonth, selectedYear);
      setShowPunchModal(false);
      toast.success('Punched out successfully!');
    } catch (err) {
      toast.error(err.message || 'Punch-out failed');
    } finally {
      setPunchLoading(false);
    }
  };

  const openPunchModal = (type) => {
    setPunchType(type);
    setShowPunchModal(true);
  };

  // ─── Month filter ────────────────────────────────────────────────────────
  const handleMonthChange = (month) => {
    setSelectedMonth(month);
    setShowFilterModal(false);
    toast.info(`Showing data for ${month} ${selectedYear}`);
  };

  // ─── Download (stub) ─────────────────────────────────────────────────────
  const handleDownload = () => {
    toast.success(`Downloading ${selectedMonth} ${selectedYear} attendance report...`);
  };

  // ─── Status label ────────────────────────────────────────────────────────
  const statusLabel = () => {
    if (!todayRecord) return null;
    const map = { on_time: 'On Time', late: 'Late', half_day: 'Half Day' };
    const colorMap = {
      on_time: 'text-emerald-600',
      late:    'text-amber-600',
      half_day:'text-red-500',
    };
    return (
      <span className={`text-xl font-bold ${colorMap[todayRecord.attendanceStatus] || 'text-slate-800'}`}>
        {map[todayRecord.attendanceStatus] || '—'}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} currentPage="attendance" />

      <main className="flex-1 flex flex-col min-w-0">
        {/* ── Top Bar ── */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <Menu className="w-5 h-5 text-slate-600" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center lg:hidden">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-800">Attendance</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => { fetchToday(); fetchMonthly(selectedMonth, selectedYear); }}
              disabled={todayLoading || monthLoading}
              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-40"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${(todayLoading || monthLoading) ? 'animate-spin' : ''}`} />
            </button>
            <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-lg border border-slate-200">
              <User className="w-4 h-4 text-slate-600" />
              <p className="text-sm font-semibold text-slate-800">My Attendance</p>
            </div>
          </div>
        </header>

        {/* ── Content ── */}
        <div className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">Attendance</h2>
              <p className="text-sm sm:text-base text-slate-600">Punch in / out and review your working hours</p>
            </div>

            {/* ── Main Grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

              {/* ── Today's Attendance Card ── */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">Today's Attendance</h3>
                    <p className="text-sm text-slate-500">Track the time below to set as in or out.</p>
                  </div>
                  <button className="p-2 hover:bg-slate-50 rounded-lg transition-colors">
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                {/* Clock */}
                <div className="mb-6">
                  <p className="text-sm text-slate-500 mb-2">Current Time</p>
                  <p className="text-5xl font-bold text-slate-800 mb-2">
                    {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                  </p>
                  <p className="text-sm text-slate-600">
                    {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>

                {/* Status + Punch Button */}
                {todayLoading ? (
                  <div className="flex items-center gap-3 mb-6 text-slate-500 text-sm">
                    <Spinner /> Loading today's record…
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
                    {isPunchedOut ? (
                      <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-slate-500" />
                        <span className="text-sm font-semibold text-slate-600">
                          Completed · {calculateWorkedHours()} worked
                        </span>
                      </div>
                    ) : isCheckedIn ? (
                      <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-sm font-semibold text-green-700">
                          Checked in at {punchInTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                        <div className="w-2 h-2 bg-slate-300 rounded-full" />
                        <span className="text-sm font-semibold text-slate-600">Not checked in</span>
                      </div>
                    )}

                    {!isPunchedOut && (
                      <button
                        onClick={() => openPunchModal(isCheckedIn ? 'out' : 'in')}
                        disabled={punchLoading}
                        className={`px-6 py-2.5 rounded-lg font-semibold transition-all text-sm flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${
                          isCheckedIn
                            ? 'bg-slate-800 hover:bg-slate-900 text-white'
                            : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                        }`}
                      >
                        {punchLoading
                          ? <><Spinner /> Processing…</>
                          : isCheckedIn
                            ? <><LogOut className="w-4 h-4" /> Punch Out</>
                            : <><LogIn  className="w-4 h-4" /> Punch In</>
                        }
                      </button>
                    )}
                  </div>
                )}

                {/* Time Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Punch-in Time</p>
                    <p className="text-xl font-bold text-slate-800">
                      {punchInTime
                        ? punchInTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
                        : '--:--'}
                    </p>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Punch-out Time</p>
                    <p className="text-xl font-bold text-slate-800">
                      {punchOutTime
                        ? punchOutTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
                        : '--:--'}
                    </p>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Status</p>
                    {todayLoading ? <Spinner /> : (statusLabel() ?? <span className="text-xl font-bold text-slate-400">—</span>)}
                  </div>
                </div>
              </div>

              {/* ── Daily Summary Card ── */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-slate-800">Daily Summary</h3>
                  <button className="p-2 hover:bg-slate-50 rounded-lg transition-colors">
                    <TrendingUp className="w-5 h-5 text-slate-400" />
                  </button>
                </div>
                <p className="text-sm text-slate-500 mb-6">Summary of today's working hours</p>

                <div className="space-y-4">
                  {[
                    {
                      label: 'Punch-in time',
                      value: punchInTime
                        ? punchInTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
                        : '--:--',
                    },
                    {
                      label: 'Punch-out time',
                      value: punchOutTime
                        ? punchOutTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
                        : '--:--',
                    },
                    {
                      label: 'Total hours (today)',
                      value: calculateWorkedHours(),
                      highlight: true,
                    },
                  ].map(({ label, value, highlight }) => (
                    <div key={label} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                      <p className="text-sm font-medium text-slate-600">{label}</p>
                      <p className={`text-sm font-bold ${highlight ? 'text-blue-600' : 'text-slate-800'}`}>
                        {todayLoading ? <Spinner className="w-3 h-3" /> : value}
                      </p>
                    </div>
                  ))}

                  <div className="flex items-center justify-between py-3">
                    <p className="text-sm font-medium text-slate-600">Attendance status</p>
                    {todayLoading ? (
                      <Spinner className="w-3 h-3" />
                    ) : todayRecord ? (
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        todayRecord.attendanceStatus === 'on_time' ? 'bg-green-100 text-green-700' :
                        todayRecord.attendanceStatus === 'late'    ? 'bg-amber-100 text-amber-700' :
                                                                     'bg-red-100 text-red-600'
                      }`}>
                        {todayRecord.attendanceStatus === 'on_time' ? 'Present – On Time' :
                         todayRecord.attendanceStatus === 'late'    ? 'Present – Late'    : 'Half Day'}
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-semibold">Absent</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Monthly Summary Card ── */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">
                    Monthly Summary ({selectedMonth} {selectedYear})
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
                  {/* <button onClick={handleDownload} className="p-2 hover:bg-slate-50 rounded-lg transition-colors">
                    <Download className="w-5 h-5 text-slate-400" />
                  </button> */}
                </div>
              </div>

              {monthError && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-4 py-3 rounded-lg mb-6 border border-red-100">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{monthError}</span>
                  <button onClick={() => fetchMonthly(selectedMonth, selectedYear)}
                    className="ml-auto text-xs font-semibold underline hover:no-underline">
                    Retry
                  </button>
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
                {[
                  { label: 'Days Worked',    value: monthStats.daysWorked,       sub: 'Out of 22 working days', color: 'blue'   },
                  { label: 'Total Hours',    value: monthStats.totalHoursLabel,  sub: 'Logged this month',      color: 'emerald'},
                  { label: 'Average Daily',  value: monthStats.averageDaily,     sub: 'Hours per day',          color: 'purple' },
                ].map(({ label, value, sub, color }) => (
                  <div key={label} className={`bg-${color}-50 rounded-lg p-4 border border-${color}-100`}>
                    <p className={`text-xs font-semibold text-${color}-600 uppercase tracking-wider mb-2`}>{label}</p>
                    {monthLoading
                      ? <Spinner className="w-6 h-6" />
                      : <p className={`text-3xl font-bold text-${color}-700 mb-1`}>{value}</p>}
                    <p className={`text-xs text-${color}-600`}>{sub}</p>
                  </div>
                ))}
              </div>

              {/* Detailed Stats */}
              <div className="space-y-3">
                {[
                  { label: 'On-time arrivals', value: monthStats.onTimeArrivals, badge: 'bg-green-100 text-green-700' },
                  { label: 'Late arrivals',    value: monthStats.lateArrivals,   badge: 'bg-amber-100 text-amber-700' },
                  { label: 'Half days',        value: monthStats.halfDays,       badge: 'bg-red-100 text-red-600'    },
                  { label: 'Short days (< 8h)',value: monthStats.shortDays,      badge: 'bg-slate-100 text-slate-600'},
                ].map(({ label, value, badge }) => (
                  <div key={label} className="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <p className="text-sm font-medium text-slate-700">{label}</p>
                    {monthLoading
                      ? <Spinner className="w-3 h-3" />
                      : <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${badge}`}>{value}</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── Punch Modal ── */}
      {showPunchModal && (
        <PunchModal
          type={punchType}
          onClose={() => setShowPunchModal(false)}
          onSubmit={punchType === 'in' ? handlePunchIn : handlePunchOut}
        />
      )}

      {/* ── Filter Modal ── */}
      {showFilterModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowFilterModal(false)} />
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full">
              <div className="flex items-center justify-between p-6 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800">Select Month</h3>
                <button onClick={() => setShowFilterModal(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              <div className="p-6">
                {/* Year selector */}
                <div className="flex items-center justify-center gap-4 mb-4">
                  <button onClick={() => setSelectedYear(y => y - 1)} className="px-3 py-1 rounded-lg text-blue-500 hover:text-blue-500/60 text-sm font-semibold transition-colors">
                    ← {selectedYear - 1}
                  </button>
                  <span className="text-lg font-bold bg-blue-600 px-6 p-1 rounded-lg">{selectedYear}</span>
                  <button
                    onClick={() => setSelectedYear(y => y + 1)}
                    disabled={selectedYear >= new Date().getFullYear()}
                    className="px-3 py-1 rounded-lg text-blue-500 hover:text-blue-500/60 text-sm font-semibold transition-colors disabled:opacity-30"
                  >
                    {selectedYear + 1} →
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {MONTHS.map((month) => (
                    <button key={month} onClick={() => handleMonthChange(month)}
                      className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                        selectedMonth === month
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}>
                      {month.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6 border-t border-slate-200">
                <button onClick={() => setShowFilterModal(false)}
                  className="w-full px-4 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile Bottom Nav ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-30">
        <div className="grid grid-cols-4 gap-1 px-2 py-2">
          {[
            { icon: HomeIcon,    label: 'Home',       active: false },
            { icon: Calendar,   label: 'Attendance', active: true  },
            { icon: CheckSquare,label: 'Tasks',      active: false },
            { icon: User,       label: 'Profile',    active: false },
          ].map(({ icon: Icon, label, active }) => (
            <button key={label} className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors ${
              active ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
            }`}>
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}