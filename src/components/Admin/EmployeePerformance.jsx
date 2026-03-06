'use client';

import { useState, useEffect } from 'react';
import {
  IoTrendingUp,
  IoTrendingDown,
  IoCalendarOutline,
  IoTimeOutline,
  IoCheckmarkCircle,
  IoAlertCircle,
  IoDocumentTextOutline,
  IoStarOutline,
  IoChevronDown,
  IoMenu,
} from 'react-icons/io5';
import { MdFilterList } from 'react-icons/md';
import { BiDownload, BiRefresh } from 'react-icons/bi';
import { FiX } from 'react-icons/fi';
import AdminSidebar from './Admimsidebar';
import {
  getPerformanceStats,
  getTopPerformers,
  getAllPerformances,
  getDateRangeForPeriod,
  formatPerformanceData,
} from '../../services/performanceService';

export default function PerformancePage() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [viewMode, setViewMode] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // State for API data — UNCHANGED
  const [performanceStats, setPerformanceStats] = useState({
    overall: { attendance: 0, productivity: 0, taskCompletion: 0, avgWorkHours: 0 },
    trends: { attendance: 0, productivity: 0, taskCompletion: 0, avgWorkHours: 0 },
  });
  const [topPerformers, setTopPerformers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ─── ALL LOGIC UNCHANGED ────────────────────────────────────────────────────
  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const periodMap = {
        week: "week",
        month: "month",
        quarter: "quarter",
        year: "year",
      };
      const backendPeriod = periodMap[selectedPeriod] || 'month';

      const [statsResponse, topPerformersResponse, allPerformancesResponse] = await Promise.all([
        getPerformanceStats(backendPeriod, selectedDepartment),
        getTopPerformers(backendPeriod, 3, selectedDepartment),
        getAllPerformances({ period: backendPeriod, department: selectedDepartment, sortBy: 'overallScore', order: 'desc', page: 1, limit: 50 }),
      ]);

      if (statsResponse?.success) {
        setPerformanceStats({
          overall: {
            attendance: statsResponse.data?.avgAttendance || 0,
            productivity: statsResponse.data?.avgOverallScore || 0,
            taskCompletion: statsResponse.data?.avgTaskCompletion || 0,
            avgWorkHours: statsResponse.data?.avgWorkHours || 0,
          },
          trends: statsResponse.data?.trends || { attendance: 0, productivity: 0, taskCompletion: 0, avgWorkHours: 0 },
        });
      }

      if (topPerformersResponse?.success) {
        setTopPerformers(
          topPerformersResponse.data?.map((performer) => {
            const f = formatPerformanceData(performer);
            return {
              id: f.employeeId || performer._id,
              name: f.employeeName || 'Unknown',
              email: f.employeeEmail || '',
              avatar: f.employeeName ? f.employeeName.split(' ').map(n => n[0]).join('').toUpperCase() : 'NA',
              department: f.department || 'N/A',
              score: Math.round(f.overallScore || 0),
              attendance: Math.round(f.attendance || 0),
              productivity: Math.round(f.productivity || 0),
              tasks: f.completedTasks || 0,
              trend: f.trend === 'improving' ? 'up' : f.trend === 'declining' ? 'down' : 'stable',
            };
          }) || []
        );
      }

      if (allPerformancesResponse?.success) {
        setEmployees(
          allPerformancesResponse.data?.map((perf) => {
            const f = formatPerformanceData(perf);
            return {
              id: perf._id,
              employeeId: f.employeeId,
              name: f.employeeName || 'Unknown',
              email: f.employeeEmail || '',
              avatar: f.employeeName ? f.employeeName.split(' ').map(n => n[0]).join('').toUpperCase() : 'NA',
              department: f.department || 'N/A',
              attendance: Math.round(f.attendance || 0),
              productivity: Math.round(f.productivity || 0),
              tasksCompleted: f.completedTasks || 0,
              totalTasks: f.totalTasks || 0,
              avgHours: f.avgWorkHours ? f.avgWorkHours.toFixed(1) : '0.0',
              lateCount: perf.attendanceMetrics?.lateCount || 0,
              score: Math.round(f.overallScore || 0),
            };
          }) || []
        );
        console.log('ALL PERFORMANCES RESPONSE:', allPerformancesResponse);
      }
    } catch (err) {
      console.error('Error fetching performance data:', err);
      setError(err.message || 'Failed to fetch performance data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAllData(); }, [selectedPeriod, selectedDepartment]);

  const handleRefresh = () => fetchAllData();

  const handleExport = () => {
    if (employees.length === 0) { alert('No data to export'); return; }
    const csvData = employees.map(emp => ({
      Name: emp.name, Email: emp.email, Department: emp.department,
      Attendance: emp.attendance, Productivity: emp.productivity,
      Tasks: `${emp.tasksCompleted}/${emp.totalTasks}`,
      'Avg Hours': emp.avgHours, 'Late Count': emp.lateCount, Score: emp.score,
    }));
    const headers = Object.keys(csvData[0]).join(',');
    const rows = csvData.map(row => Object.values(row).join(','));
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };
  // ────────────────────────────────────────────────────────────────────────────

  const statCards = [
    {
      icon: IoCheckmarkCircle, iconBg: 'bg-blue-100', iconColor: 'text-blue-600',
      value: `${performanceStats.overall.attendance.toFixed(1)}%`,
      label: 'Avg Attendance',
      trend: performanceStats.trends.attendance,
      unit: '%',
    },
    {
      icon: IoTrendingUp, iconBg: 'bg-purple-100', iconColor: 'text-purple-600',
      value: `${performanceStats.overall.productivity.toFixed(1)}%`,
      label: 'Productivity Score',
      trend: performanceStats.trends.productivity,
      unit: '%',
    },
    {
      icon: IoDocumentTextOutline, iconBg: 'bg-green-100', iconColor: 'text-green-600',
      value: `${performanceStats.overall.taskCompletion.toFixed(1)}%`,
      label: 'Task Completion',
      trend: performanceStats.trends.taskCompletion,
      unit: '%',
    },
    {
      icon: IoTimeOutline, iconBg: 'bg-orange-100', iconColor: 'text-orange-600',
      value: `${performanceStats.overall.avgWorkHours.toFixed(1)}h`,
      label: 'Avg Work Hours',
      trend: performanceStats.trends.avgWorkHours,
      unit: 'h',
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 text-black">
      <AdminSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* ── HEADER ── */}
        <div className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <div className="flex items-center justify-between gap-3">
              {/* Left */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
                >
                  <IoMenu className="w-5 h-5 text-slate-600" />
                </button>
                <div className="min-w-0">
                  <h1 className="text-base sm:text-xl lg:text-2xl font-bold text-slate-900 truncate">
                    Employee Performance
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5 hidden sm:block">
                    Track and analyze team performance metrics
                  </p>
                </div>
              </div>

              {/* Right */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                  title="Refresh"
                >
                  <BiRefresh className={`w-4 h-4 sm:w-5 sm:h-5 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={handleExport}
                  disabled={loading || employees.length === 0}
                  className="flex items-center gap-1.5 px-3 sm:px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  <BiDownload className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                  <span className="text-xs sm:text-sm font-medium text-slate-700 hidden sm:inline">Export</span>
                </button>
                {/* Mobile filter button */}
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="lg:hidden flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <MdFilterList className="w-4 h-4 text-slate-600" />
                  <span className="text-xs font-medium text-slate-700">Filters</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── BODY ── */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-start gap-3">
                <IoAlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold">Error loading data</p>
                  <p className="text-xs mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {/* ── DESKTOP FILTERS ── */}
            <div className="hidden lg:block bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Time Period</label>
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm bg-white"
                  >
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="quarter">This Quarter</option>
                    <option value="year">This Year</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Department</label>
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm bg-white"
                  >
                    <option value="all">All Departments</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Management">Management</option>
                    <option value="Sales">Sales</option>
                    <option value="Marketing">Marketing</option>
                    <option value="HR">HR</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">View Mode</label>
                  <div className="flex gap-2">
                    {['overview', 'detailed'].map(m => (
                      <button
                        key={m}
                        onClick={() => setViewMode(m)}
                        className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-medium capitalize transition-colors ${viewMode === m ? 'bg-teal-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ── MOBILE FILTER DRAWER ── */}
            {showMobileFilters && (
              <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setShowMobileFilters(false)}>
                <div
                  className="absolute right-0 top-0 bottom-0 w-full max-w-xs bg-white shadow-2xl flex flex-col"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between px-4 py-4 border-b border-slate-200">
                    <h2 className="text-base font-bold text-slate-900">Filters</h2>
                    <button onClick={() => setShowMobileFilters(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                      <FiX className="w-5 h-5 text-slate-600" />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Time Period</label>
                      <select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm bg-white"
                      >
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="quarter">This Quarter</option>
                        <option value="year">This Year</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Department</label>
                      <select
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm bg-white"
                      >
                        <option value="all">All Departments</option>
                        <option value="Engineering">Engineering</option>
                        <option value="Management">Management</option>
                        <option value="Sales">Sales</option>
                        <option value="Marketing">Marketing</option>
                        <option value="HR">HR</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">View Mode</label>
                      <div className="flex gap-2">
                        {['overview', 'detailed'].map(m => (
                          <button
                            key={m}
                            onClick={() => setViewMode(m)}
                            className={`flex-1 py-2.5 rounded-lg text-sm font-medium capitalize transition-colors ${viewMode === m ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-700'
                              }`}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border-t border-slate-200">
                    <button
                      onClick={() => setShowMobileFilters(false)}
                      className="w-full py-2.5 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── LOADING ── */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4" />
                <p className="text-sm text-slate-500">Loading performance data...</p>
              </div>
            ) : (
              <>
                {/* ── STAT CARDS ── */}
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
                  {statCards.map(({ icon: Icon, iconBg, iconColor, value, label, trend, unit }) => (
                    <div key={label} className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div className={`w-9 h-9 sm:w-10 sm:h-10 ${iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${iconColor}`} />
                        </div>
                        {trend > 0 ? (
                          <span className="flex items-center gap-0.5 text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                            <IoTrendingUp className="w-3 h-3" />{trend}{unit}
                          </span>
                        ) : (
                          <span className="flex items-center gap-0.5 text-xs font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                            <IoTrendingDown className="w-3 h-3" />{Math.abs(trend)}{unit}
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-slate-900">{value}</h3>
                      <p className="text-xs sm:text-sm text-slate-500 mt-0.5 truncate">{label}</p>
                    </div>
                  ))}
                </div>

                {/* ── TOP PERFORMERS ── */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h2 className="text-base sm:text-lg font-bold text-slate-900">Top Performers</h2>
                    <IoStarOutline className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
                  </div>

                  {topPerformers.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <IoAlertCircle className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                      <p className="text-sm">No performance data available for this period</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {topPerformers.map((performer, index) => (
                        <div
                          key={performer.id}
                          className="border-2 border-slate-200 rounded-xl p-4 hover:border-teal-400 hover:shadow-md transition-all relative"
                        >
                          {index === 0 && (
                            <div className="absolute -top-3 -right-3 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                              <span className="text-white font-bold text-sm">🏆</span>
                            </div>
                          )}
                          <div className="flex items-start gap-3 mb-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-teal-500 to-teal-700 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 shadow">
                              {performer.avatar}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-slate-900 text-sm truncate">{performer.name}</h3>
                              <p className="text-xs text-slate-500 truncate">{performer.email}</p>
                              <p className="text-xs text-teal-600 font-medium mt-0.5">{performer.department}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xl sm:text-2xl font-bold text-slate-900">{performer.score}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${performer.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              }`}>
                              {performer.trend === 'up' ? '↑' : '↓'} Trending
                            </span>
                          </div>

                          <div className="space-y-1.5 border-t border-slate-100 pt-3">
                            {[
                              { label: 'Attendance', val: `${performer.attendance}%` },
                              { label: 'Productivity', val: `${performer.productivity}%` },
                              { label: 'Tasks Done', val: performer.tasks },
                            ].map(({ label, val }) => (
                              <div key={label} className="flex justify-between items-center text-xs sm:text-sm">
                                <span className="text-slate-500">{label}</span>
                                <span className="font-semibold text-slate-800">{val}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ── EMPLOYEE TABLE ── */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="px-4 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                    <h2 className="text-base sm:text-lg font-bold text-slate-900">All Employees</h2>
                    <span className="text-xs text-slate-500">{employees.length} records</span>
                  </div>

                  {employees.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                      <IoAlertCircle className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                      <p className="text-sm">No employee data available for this period</p>
                    </div>
                  ) : (
                    <>
                      {/* Desktop Table */}
                      <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                              {['Employee', 'Department', 'Attendance', 'Productivity', 'Tasks', 'Avg Hours', 'Score'].map(h => (
                                <th
                                  key={h}
                                  className={`px-4 lg:px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider ${h === 'Employee' || h === 'Department' ? 'text-left' : 'text-center'
                                    }`}
                                >
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {employees.map((emp) => (
                              <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-4 lg:px-6 py-3.5 whitespace-nowrap">
                                  <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-gradient-to-br from-teal-500 to-teal-700 rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                                      {emp.avatar}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="font-medium text-slate-900 text-sm truncate">{emp.name}</p>
                                      <p className="text-xs text-slate-500 truncate">{emp.email}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 lg:px-6 py-3.5 whitespace-nowrap">
                                  <span className="px-2.5 py-1 bg-teal-50 text-teal-700 border border-teal-100 rounded-full text-xs font-medium">
                                    {emp.department}
                                  </span>
                                </td>
                                <td className="px-4 lg:px-6 py-3.5 whitespace-nowrap text-center">
                                  <div className="flex flex-col items-center gap-1">
                                    <span className="font-semibold text-slate-800 text-sm">{emp.attendance}%</span>
                                    <div className="w-14 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(emp.attendance, 100)}%` }} />
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 lg:px-6 py-3.5 whitespace-nowrap text-center">
                                  <div className="flex flex-col items-center gap-1">
                                    <span className="font-semibold text-slate-800 text-sm">{emp.productivity}%</span>
                                    <div className="w-14 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                      <div className="h-full bg-purple-500 rounded-full" style={{ width: `${Math.min(emp.productivity, 100)}%` }} />
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 lg:px-6 py-3.5 whitespace-nowrap text-center">
                                  <span className="text-sm font-medium text-slate-800">{emp.tasksCompleted}/{emp.totalTasks}</span>
                                </td>
                                <td className="px-4 lg:px-6 py-3.5 whitespace-nowrap text-center">
                                  <span className="text-sm font-medium text-slate-800">{emp.avgHours}h</span>
                                </td>
                                <td className="px-4 lg:px-6 py-3.5 whitespace-nowrap text-center">
                                  <span className={`text-base font-bold ${emp.score >= 80 ? 'text-green-600' : emp.score >= 60 ? 'text-teal-600' : 'text-red-500'
                                    }`}>
                                    {emp.score}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile Card View */}
                      <div className="md:hidden divide-y divide-slate-100">
                        {employees.map((emp) => (
                          <div key={emp.id} className="p-4 hover:bg-slate-50 transition-colors">
                            {/* Header row */}
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-700 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                                {emp.avatar}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-slate-900 text-sm truncate">{emp.name}</p>
                                <p className="text-xs text-slate-500 truncate">{emp.email}</p>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                <span className={`text-lg font-bold ${emp.score >= 80 ? 'text-green-600' : emp.score >= 60 ? 'text-teal-600' : 'text-red-500'
                                  }`}>{emp.score}</span>
                                <span className="px-2 py-0.5 bg-teal-50 text-teal-700 rounded-full text-xs font-medium">
                                  {emp.department}
                                </span>
                              </div>
                            </div>

                            {/* Stats grid */}
                            <div className="grid grid-cols-2 gap-2">
                              <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100">
                                <p className="text-xs text-slate-500 mb-1">Attendance</p>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-bold text-slate-800">{emp.attendance}%</span>
                                  <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(emp.attendance, 100)}%` }} />
                                  </div>
                                </div>
                              </div>
                              <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100">
                                <p className="text-xs text-slate-500 mb-1">Productivity</p>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-bold text-slate-800">{emp.productivity}%</span>
                                  <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-purple-500 rounded-full" style={{ width: `${Math.min(emp.productivity, 100)}%` }} />
                                  </div>
                                </div>
                              </div>
                              <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100">
                                <p className="text-xs text-slate-500 mb-1">Tasks</p>
                                <span className="text-sm font-bold text-slate-800">{emp.tasksCompleted}/{emp.totalTasks}</span>
                              </div>
                              <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100">
                                <p className="text-xs text-slate-500 mb-1">Avg Hours</p>
                                <span className="text-sm font-bold text-slate-800">{emp.avgHours}h</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}