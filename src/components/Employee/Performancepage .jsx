"use client";
import React, { useState, useEffect } from 'react';
import { TrendingUp, CheckCircle, Award, Calendar, Menu, Filter, X } from 'lucide-react';
import Sidebar from './sidebar';
import { toast } from 'react-toastify';

const PerformancePage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('October 2024');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [performanceData, setPerformanceData] = useState(null);

  // Available periods
  const periods = [
    'January 2024', 'February 2024', 'March 2024', 'April 2024',
    'May 2024', 'June 2024', 'July 2024', 'August 2024',
    'September 2024', 'October 2024', 'November 2024', 'December 2024'
  ];

  // Mock backend data - simulating API response
  const mockBackendData = {
    'January 2024': {
      totalHours: '158h', hoursChange: '+5', attendanceConsistency: '95%', rating: 4.6, ratingChange: 'Top 12%',
      weeklyData: [
        { week: 'Jan 1-7', target: 40, you: 38, label: '40 hrs', youLabel: '38 hrs' },
        { week: 'Jan 8-14', target: 40, you: 42, label: '40 hrs', youLabel: '42 hrs' },
        { week: 'Jan 15-21', target: 40, you: 39, label: '40 hrs', youLabel: '39 hrs' },
        { week: 'Jan 22-28', target: 40, you: 39, label: '40 hrs', youLabel: '39 hrs' }
      ],
      attendanceStreak: [
        { week: 'Week 1', days: [true, true, true, true, true, true, false], streak: '6-7 days' },
        { week: 'Week 2', days: [true, true, true, true, true, true, true], streak: '7-7 days' },
        { week: 'Week 3', days: [true, true, true, true, true, false, false], streak: '5-7 days' }
      ],
      performanceHistory: [
        { period: 'January - Week 4', hours: '39 hrs', attendance: '95% attendance', rating: 4.7 },
        { period: 'January - Week 3', hours: '39 hrs', attendance: '95% attendance', rating: 4.6 },
        { period: 'January - Week 2', hours: '42 hrs', attendance: '100% attendance', rating: 4.8 }
      ]
    },
    'October 2024': {
      totalHours: '164h', hoursChange: '+4', attendanceConsistency: '98%', rating: 4.8, ratingChange: 'Top 10%',
      weeklyData: [
        { week: 'Sep 25-30', target: 27, you: 24, label: '27 hrs', youLabel: '24 hrs' },
        { week: 'Sep 30-Oct 6', target: 40, you: 38, label: '40 hrs', youLabel: '38 hrs' },
        { week: 'Oct 7-13', target: 42, you: 45, label: '42 hrs', youLabel: '45 hrs' },
        { week: 'Oct 14-20', target: 35, you: 37, label: '35 hrs', youLabel: '37 hrs' }
      ],
      attendanceStreak: [
        { week: 'Week 1', days: [true, true, true, true, true, true, false], streak: '7-7 days' },
        { week: 'Week 2', days: [true, true, true, true, true, false, false], streak: '6.5-7 days' },
        { week: 'Week 3', days: [true, true, true, true, false, false, false], streak: '6-7 days' }
      ],
      performanceHistory: [
        { period: 'October - Week 2', hours: '47.5 hrs', attendance: '100% attendance', rating: 4.9 },
        { period: 'October - Week 1', hours: '40 hrs', attendance: '95% attendance', rating: 4.8 },
        { period: 'September - Month', hours: '186 hrs', attendance: 'Consistent performance', rating: 4.5 }
      ]
    }
  };

  // Simulate fetching data from backend
  const fetchPerformanceData = async (period) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    const data = mockBackendData[period] || mockBackendData['October 2024'];
    setPerformanceData(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPerformanceData(selectedPeriod);
  }, []);

  const handlePeriodChange = async (period) => {
    setSelectedPeriod(period);
    setShowFilterModal(false);
    toast.info(`Loading data for ${period}...`);
    await fetchPerformanceData(period);
    toast.success(`Showing performance for ${period}`);
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
        <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 truncate">My Performance</h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5 hidden sm:block">{selectedPeriod}</p>
            </div>
            <button onClick={() => setShowFilterModal(true)} className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors flex-shrink-0">
              <Filter className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700 hidden sm:inline">Filter</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
              <p className="text-xs font-medium text-gray-500 mb-2">TOTAL HOURS</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{performanceData.totalHours}</h2>
              <div className={`flex items-center gap-1 text-xs sm:text-sm ${performanceData.hoursChange.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingUp size={14} className="flex-shrink-0" />
                <span>{performanceData.hoursChange} hrs vs last month</span>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
              <p className="text-xs font-medium text-gray-500 mb-2">ATTENDANCE CONSISTENCY</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{performanceData.attendanceConsistency}</h2>
              <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600">
                <CheckCircle size={14} className="flex-shrink-0" />
                <span>Excellent record</span>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
              <p className="text-xs font-medium text-gray-500 mb-2">OVERALL RATING</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{performanceData.rating}</h2>
              <div className="flex items-center gap-1 text-xs sm:text-sm text-green-600">
                <TrendingUp size={14} className="flex-shrink-0" />
                <span>{performanceData.ratingChange} in region</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
              <div className="mb-4 sm:mb-6">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1">Weekly hours vs target</h3>
                <p className="text-xs text-gray-500">Each column shows your hours compared to the 40-hr target</p>
              </div>
              <div className="space-y-3 sm:space-y-4">
                {performanceData.weeklyData.map((data, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-xs text-gray-600 mb-2">
                      <span className="font-medium">{data.week}</span>
                    </div>
                    <div className="relative h-10 sm:h-12 bg-gray-100 rounded-lg overflow-hidden">
                      <div className="absolute top-0 h-full bg-gray-300 rounded-lg" style={{ width: `${(data.target / 50) * 100}%` }} />
                      <div className="absolute top-0 h-full bg-teal-600 rounded-lg" style={{ width: `${(data.you / 50) * 100}%` }} />
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

            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
              <div className="mb-4 sm:mb-6">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1">Recent attendance streak</h3>
                <p className="text-xs text-gray-500">Last 3 weeks of completed workdays and absences</p>
              </div>
              <div className="space-y-3 sm:space-y-4">
                {performanceData.attendanceStreak.map((week, index) => (
                  <div key={index} className="flex items-center justify-between gap-2">
                    <span className="text-xs sm:text-sm font-medium text-gray-700 w-12 sm:w-16 flex-shrink-0">{week.week}</span>
                    <div className="flex gap-1 sm:gap-1.5 flex-1 overflow-x-auto">
                      {week.days.map((present, dayIndex) => (
                        <div key={dayIndex} className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex-shrink-0 ${present ? 'bg-teal-600' : 'bg-gray-200'}`} />
                      ))}
                    </div>
                    <span className="text-xs sm:text-sm text-teal-600 font-medium w-16 sm:w-20 text-right flex-shrink-0">{week.streak}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
            <div className="mb-4 sm:mb-6">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1">Performance history</h3>
              <p className="text-xs text-gray-500">Past weekly and monthly ratings (head-unit)</p>
            </div>
            <div className="space-y-2 sm:space-y-3">
              {performanceData.performanceHistory.map((item, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-1">{item.period}</h4>
                    <p className="text-xs text-gray-600">{item.hours} • {item.attendance}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award size={16} className="text-amber-500 flex-shrink-0" />
                    <span className="text-base sm:text-lg font-bold text-gray-900">{item.rating}</span>
                    <span className="text-xs sm:text-sm text-gray-500">/ 5.0</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          
        </div>
      </div>

      {showFilterModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowFilterModal(false)} />
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">Select Period</h3>
                <button onClick={() => setShowFilterModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {periods.map((period) => (
                    <button key={period} onClick={() => handlePeriodChange(period)} className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${selectedPeriod === period ? 'bg-teal-600 text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                      {period.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-6 border-t border-gray-200">
                <button onClick={() => setShowFilterModal(false)} className="w-full px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
};


export default PerformancePage;