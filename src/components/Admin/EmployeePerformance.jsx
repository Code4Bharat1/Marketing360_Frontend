'use client';

import { useState } from 'react';
import { 
  IoTrendingUp, 
  IoTrendingDown, 
  IoCalendarOutline,
  IoTimeOutline,
  IoCheckmarkCircle,
  IoAlertCircle,
  IoDocumentTextOutline,
  IoStarOutline,
  IoChevronDown
} from 'react-icons/io5';
import { MdFilterList } from 'react-icons/md';
import { BiDownload, BiRefresh } from 'react-icons/bi';
import AdminSidebar from './Admimsidebar';

export default function PerformancePage() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [viewMode, setViewMode] = useState('overview');

  const performanceStats = {
    overall: {
      attendance: 94.5,
      productivity: 87.3,
      taskCompletion: 91.2,
      avgWorkHours: 8.2
    },
    trends: {
      attendance: 2.3,
      productivity: -1.5,
      taskCompletion: 5.1,
      avgWorkHours: 0.5
    }
  };

  const topPerformers = [
    {
      id: 1,
      name: 'Sneha Reddy',
      email: 'sneha@company.com',
      avatar: 'SR',
      department: 'Engineering',
      score: 96.5,
      attendance: 98,
      productivity: 95,
      tasks: 48,
      trend: 'up'
    },
    {
      id: 2,
      name: 'Admin User',
      email: 'admin@company.com',
      avatar: 'AU',
      department: 'Management',
      score: 94.2,
      attendance: 96,
      productivity: 92,
      tasks: 45,
      trend: 'up'
    },
    {
      id: 3,
      name: 'Rahul Kumar',
      email: 'rahul@company.com',
      avatar: 'RK',
      department: 'Engineering',
      score: 89.7,
      attendance: 92,
      productivity: 87,
      tasks: 42,
      trend: 'down'
    }
  ];

  const employees = [
    {
      id: 1,
      name: 'Sneha Reddy',
      email: 'sneha@company.com',
      avatar: 'SR',
      department: 'Engineering',
      attendance: 98,
      productivity: 95,
      tasksCompleted: 48,
      totalTasks: 50,
      avgHours: 8.5,
      lateCount: 1,
      score: 96.5
    },
    {
      id: 2,
      name: 'Admin User',
      email: 'admin@company.com',
      avatar: 'AU',
      department: 'Management',
      attendance: 96,
      productivity: 92,
      tasksCompleted: 45,
      totalTasks: 48,
      avgHours: 8.3,
      lateCount: 2,
      score: 94.2
    },
    {
      id: 3,
      name: 'Rahul Kumar',
      email: 'rahul@company.com',
      avatar: 'RK',
      department: 'Engineering',
      attendance: 92,
      productivity: 87,
      tasksCompleted: 42,
      totalTasks: 50,
      avgHours: 7.8,
      lateCount: 4,
      score: 89.7
    }
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      
      {/* Main Content */}
      <div className="flex-1 ">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="ml-12 lg:ml-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  Employee Performance
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                  Track and analyze team performance metrics
                </p>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-3">
                <button className="p-2 sm:p-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                  <BiRefresh className="w-5 h-5 text-slate-600" />
                </button>
                <button className="px-4 py-2 sm:py-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2">
                  <BiDownload className="w-5 h-5 text-slate-600" />
                  <span className="text-sm font-medium text-slate-700 hidden sm:inline">Export</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 py-6">
          {/* Filters */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Time Period
                </label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                >
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                  <option value="year">This Year</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Department
                </label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                >
                  <option value="all">All Departments</option>
                  <option value="engineering">Engineering</option>
                  <option value="management">Management</option>
                  <option value="sales">Sales</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  View Mode
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('overview')}
                    className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      viewMode === 'overview'
                        ? 'bg-teal-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setViewMode('detailed')}
                    className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      viewMode === 'detailed'
                        ? 'bg-teal-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Detailed
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <IoCheckmarkCircle className="w-6 h-6 text-blue-600" />
                </div>
                {performanceStats.trends.attendance > 0 ? (
                  <span className="flex items-center text-sm font-medium text-green-600">
                    <IoTrendingUp className="w-4 h-4 mr-1" />
                    {performanceStats.trends.attendance}%
                  </span>
                ) : (
                  <span className="flex items-center text-sm font-medium text-red-600">
                    <IoTrendingDown className="w-4 h-4 mr-1" />
                    {Math.abs(performanceStats.trends.attendance)}%
                  </span>
                )}
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-1">
                {performanceStats.overall.attendance}%
              </h3>
              <p className="text-sm text-slate-600">Avg Attendance</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <IoTrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                {performanceStats.trends.productivity > 0 ? (
                  <span className="flex items-center text-sm font-medium text-green-600">
                    <IoTrendingUp className="w-4 h-4 mr-1" />
                    {performanceStats.trends.productivity}%
                  </span>
                ) : (
                  <span className="flex items-center text-sm font-medium text-red-600">
                    <IoTrendingDown className="w-4 h-4 mr-1" />
                    {Math.abs(performanceStats.trends.productivity)}%
                  </span>
                )}
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-1">
                {performanceStats.overall.productivity}%
              </h3>
              <p className="text-sm text-slate-600">Productivity Score</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <IoDocumentTextOutline className="w-6 h-6 text-green-600" />
                </div>
                {performanceStats.trends.taskCompletion > 0 ? (
                  <span className="flex items-center text-sm font-medium text-green-600">
                    <IoTrendingUp className="w-4 h-4 mr-1" />
                    {performanceStats.trends.taskCompletion}%
                  </span>
                ) : (
                  <span className="flex items-center text-sm font-medium text-red-600">
                    <IoTrendingDown className="w-4 h-4 mr-1" />
                    {Math.abs(performanceStats.trends.taskCompletion)}%
                  </span>
                )}
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-1">
                {performanceStats.overall.taskCompletion}%
              </h3>
              <p className="text-sm text-slate-600">Task Completion</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <IoTimeOutline className="w-6 h-6 text-orange-600" />
                </div>
                {performanceStats.trends.avgWorkHours > 0 ? (
                  <span className="flex items-center text-sm font-medium text-green-600">
                    <IoTrendingUp className="w-4 h-4 mr-1" />
                    {performanceStats.trends.avgWorkHours}h
                  </span>
                ) : (
                  <span className="flex items-center text-sm font-medium text-red-600">
                    <IoTrendingDown className="w-4 h-4 mr-1" />
                    {Math.abs(performanceStats.trends.avgWorkHours)}h
                  </span>
                )}
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-1">
                {performanceStats.overall.avgWorkHours}h
              </h3>
              <p className="text-sm text-slate-600">Avg Work Hours</p>
            </div>
          </div>

          {/* Top Performers */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900">Top Performers</h2>
              <IoStarOutline className="w-6 h-6 text-yellow-500" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topPerformers.map((performer, index) => (
                <div
                  key={performer.id}
                  className="border-2 border-slate-200 rounded-xl p-4 hover:border-teal-500 transition-colors relative"
                >
                  {index === 0 && (
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-sm">🏆</span>
                    </div>
                  )}
                  
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {performer.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 truncate">
                        {performer.name}
                      </h3>
                      <p className="text-xs text-slate-600 truncate">{performer.email}</p>
                      <p className="text-xs text-teal-600 font-medium mt-1">
                        {performer.department}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-bold text-slate-900">
                      {performer.score}
                    </span>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      performer.trend === 'up' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {performer.trend === 'up' ? '↑' : '↓'} Trending
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Attendance</span>
                      <span className="font-medium text-slate-900">{performer.attendance}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Productivity</span>
                      <span className="font-medium text-slate-900">{performer.productivity}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Tasks Done</span>
                      <span className="font-medium text-slate-900">{performer.tasks}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Employee Performance Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">All Employees</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Attendance
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Productivity
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Tasks
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Avg Hours
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Late Count
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Score
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {employees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                            {employee.avatar}
                          </div>
                          <div>
                            <div className="font-medium text-slate-900">{employee.name}</div>
                            <div className="text-sm text-slate-600">{employee.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-medium">
                          {employee.department}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex flex-col items-center">
                          <span className="font-semibold text-slate-900">{employee.attendance}%</span>
                          <div className="w-16 h-1.5 bg-slate-200 rounded-full mt-1">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${employee.attendance}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex flex-col items-center">
                          <span className="font-semibold text-slate-900">{employee.productivity}%</span>
                          <div className="w-16 h-1.5 bg-slate-200 rounded-full mt-1">
                            <div
                              className="h-full bg-purple-500 rounded-full"
                              style={{ width: `${employee.productivity}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="font-medium text-slate-900">
                          {employee.tasksCompleted}/{employee.totalTasks}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="font-medium text-slate-900">{employee.avgHours}h</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          employee.lateCount === 0
                            ? 'bg-green-100 text-green-700'
                            : employee.lateCount <= 2
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {employee.lateCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-lg font-bold text-teal-600">
                          {employee.score}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}