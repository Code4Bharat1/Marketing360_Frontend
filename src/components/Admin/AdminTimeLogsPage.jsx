'use client';

import { useState, useEffect } from 'react';
import {
  IoSearchOutline,
  IoFilterOutline,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoTimeOutline,
  IoCalendarOutline,
  IoPersonOutline,
  IoBriefcaseOutline,
  IoEllipsisVertical,
  IoEyeOutline,
  IoChevronDown,
  IoChevronUp,
  IoMenu,
} from 'react-icons/io5';
import { BiRefresh, BiDownload } from 'react-icons/bi';
import { FiFilter, FiX } from 'react-icons/fi';
import projectTimeLogService from '@/services/projectTimeLogService';
import TimeLogDetailsModal from './TimeLogDetailsModal';
import RejectModal from './RejectModal';
import AdminSidebar from './Admimsidebar';

export default function AdminTimeLogsPage() {
  const [timeLogs, setTimeLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterTaskType, setFilterTaskType] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedTimeLog, setSelectedTimeLog] = useState(null);
  const [showMenu, setShowMenu] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expandedCard, setExpandedCard] = useState(null);

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalHours: 0,
  });

  useEffect(() => {
    fetchTimeLogs();
  }, [filterStatus, filterTaskType, dateRange]);

  const fetchTimeLogs = async () => {
    try {
      setLoading(true);
      const filters = {};
      
      if (filterStatus) filters.status = filterStatus;
      if (filterTaskType) filters.taskType = filterTaskType;
      if (dateRange.start) filters.startDate = dateRange.start;
      if (dateRange.end) filters.endDate = dateRange.end;

      const response = await projectTimeLogService.getTimeLogs(filters);
      let logsData = response.data || [];

      // Filter by search query
      if (searchQuery) {
        logsData = logsData.filter(log => 
          log.employee?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.project?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      setTimeLogs(logsData);

      // Calculate stats
      const total = logsData.length;
      const pending = logsData.filter(l => l.status === 'pending').length;
      const approved = logsData.filter(l => l.status === 'approved').length;
      const rejected = logsData.filter(l => l.status === 'rejected').length;
      const totalHours = logsData
        .filter(l => l.status === 'approved')
        .reduce((sum, l) => sum + (l.hoursSpent || 0), 0);

      setStats({ total, pending, approved, rejected, totalHours });
    } catch (error) {
      console.error('Error fetching time logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchTimeLogs();
  };

  const handleViewDetails = (log) => {
    setSelectedTimeLog(log);
    setShowDetailsModal(true);
    setShowMenu(null);
  };

  const handleApprove = async (logId) => {
    if (window.confirm('Are you sure you want to approve this time log?')) {
      try {
        await projectTimeLogService.approveTimeLog(logId);
        fetchTimeLogs();
        setShowMenu(null);
      } catch (error) {
        console.error('Error approving time log:', error);
        alert(error.response?.data?.message || 'Error approving time log');
      }
    }
  };

  const handleReject = (log) => {
    setSelectedTimeLog(log);
    setShowRejectModal(true);
    setShowMenu(null);
  };

  const handleRejectSubmit = async (rejectionReason) => {
    try {
      await projectTimeLogService.rejectTimeLog(selectedTimeLog._id, rejectionReason);
      fetchTimeLogs();
      setShowRejectModal(false);
    } catch (error) {
      console.error('Error rejecting time log:', error);
      alert(error.response?.data?.message || 'Error rejecting time log');
    }
  };

  const handleDelete = async (logId) => {
    if (window.confirm('Are you sure you want to delete this time log?')) {
      try {
        await projectTimeLogService.deleteTimeLog(logId);
        fetchTimeLogs();
        setShowMenu(null);
      } catch (error) {
        console.error('Error deleting time log:', error);
        alert(error.response?.data?.message || 'Error deleting time log');
      }
    }
  };

  const clearFilters = () => {
    setFilterStatus('');
    setFilterTaskType('');
    setDateRange({ start: '', end: '' });
    setSearchQuery('');
  };

  const hasActiveFilters = filterStatus || filterTaskType || dateRange.start || dateRange.end || searchQuery;

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      approved: 'bg-green-100 text-green-700 border-green-200',
      rejected: 'bg-red-100 text-red-700 border-red-200',
    };
    return colors[status] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const getTaskTypeColor = (taskType) => {
    const colors = {
      Development: 'bg-blue-100 text-blue-700 border-blue-200',
      Design: 'bg-purple-100 text-purple-700 border-purple-200',
      Testing: 'bg-orange-100 text-orange-700 border-orange-200',
      'Bug Fix': 'bg-red-100 text-red-700 border-red-200',
      Documentation: 'bg-slate-100 text-slate-700 border-slate-200',
      Meeting: 'bg-teal-100 text-teal-700 border-teal-200',
      Planning: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      Review: 'bg-pink-100 text-pink-700 border-pink-200',
      Other: 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return colors[taskType] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-black">
      {/* Sidebar */}
      <AdminSidebar 
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header - Fully Responsive */}
        <div className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <div className="flex items-center justify-between gap-3">
              {/* Left: Menu + Title */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
                >
                  <IoMenu className="w-5 h-5 text-slate-600" />
                </button>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-2xl font-bold text-slate-900 truncate">
                    Project Time Logs
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5 hidden sm:block">
                    Review and manage employee time logs
                  </p>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => fetchTimeLogs()}
                  className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  title="Refresh"
                >
                  <BiRefresh className="w-5 h-5 text-slate-600" />
                </button>
                
                {/* Mobile Filter Toggle */}
                <button
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className="lg:hidden p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors relative"
                >
                  <FiFilter className="w-5 h-5 text-slate-600" />
                  {hasActiveFilters && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-teal-600 rounded-full border-2 border-white"></span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            {/* Statistics Cards - Responsive Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <StatCard
                icon={IoTimeOutline}
                iconBg="bg-blue-100"
                iconColor="text-blue-600"
                value={stats.total}
                label="Total Logs"
              />
              <StatCard
                icon={IoTimeOutline}
                iconBg="bg-yellow-100"
                iconColor="text-yellow-600"
                value={stats.pending}
                label="Pending"
              />
              <StatCard
                icon={IoCheckmarkCircle}
                iconBg="bg-green-100"
                iconColor="text-green-600"
                value={stats.approved}
                label="Approved"
              />
              <StatCard
                icon={IoCloseCircle}
                iconBg="bg-red-100"
                iconColor="text-red-600"
                value={stats.rejected}
                label="Rejected"
              />
              <StatCard
                icon={IoTimeOutline}
                iconBg="bg-purple-100"
                iconColor="text-purple-600"
                value={`${stats.totalHours}h`}
                label="Total Hours"
                className="col-span-2 sm:col-span-1"
              />
            </div>

            {/* Desktop Filters */}
            <div className="hidden lg:block bg-white rounded-xl border border-slate-200 p-4 mb-6 shadow-sm">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-2">
                  <div className="relative">
                    <IoSearchOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search by employee, project..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                    />
                  </div>
                </div>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm bg-white"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>

                <select
                  value={filterTaskType}
                  onChange={(e) => setFilterTaskType(e.target.value)}
                  className="px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm bg-white"
                >
                  <option value="">All Task Types</option>
                  <option value="Development">Development</option>
                  <option value="Design">Design</option>
                  <option value="Testing">Testing</option>
                  <option value="Bug Fix">Bug Fix</option>
                  <option value="Documentation">Documentation</option>
                  <option value="Meeting">Meeting</option>
                  <option value="Planning">Planning</option>
                  <option value="Review">Review</option>
                  <option value="Other">Other</option>
                </select>

                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                  placeholder="Start Date"
                />
              </div>

            {hasActiveFilters && (
  <div className="mt-3 flex items-center justify-between">
    <p className="text-xs text-slate-500">
      {timeLogs.length} result{timeLogs.length !== 1 ? 's' : ''} found  {/* ✅ Fix */}
    </p>
    <button
      onClick={clearFilters}
      className="text-xs text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
    >
      <FiX className="w-3 h-3" />
      Clear all filters
    </button>
  </div>
)}
            </div>

            {/* Mobile Filters - Slide-out Panel */}
            {showMobileFilters && (
              <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setShowMobileFilters(false)}>
                <div 
                  className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-2xl overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="sticky top-0 bg-white border-b border-slate-200 px-4 py-4 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-900">Filters</h2>
                    <button
                      onClick={() => setShowMobileFilters(false)}
                      className="p-2 hover:bg-slate-100 rounded-lg"
                    >
                      <FiX className="w-5 h-5 text-slate-600" />
                    </button>
                  </div>

                  <div className="p-4 space-y-4">
                    {/* Search */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-2">Search</label>
                      <div className="relative">
                        <IoSearchOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                        />
                      </div>
                    </div>

                    {/* Status */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-2">Status</label>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm bg-white"
                      >
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>

                    {/* Task Type */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-2">Task Type</label>
                      <select
                        value={filterTaskType}
                        onChange={(e) => setFilterTaskType(e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm bg-white"
                      >
                        <option value="">All Task Types</option>
                        <option value="Development">Development</option>
                        <option value="Design">Design</option>
                        <option value="Testing">Testing</option>
                        <option value="Bug Fix">Bug Fix</option>
                        <option value="Documentation">Documentation</option>
                        <option value="Meeting">Meeting</option>
                        <option value="Planning">Planning</option>
                        <option value="Review">Review</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {/* Date */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-2">Start Date</label>
                      <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                      />
                    </div>

                    {/* Actions */}
                    <div className="pt-4 border-t border-slate-200 space-y-2">
                      <button
                        onClick={() => {
                          handleSearch();
                          setShowMobileFilters(false);
                        }}
                        className="w-full px-4 py-2.5 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
                      >
                        Apply Filters
                      </button>
                      {hasActiveFilters && (
                        <button
                          onClick={() => {
                            clearFilters();
                            setShowMobileFilters(false);
                          }}
                          className="w-full px-4 py-2.5 border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                        >
                          Clear All
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Content */}
            {loading ? (
              <div className="flex justify-center items-center py-12 sm:py-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
                  <p className="text-sm text-slate-600">Loading time logs...</p>
                </div>
              </div>
            ) : timeLogs.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 sm:p-12 text-center shadow-sm">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <IoTimeOutline className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No Time Logs Found</h3>
                <p className="text-slate-600 text-sm">
                  {hasActiveFilters ? 'Try adjusting your filters' : 'No time logs have been submitted yet'}
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="mt-4 px-4 py-2 text-sm text-teal-600 hover:text-teal-700 font-medium"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden lg:block bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                            Employee
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                            Project
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                            Task Type
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                            Hours
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {timeLogs.map((log) => (
                          <tr key={log._id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm flex-shrink-0">
                                  {log.employee?.name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-medium text-slate-900 truncate">{log.employee?.name}</div>
                                  <div className="text-xs text-slate-500 truncate">{log.employee?.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-medium text-slate-900">{log.project?.name}</div>
                              {log.project?.client && (
                                <div className="text-xs text-slate-500">{log.project.client}</div>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTaskTypeColor(log.taskType)}`}>
                                {log.taskType}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center whitespace-nowrap">
                              <div className="text-sm text-slate-900">
                                {new Date(log.date).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric',
                                  year: 'numeric' 
                                })}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="inline-flex items-center justify-center px-3 py-1 bg-teal-50 text-teal-700 rounded-lg font-bold text-sm">
                                {log.hoursSpent}h
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(log.status)}`}>
                                {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <ActionMenu
                                log={log}
                                showMenu={showMenu}
                                setShowMenu={setShowMenu}
                                onViewDetails={handleViewDetails}
                                onApprove={handleApprove}
                                onReject={handleReject}
                                onDelete={handleDelete}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mobile Card View - Enhanced */}
                <div className="lg:hidden space-y-3">
                  {timeLogs.map((log) => (
                    <MobileTimeLogCard
                      key={log._id}
                      log={log}
                      expanded={expandedCard === log._id}
                      onToggle={() => setExpandedCard(expandedCard === log._id ? null : log._id)}
                      showMenu={showMenu}
                      setShowMenu={setShowMenu}
                      onViewDetails={handleViewDetails}
                      onApprove={handleApprove}
                      onReject={handleReject}
                      onDelete={handleDelete}
                      getStatusColor={getStatusColor}
                      getTaskTypeColor={getTaskTypeColor}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showDetailsModal && selectedTimeLog && (
        <TimeLogDetailsModal
          timeLog={selectedTimeLog}
          onClose={() => setShowDetailsModal(false)}
        />
      )}

      {showRejectModal && selectedTimeLog && (
        <RejectModal
          timeLog={selectedTimeLog}
          onClose={() => setShowRejectModal(false)}
          onSubmit={handleRejectSubmit}
        />
      )}
    </div>
  );
}

// ========== Stat Card Component ==========
function StatCard({ icon: Icon, iconBg, iconColor, value, label, className = '' }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 p-4 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>
      <h3 className="text-2xl font-bold text-slate-900 mb-0.5 truncate">{value}</h3>
      <p className="text-xs sm:text-sm text-slate-600 truncate">{label}</p>
    </div>
  );
}

// ========== Action Menu Component ==========
function ActionMenu({ log, showMenu, setShowMenu, onViewDetails, onApprove, onReject, onDelete }) {
  return (
    <div className="relative inline-block">
      <button
        onClick={() => setShowMenu(showMenu === log._id ? null : log._id)}
        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
      >
        <IoEllipsisVertical className="w-5 h-5 text-slate-600" />
      </button>

      {showMenu === log._id && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowMenu(null)}
          />
          <div className="absolute right-0 top-10 w-48 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-20">
            <button
              onClick={() => onViewDetails(log)}
              className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
            >
              <IoEyeOutline className="w-4 h-4" />
              View Details
            </button>
            {log.status === 'pending' && (
              <>
                <button
                  onClick={() => onApprove(log._id)}
                  className="w-full px-4 py-2 text-left text-sm text-green-700 hover:bg-green-50 transition-colors flex items-center gap-2"
                >
                  <IoCheckmarkCircle className="w-4 h-4" />
                  Approve
                </button>
                <button
                  onClick={() => onReject(log)}
                  className="w-full px-4 py-2 text-left text-sm text-red-700 hover:bg-red-50 transition-colors flex items-center gap-2"
                >
                  <IoCloseCircle className="w-4 h-4" />
                  Reject
                </button>
              </>
            )}
            <button
              onClick={() => onDelete(log._id)}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-slate-100 mt-1 pt-2"
            >
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ========== Mobile Card Component ==========
function MobileTimeLogCard({ 
  log, 
  expanded, 
  onToggle, 
  showMenu, 
  setShowMenu,
  onViewDetails, 
  onApprove, 
  onReject, 
  onDelete,
  getStatusColor,
  getTaskTypeColor 
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Card Header */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm flex-shrink-0">
              {log.employee?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-medium text-slate-900 truncate text-sm">{log.employee?.name}</div>
              <div className="text-xs text-slate-500 truncate">{log.project?.name}</div>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="p-2 hover:bg-slate-100 rounded-lg flex-shrink-0 transition-colors"
          >
            {expanded ? (
              <IoChevronUp className="w-5 h-5 text-slate-600" />
            ) : (
              <IoChevronDown className="w-5 h-5 text-slate-600" />
            )}
          </button>
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-xs text-slate-500 block mb-1">Hours</span>
            <span className="inline-flex items-center px-2.5 py-1 bg-teal-50 text-teal-700 rounded-lg font-bold text-sm">
              {log.hoursSpent}h
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-500 block mb-1">Status</span>
            <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium border ${getStatusColor(log.status)}`}>
              {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-slate-100 pt-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-xs text-slate-500 block mb-1">Task Type</span>
              <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium border ${getTaskTypeColor(log.taskType)}`}>
                {log.taskType}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block mb-1">Date</span>
              <span className="text-sm font-medium text-slate-900 block">
                {new Date(log.date).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          </div>

          {log.description && (
            <div>
              <span className="text-xs text-slate-500 block mb-1">Description</span>
              <p className="text-sm text-slate-700 line-clamp-2">{log.description}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => onViewDetails(log)}
              className="flex-1 px-3 py-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              View Details
            </button>
            {log.status === 'pending' && (
              <>
                <button
                  onClick={() => onApprove(log._id)}
                  className="flex-1 px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Approve
                </button>
                <button
                  onClick={() => onReject(log)}
                  className="flex-1 px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Reject
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}