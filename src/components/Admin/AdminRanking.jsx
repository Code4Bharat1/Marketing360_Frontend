'use client';

import { useState } from 'react';
import {
    IoTrophy,
    IoMedal,
    IoRibbon,
    IoChevronUp,
    IoChevronDown,
    IoRemoveOutline
} from 'react-icons/io5';
import { BiDownload, BiRefresh } from 'react-icons/bi';
import AdminSidebar from './Admimsidebar';

export default function RankingPage() {
    const [selectedPeriod, setSelectedPeriod] = useState('month');
    const [selectedMetric, setSelectedMetric] = useState('overall');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [activeNav, setActiveNav] = useState('rankings');

    const rankings = [
        {
            rank: 1,
            prevRank: 2,
            name: 'Sneha Reddy',
            email: 'sneha@company.com',
            avatar: 'SR',
            department: 'Engineering',
            overallScore: 96.5,
            attendance: 98,
            productivity: 95,
            tasks: 48,
            quality: 97,
            punctuality: 96
        },
        {
            rank: 2,
            prevRank: 1,
            name: 'Admin User',
            email: 'admin@company.com',
            avatar: 'AU',
            department: 'Management',
            overallScore: 94.2,
            attendance: 96,
            productivity: 92,
            tasks: 45,
            quality: 94,
            punctuality: 95
        },
        {
            rank: 3,
            prevRank: 3,
            name: 'Rahul Kumar',
            email: 'rahul@company.com',
            avatar: 'RK',
            department: 'Engineering',
            overallScore: 89.7,
            attendance: 92,
            productivity: 87,
            tasks: 42,
            quality: 90,
            punctuality: 89
        },
        {
            rank: 4,
            prevRank: 5,
            name: 'Priya Sharma',
            email: 'priya@company.com',
            avatar: 'PS',
            department: 'Sales',
            overallScore: 87.3,
            attendance: 90,
            productivity: 85,
            tasks: 40,
            quality: 88,
            punctuality: 86
        },
        {
            rank: 5,
            prevRank: 4,
            name: 'Amit Patel',
            email: 'amit@company.com',
            avatar: 'AP',
            department: 'Engineering',
            overallScore: 85.8,
            attendance: 88,
            productivity: 83,
            tasks: 38,
            quality: 86,
            punctuality: 87
        },
        {
            rank: 6,
            prevRank: 6,
            name: 'Neha Singh',
            email: 'neha@company.com',
            avatar: 'NS',
            department: 'Sales',
            overallScore: 83.5,
            attendance: 86,
            productivity: 81,
            tasks: 36,
            quality: 84,
            punctuality: 83
        },
        {
            rank: 7,
            prevRank: 8,
            name: 'Vikram Malhotra',
            email: 'vikram@company.com',
            avatar: 'VM',
            department: 'Engineering',
            overallScore: 81.2,
            attendance: 84,
            productivity: 79,
            tasks: 34,
            quality: 82,
            punctuality: 80
        },
        {
            rank: 8,
            prevRank: 7,
            name: 'Pooja Nair',
            email: 'pooja@company.com',
            avatar: 'PN',
            department: 'Sales',
            overallScore: 79.8,
            attendance: 82,
            productivity: 77,
            tasks: 32,
            quality: 80,
            punctuality: 79
        }
    ];

    const getRankChange = (current, previous) => {
        if (current < previous) return 'up';
        if (current > previous) return 'down';
        return 'same';
    };

    const getRankBadge = (rank, size = 'default') => {
        const sizes = {
            small: { container: 'w-8 h-8 sm:w-10 sm:h-10', icon: 'w-4 h-4 sm:w-5 sm:h-5', text: 'text-xs sm:text-sm' },
            default: { container: 'w-10 h-10 sm:w-12 sm:h-12', icon: 'w-5 h-5 sm:w-6 sm:h-6', text: 'text-sm sm:text-base' },
            medium: { container: 'w-12 h-12 sm:w-14 sm:h-14', icon: 'w-6 h-6 sm:w-7 sm:h-7', text: 'text-base sm:text-lg' },
            large: { container: 'w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20', icon: 'w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10', text: 'text-lg sm:text-xl md:text-2xl' }
        };

        const s = sizes[size];

        if (rank === 1) {
            return (
                <div className={`${s.container} bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg transition-all`}>
                    <IoTrophy className={`${s.icon} text-white`} />
                </div>
            );
        } else if (rank === 2) {
            return (
                <div className={`${s.container} bg-gradient-to-br from-slate-300 to-slate-500 rounded-full flex items-center justify-center shadow-lg transition-all`}>
                    <IoMedal className={`${s.icon} text-white`} />
                </div>
            );
        } else if (rank === 3) {
            return (
                <div className={`${s.container} bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-lg transition-all`}>
                    <IoRibbon className={`${s.icon} text-white`} />
                </div>
            );
        }
        return (
            <div className={`${s.container} bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-600 ${s.text} transition-all`}>
                #{rank}
            </div>
        );
    };

    return (
        <div className="flex min-h-screen bg-slate-50">
            <AdminSidebar
                activeNav={activeNav}
                onNavigate={setActiveNav}
                collapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(c => !c)}
            />

            {/* Main Content */}
            <div className={`flex-1 w-full transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-10' : 'lg:ml-0'}`}>
                {/* Header */}
                <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                    <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-2.5 sm:py-3 md:py-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 md:gap-4">
                            <div className="pl-12 sm:pl-0">
                                <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 leading-tight">
                                    Employee Rankings
                                </h1>
                                <p className="text-[10px] sm:text-xs md:text-sm text-slate-600 mt-0.5">
                                    Leaderboard based on performance metrics
                                </p>
                            </div>

                            <div className="flex items-center gap-1.5 sm:gap-2">
                                <button 
                                    className="p-1.5 sm:p-2 border border-slate-200 rounded-lg hover:bg-slate-50 active:bg-slate-100 transition-colors"
                                    aria-label="Refresh rankings"
                                >
                                    <BiRefresh className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                                </button>
                                <button className="px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 border border-slate-200 rounded-lg hover:bg-slate-50 active:bg-slate-100 transition-colors flex items-center gap-1.5 sm:gap-2">
                                    <BiDownload className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                                    <span className="text-[11px] sm:text-xs md:text-sm font-medium text-slate-700 hidden xs:inline">Export</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-2 sm:px-3 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6 max-w-[1600px] mx-auto">
                    {/* Filters */}
                    <div className="bg-white rounded-lg sm:rounded-xl border border-slate-200 p-2.5 sm:p-3 md:p-4 mb-3 sm:mb-4 md:mb-6 shadow-sm">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 md:gap-4">
                            <div>
                                <label className="block text-[11px] sm:text-xs md:text-sm font-medium text-slate-700 mb-1 sm:mb-1.5 md:mb-2">
                                    Time Period
                                </label>
                                <select
                                    value={selectedPeriod}
                                    onChange={(e) => setSelectedPeriod(e.target.value)}
                                    className="w-full px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-[11px] sm:text-xs md:text-sm transition-all"
                                >
                                    <option value="week">This Week</option>
                                    <option value="month">This Month</option>
                                    <option value="quarter">This Quarter</option>
                                    <option value="year">This Year</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[11px] sm:text-xs md:text-sm font-medium text-slate-700 mb-1 sm:mb-1.5 md:mb-2">
                                    Ranking Metric
                                </label>
                                <select
                                    value={selectedMetric}
                                    onChange={(e) => setSelectedMetric(e.target.value)}
                                    className="w-full px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-[11px] sm:text-xs md:text-sm transition-all"
                                >
                                    <option value="overall">Overall Score</option>
                                    <option value="attendance">Attendance</option>
                                    <option value="productivity">Productivity</option>
                                    <option value="tasks">Task Completion</option>
                                    <option value="quality">Work Quality</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Top 3 Podium */}
                    <div className="bg-gradient-to-br from-teal-600 to-teal-800 rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 lg:p-8 mb-3 sm:mb-4 md:mb-6 overflow-hidden relative shadow-xl">
                        <div className="absolute top-0 right-0 w-32 h-32 sm:w-40 sm:h-40 md:w-64 md:h-64 bg-white/5 rounded-full -mr-16 sm:-mr-20 md:-mr-32 -mt-16 sm:-mt-20 md:-mt-32" />
                        <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48 bg-white/5 rounded-full -ml-12 sm:-ml-16 md:-ml-24 -mb-12 sm:-mb-16 md:-mb-24" />

                        <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-white mb-3 sm:mb-4 md:mb-6 lg:mb-8 relative z-10 flex items-center gap-2">
                            <span className="text-lg sm:text-xl md:text-2xl">🏆</span>
                            <span>Top Performers</span>
                        </h2>

                        {/* Mobile View - Vertical Stack */}
                        <div className="md:hidden space-y-2.5 sm:space-y-3 relative z-10">
                            {rankings.slice(0, 3).map((performer, index) => (
                                <div
                                    key={performer.rank}
                                    className={`${index === 0
                                        ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 border-2 border-yellow-300 shadow-lg'
                                        : 'bg-white/10 backdrop-blur-sm border border-white/20'
                                        } rounded-lg sm:rounded-xl p-3 sm:p-4 transition-all hover:scale-[1.02] active:scale-[0.98]`}
                                >
                                    <div className="flex items-center gap-2.5 sm:gap-3 md:gap-4">
                                        <div className="flex-shrink-0">
                                            {getRankBadge(performer.rank, 'medium')}
                                        </div>
                                        <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center ${index === 0 ? 'text-yellow-600' : 'text-teal-600'} font-bold text-base sm:text-lg shadow-md flex-shrink-0`}>
                                            {performer.avatar}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm sm:text-base font-bold text-white truncate">
                                                {performer.name}
                                            </h3>
                                            <p className={`text-[10px] sm:text-xs ${index === 0 ? 'text-yellow-100' : 'text-teal-100'} truncate`}>
                                                {performer.department}
                                            </p>
                                        </div>
                                        <div className="text-xl sm:text-2xl font-bold text-white flex-shrink-0">
                                            {performer.overallScore}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop/Tablet View - Grid */}
                        <div className="hidden md:grid md:grid-cols-3 gap-3 md:gap-4 lg:gap-6 relative z-10">
                            {/* 2nd Place */}
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 md:p-4 lg:p-6 border border-white/20 md:mt-6 lg:mt-12 transition-all hover:scale-105 hover:bg-white/15">
                                <div className="flex flex-col items-center">
                                    <div className="mb-2 md:mb-3 lg:mb-4">
                                        {getRankBadge(2, 'medium')}
                                    </div>
                                    <div className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-white rounded-full flex items-center justify-center text-teal-600 font-bold text-base md:text-lg lg:text-xl mb-2 md:mb-2 lg:mb-3 shadow-md">
                                        {rankings[1].avatar}
                                    </div>
                                    <h3 className="text-sm md:text-base lg:text-lg font-bold text-white text-center mb-0.5 md:mb-1">
                                        {rankings[1].name}
                                    </h3>
                                    <p className="text-[10px] md:text-xs lg:text-sm text-teal-100 mb-2 md:mb-3 lg:mb-4">{rankings[1].department}</p>
                                    <div className="text-xl md:text-2xl lg:text-3xl font-bold text-white">
                                        {rankings[1].overallScore}
                                    </div>
                                </div>
                            </div>

                            {/* 1st Place */}
                            <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl p-3 md:p-4 lg:p-6 border-2 md:border-4 border-yellow-300 shadow-2xl transition-all hover:scale-105 relative">
                                <div className="absolute -top-2 -right-2 md:-top-3 md:-right-3 w-8 h-8 md:w-10 md:h-10 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                                    <span className="text-sm md:text-base">👑</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <div className="mb-2 md:mb-3 lg:mb-4">
                                        {getRankBadge(1, 'large')}
                                    </div>
                                    <div className="w-14 h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 bg-white rounded-full flex items-center justify-center text-yellow-600 font-bold text-lg md:text-xl lg:text-2xl mb-2 md:mb-2 lg:mb-3 shadow-lg">
                                        {rankings[0].avatar}
                                    </div>
                                    <h3 className="text-base md:text-lg lg:text-xl font-bold text-white text-center mb-0.5 md:mb-1">
                                        {rankings[0].name}
                                    </h3>
                                    <p className="text-[10px] md:text-xs lg:text-sm text-yellow-100 mb-2 md:mb-3 lg:mb-4">{rankings[0].department}</p>
                                    <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">
                                        {rankings[0].overallScore}
                                    </div>
                                </div>
                            </div>

                            {/* 3rd Place */}
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 md:p-4 lg:p-6 border border-white/20 md:mt-6 lg:mt-12 transition-all hover:scale-105 hover:bg-white/15">
                                <div className="flex flex-col items-center">
                                    <div className="mb-2 md:mb-3 lg:mb-4">
                                        {getRankBadge(3, 'medium')}
                                    </div>
                                    <div className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-white rounded-full flex items-center justify-center text-teal-600 font-bold text-base md:text-lg lg:text-xl mb-2 md:mb-2 lg:mb-3 shadow-md">
                                        {rankings[2].avatar}
                                    </div>
                                    <h3 className="text-sm md:text-base lg:text-lg font-bold text-white text-center mb-0.5 md:mb-1">
                                        {rankings[2].name}
                                    </h3>
                                    <p className="text-[10px] md:text-xs lg:text-sm text-teal-100 mb-2 md:mb-3 lg:mb-4">{rankings[2].department}</p>
                                    <div className="text-xl md:text-2xl lg:text-3xl font-bold text-white">
                                        {rankings[2].overallScore}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Complete Rankings Table */}
                    <div className="bg-white rounded-lg sm:rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className="px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 border-b border-slate-200 bg-slate-50">
                            <h2 className="text-sm sm:text-base md:text-lg font-bold text-slate-900">Complete Rankings</h2>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden divide-y divide-slate-200 max-h-[600px] overflow-y-auto">
                            {rankings.map((employee) => {
                                const change = getRankChange(employee.rank, employee.prevRank);
                                return (
                                    <div key={employee.rank} className="p-3 sm:p-4 hover:bg-slate-50 active:bg-slate-100 transition-colors">
                                        <div className="flex items-start gap-2 sm:gap-3 mb-2.5">
                                            <div className="flex-shrink-0">
                                                {getRankBadge(employee.rank, 'small')}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2 mb-2">
                                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                                        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-teal-600 rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm flex-shrink-0">
                                                            {employee.avatar}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="font-medium text-slate-900 text-xs sm:text-sm truncate">{employee.name}</div>
                                                            <div className="text-[10px] sm:text-xs text-slate-600 truncate">{employee.department}</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex-shrink-0">
                                                        {change === 'up' && (
                                                            <div className="flex items-center gap-0.5 text-green-600">
                                                                <IoChevronUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                                <span className="text-[10px] sm:text-xs font-medium">{employee.prevRank - employee.rank}</span>
                                                            </div>
                                                        )}
                                                        {change === 'down' && (
                                                            <div className="flex items-center gap-0.5 text-red-600">
                                                                <IoChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                                <span className="text-[10px] sm:text-xs font-medium">{employee.rank - employee.prevRank}</span>
                                                            </div>
                                                        )}
                                                        {change === 'same' && (
                                                            <IoRemoveOutline className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-4 gap-1.5 sm:gap-2 text-center">
                                                    <div className="bg-teal-50 rounded-lg py-1.5 sm:py-2">
                                                        <div className="text-base sm:text-lg font-bold text-teal-600">{employee.overallScore}</div>
                                                        <div className="text-[9px] sm:text-[10px] text-slate-500 font-medium">Overall</div>
                                                    </div>
                                                    <div className="bg-slate-50 rounded-lg py-1.5 sm:py-2">
                                                        <div className="text-xs sm:text-sm font-semibold text-slate-900">{employee.attendance}%</div>
                                                        <div className="text-[9px] sm:text-[10px] text-slate-500 font-medium">Attend</div>
                                                    </div>
                                                    <div className="bg-slate-50 rounded-lg py-1.5 sm:py-2">
                                                        <div className="text-xs sm:text-sm font-semibold text-slate-900">{employee.productivity}%</div>
                                                        <div className="text-[9px] sm:text-[10px] text-slate-500 font-medium">Product</div>
                                                    </div>
                                                    <div className="bg-slate-50 rounded-lg py-1.5 sm:py-2">
                                                        <div className="text-xs sm:text-sm font-semibold text-slate-900">{employee.quality}%</div>
                                                        <div className="text-[9px] sm:text-[10px] text-slate-500 font-medium">Quality</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-3 md:px-4 lg:px-6 py-2.5 md:py-3 text-left text-[10px] md:text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                            Rank
                                        </th>
                                        <th className="px-3 md:px-4 lg:px-6 py-2.5 md:py-3 text-left text-[10px] md:text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                            Employee
                                        </th>
                                        <th className="px-3 md:px-4 lg:px-6 py-2.5 md:py-3 text-center text-[10px] md:text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                            Overall
                                        </th>
                                        <th className="px-3 md:px-4 lg:px-6 py-2.5 md:py-3 text-center text-[10px] md:text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                            Attendance
                                        </th>
                                        <th className="px-3 md:px-4 lg:px-6 py-2.5 md:py-3 text-center text-[10px] md:text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                            Productivity
                                        </th>
                                        <th className="px-3 md:px-4 lg:px-6 py-2.5 md:py-3 text-center text-[10px] md:text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                            Quality
                                        </th>
                                        <th className="px-3 md:px-4 lg:px-6 py-2.5 md:py-3 text-center text-[10px] md:text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                            Change
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {rankings.map((employee) => {
                                        const change = getRankChange(employee.rank, employee.prevRank);
                                        return (
                                            <tr key={employee.rank} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-3 md:px-4 lg:px-6 py-2.5 md:py-3 lg:py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        {getRankBadge(employee.rank, 'small')}
                                                    </div>
                                                </td>
                                                <td className="px-3 md:px-4 lg:px-6 py-2.5 md:py-3 lg:py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2 md:gap-2.5 lg:gap-3">
                                                        <div className="w-8 h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 bg-teal-600 rounded-full flex items-center justify-center text-white font-semibold text-xs md:text-sm flex-shrink-0">
                                                            {employee.avatar}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="font-medium text-slate-900 text-xs md:text-sm truncate">{employee.name}</div>
                                                            <div className="text-[10px] md:text-xs text-slate-600 truncate">{employee.department}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-3 md:px-4 lg:px-6 py-2.5 md:py-3 lg:py-4 whitespace-nowrap text-center">
                                                    <span className="text-base md:text-lg lg:text-xl font-bold text-teal-600">
                                                        {employee.overallScore}
                                                    </span>
                                                </td>
                                                <td className="px-3 md:px-4 lg:px-6 py-2.5 md:py-3 lg:py-4 whitespace-nowrap text-center">
                                                    <span className="text-xs md:text-sm font-semibold text-slate-900">{employee.attendance}%</span>
                                                </td>
                                                <td className="px-3 md:px-4 lg:px-6 py-2.5 md:py-3 lg:py-4 whitespace-nowrap text-center">
                                                    <span className="text-xs md:text-sm font-semibold text-slate-900">{employee.productivity}%</span>
                                                </td>
                                                <td className="px-3 md:px-4 lg:px-6 py-2.5 md:py-3 lg:py-4 whitespace-nowrap text-center">
                                                    <span className="text-xs md:text-sm font-semibold text-slate-900">{employee.quality}%</span>
                                                </td>
                                                <td className="px-3 md:px-4 lg:px-6 py-2.5 md:py-3 lg:py-4 whitespace-nowrap text-center">
                                                    {change === 'up' && (
                                                        <div className="flex items-center justify-center gap-0.5 md:gap-1 text-green-600">
                                                            <IoChevronUp className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5" />
                                                            <span className="text-xs md:text-sm font-medium">{employee.prevRank - employee.rank}</span>
                                                        </div>
                                                    )}
                                                    {change === 'down' && (
                                                        <div className="flex items-center justify-center gap-0.5 md:gap-1 text-red-600">
                                                            <IoChevronDown className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5" />
                                                            <span className="text-xs md:text-sm font-medium">{employee.rank - employee.prevRank}</span>
                                                        </div>
                                                    )}
                                                    {change === 'same' && (
                                                        <div className="flex items-center justify-center text-slate-400">
                                                            <IoRemoveOutline className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5" />
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}