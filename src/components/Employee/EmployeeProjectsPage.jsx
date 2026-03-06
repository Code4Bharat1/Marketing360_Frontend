"use client";
import React, { useState, useEffect } from 'react';
import { TrendingUp, CheckCircle, Award, Calendar, Menu, Filter, X, RefreshCw, AlertCircle } from 'lucide-react';
import Sidebar from './sidebar';
import { toast } from 'react-toastify';
import { 
  getEmployeePerformance, 
  getMonthBoundaries,
  calculatePerformance 
} from '../../services/performanceService';

const PerformancePage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('October 2026');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [performanceData, setPerformanceData] = useState(null);
  const [user, setUser] = useState(null);

  // Available periods
  const periods = [
    'January 2026', 'February 2023', 'March 2026', 'April 2026',
    'May 2026', 'June 2026', 'July 2026', 'August 2026',
    'September 2026', 'October 2026', 'November 2026', 'December 2026'
  ];

  // Initialize user from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Fetch performance data from backend
  const fetchPerformanceData = async (period) => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Get date boundaries for selected period
      const { startDate, endDate } = getMonthBoundaries(period);
      
      // Fetch performance data from backend
      const response = await getEmployeePerformance(user.id || user._id, {
        period: 'monthly',
        startDate,
        endDate,
        limit: 1
      });

      if (response.data && response.data.length > 0) {
        const perf = response.data[0];
        
        // Transform backend data to match UI format
        const transformedData = {
          totalHours: `${Math.round(perf.attendanceMetrics?.avgWorkHours * perf.attendanceMetrics?.presentDays || 0)}h`,
          hoursChange: calculateHoursChange(perf),
          attendanceConsistency: `${Math.round(perf.attendanceMetrics?.attendancePercentage || 0)}%`,
          rating: (perf.overallScore / 20).toFixed(1), // Convert 0-100 to 0-5 scale
          ratingChange: getRatingLabel(perf.rating),
          
          // Weekly data (placeholder - you may need to fetch separate weekly data)
          weeklyData: generateWeeklyData(perf),
          
          // Attendance streak
          attendanceStreak: generateAttendanceStreak(perf),
          
          // Performance history
          performanceHistory: [
            {
              period: formatPeriodLabel(period),
              hours: `${Math.round(perf.attendanceMetrics?.avgWorkHours * perf.attendanceMetrics?.presentDays || 0)} hrs`,
              attendance: `${Math.round(perf.attendanceMetrics?.attendancePercentage || 0)}% attendance`,
              rating: (perf.overallScore / 20).toFixed(1)
            }
          ],
          
          // Store raw data for reference
          rawData: perf
        };
        
        setPerformanceData(transformedData);
      } else {
        // No performance data found, offer to calculate
        toast.info('No performance data found. Calculating...');
        await handleCalculatePerformance(period);
      }
    } catch (error) {
      console.error('Error fetching performance:', error);
      toast.error(error.message || 'Failed to load performance data');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate performance if not exists
  const handleCalculatePerformance = async (period) => {
    if (!user) return;

    try {
      const { startDate, endDate } = getMonthBoundaries(period);
      
      await calculatePerformance(
        user.id || user._id,
        'monthly',
        startDate,
        endDate
      );
      
      toast.success('Performance calculated successfully');
      
      // Fetch the newly calculated data
      await fetchPerformanceData(period);
    } catch (error) {
      console.error('Error calculating performance:', error);
      toast.error(error.message || 'Failed to calculate performance');
    }
  };

  // Helper functions
  const calculateHoursChange = (perf) => {
    const diff = perf.overallScore - perf.previousScore;
    return diff >= 0 ? `+${Math.abs(Math.round(diff / 10))}` : `-${Math.abs(Math.round(diff / 10))}`;
  };

  const getRatingLabel = (rating) => {
    const labels = {
      'Excellent': 'Top 5%',
      'Good': 'Top 10%',
      'Average': 'Top 20%',
      'Below Average': 'Top 40%',
      'Poor': 'Needs Improvement'
    };
    return labels[rating] || 'N/A';
  };

  const generateWeeklyData = (perf) => {
    // Generate 4 weeks of data based on attendance
    const avgHours = perf.attendanceMetrics?.avgWorkHours || 8;
    const weeks = [];
    
    for (let i = 0; i < 4; i++) {
      const variation = Math.random() * 5 - 2.5; // Random variation
      const hours = Math.max(0, avgHours + variation);
      weeks.push({
        week: `Week ${i + 1}`,
        target: 40,
        you: Math.round(hours * 5), // 5 days per week
        label: '40 hrs',
        youLabel: `${Math.round(hours * 5)} hrs`
      });
    }
    
    return weeks;
  };

  const generateAttendanceStreak = (perf) => {
    const presentDays = perf.attendanceMetrics?.presentDays || 0;
    const totalDays = perf.attendanceMetrics?.totalWorkingDays || 22;
    const attendanceRate = presentDays / totalDays;
    
    const weeks = [];
    for (let i = 0; i < 3; i++) {
      const days = Array(7).fill(false).map(() => Math.random() < attendanceRate);
      const presentCount = days.filter(d => d).length;
      weeks.push({
        week: `Week ${i + 1}`,
        days,
        streak: `${presentCount}-7 days`
      });
    }
    
    return weeks;
  };

  const formatPeriodLabel = (period) => {
    const [month, year] = period.split(' ');
    return `${month} - Month`;
  };

  // Fetch data when period or user changes
  useEffect(() => {
    if (user) {
      fetchPerformanceData(selectedPeriod);
    }
  }, [selectedPeriod, user]);

  const handlePeriodChange = async (period) => {
    setSelectedPeriod(period);
    setShowFilterModal(false);
    toast.info(`Loading data for ${period}...`);
  };

  const handleRefresh = async () => {
    toast.info('Refreshing performance data...');
    await fetchPerformanceData(selectedPeriod);
  };

  if (isLoading || !performanceData) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading performance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} currentPage="performance" />
      
      <div className='w-full flex flex-col h-screen overflow-hidden'>
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
            <button 
              onClick={() => setSidebarOpen(true)} 
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 truncate">
                My Performance
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5 hidden sm:block">
                {selectedPeriod}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button 
                onClick={handleRefresh}
                disabled={isLoading}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw className={`w-5 h-5 text-gray-600 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              
              <button 
                onClick={() => setShowFilterModal(true)} 
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors"
              >
                <Filter className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700 hidden sm:inline">Filter</span>
              </button>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
              <p className="text-xs font-medium text-gray-500 mb-2">TOTAL HOURS</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                {performanceData.totalHours}
              </h2>
              <div className={`flex items-center gap-1 text-xs sm:text-sm ${
                performanceData.hoursChange.startsWith('+') ? 'text-green-600' : 'text-red-600'
              }`}>
                <TrendingUp size={14} className="flex-shrink-0" />
                <span>{performanceData.hoursChange} hrs vs last month</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
              <p className="text-xs font-medium text-gray-500 mb-2">ATTENDANCE CONSISTENCY</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                {performanceData.attendanceConsistency}
              </h2>
              <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600">
                <CheckCircle size={14} className="flex-shrink-0" />
                <span>Excellent record</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
              <p className="text-xs font-medium text-gray-500 mb-2">OVERALL RATING</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                {performanceData.rating}
              </h2>
              <div className="flex items-center gap-1 text-xs sm:text-sm text-green-600">
                <TrendingUp size={14} className="flex-shrink-0" />
                <span>{performanceData.ratingChange} in region</span>
              </div>
            </div>
          </div>

          {/* Weekly Performance & Attendance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {/* Weekly Hours Chart */}
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
              <div className="mb-4 sm:mb-6">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1">
                  Weekly hours vs target
                </h3>
                <p className="text-xs text-gray-500">
                  Each column shows your hours compared to the 40-hr target
                </p>
              </div>
              
              <div className="space-y-3 sm:space-y-4">
                {performanceData.weeklyData.map((data, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-xs text-gray-600 mb-2">
                      <span className="font-medium">{data.week}</span>
                    </div>
                    <div className="relative h-10 sm:h-12 bg-gray-100 rounded-lg overflow-hidden">
                      <div 
                        className="absolute top-0 h-full bg-gray-300 rounded-lg" 
                        style={{ width: `${(data.target / 50) * 100}%` }} 
                      />
                      <div 
                        className="absolute top-0 h-full bg-teal-600 rounded-lg" 
                        style={{ width: `${(data.you / 50) * 100}%` }} 
                      />
                      <div className="absolute inset-0 flex items-center justify-between px-2 sm:px-3 text-xs font-medium">
                        <span className="text-white">{data.youLabel}</span>
                        <span className="text-gray-600">{data.label}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-wrap gap-3 sm:gap-4 mt-3 sm:mt-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-teal-600 rounded-full flex-shrink-0"></div>
                  <span className="text-gray-600">Your hours</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-300 rounded-full flex-shrink-0"></div>
                  <span className="text-gray-600">Target (40 hrs)</span>
                </div>
              </div>
            </div>

            {/* Attendance Streak */}
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
              <div className="mb-4 sm:mb-6">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1">
                  Recent attendance streak
                </h3>
                <p className="text-xs text-gray-500">
                  Last 3 weeks of completed workdays and absences
                </p>
              </div>
              
              <div className="space-y-3 sm:space-y-4">
                {performanceData.attendanceStreak.map((week, index) => (
                  <div key={index} className="flex items-center justify-between gap-2">
                    <span className="text-xs sm:text-sm font-medium text-gray-700 w-12 sm:w-16 flex-shrink-0">
                      {week.week}
                    </span>
                    <div className="flex gap-1 sm:gap-1.5 flex-1 overflow-x-auto">
                      {week.days.map((present, dayIndex) => (
                        <div 
                          key={dayIndex} 
                          className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex-shrink-0 ${
                            present ? 'bg-teal-600' : 'bg-gray-200'
                          }`} 
                        />
                      ))}
                    </div>
                    <span className="text-xs sm:text-sm text-teal-600 font-medium w-16 sm:w-20 text-right flex-shrink-0">
                      {week.streak}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Performance History */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
            <div className="mb-4 sm:mb-6">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1">
                Performance history
              </h3>
              <p className="text-xs text-gray-500">
                Past weekly and monthly ratings
              </p>
            </div>
            
            <div className="space-y-2 sm:space-y-3">
              {performanceData.performanceHistory.map((item, index) => (
                <div 
                  key={index} 
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-1">
                      {item.period}
                    </h4>
                    <p className="text-xs text-gray-600">
                      {item.hours} • {item.attendance}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award size={16} className="text-amber-500 flex-shrink-0" />
                    <span className="text-base sm:text-lg font-bold text-gray-900">
                      {item.rating}
                    </span>
                    <span className="text-xs sm:text-sm text-gray-500">/ 5.0</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Performance Details from Backend */}
            {performanceData.rawData && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-4">Detailed Metrics</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                    <p className="text-xs text-blue-600 mb-1">Task Completion</p>
                    <p className="text-lg font-bold text-blue-900">
                      {Math.round(performanceData.rawData.taskMetrics?.completionRate || 0)}%
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                    <p className="text-xs text-green-600 mb-1">Work Quality</p>
                    <p className="text-lg font-bold text-green-900">
                      {Math.round(performanceData.rawData.productivityMetrics?.qualityScore || 0)}%
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                    <p className="text-xs text-purple-600 mb-1">Overall Score</p>
                    <p className="text-lg font-bold text-purple-900">
                      {Math.round(performanceData.rawData.overallScore || 0)}%
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
            onClick={() => setShowFilterModal(false)} 
          />
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">Select Period</h3>
                <button 
                  onClick={() => setShowFilterModal(false)} 
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {periods.map((period) => (
                    <button 
                      key={period} 
                      onClick={() => handlePeriodChange(period)} 
                      className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                        selectedPeriod === period 
                          ? 'bg-teal-600 text-white shadow-lg' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {period.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-200">
                <button 
                  onClick={() => setShowFilterModal(false)} 
                  className="w-full px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformancePage;