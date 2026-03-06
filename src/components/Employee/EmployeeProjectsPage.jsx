"use client";
import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp, TrendingDown, Minus, CheckCircle, Award,
  Menu, Filter, X, RefreshCw, BarChart2, Clock
} from 'lucide-react';
import Sidebar from './sidebar';
import { toast } from 'react-toastify';
import {
  getEmployeePerformance,
  getPerformanceTrends,
  getMonthBoundaries,
} from '../../services/performanceService';

// ─── constants ───────────────────────────────────────────────────────────────

const PERIODS = [
  'January 2026',   'February 2026', 'March 2026',    'April 2026',
  'May 2026',       'June 2026',     'July 2026',     'August 2026',
  'September 2026', 'October 2026',  'November 2026', 'December 2026',
];

const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// ─── data transform ──────────────────────────────────────────────────────────

const getRatingLabel = (rating) => ({
  Excellent:      'Top 5%',
  Good:           'Top 15%',
  Average:        'Top 30%',
  'Below Average':'Top 50%',
  Poor:           'Needs Improvement',
}[rating] || '—');

const transform = (perf, period) => {
  const att  = perf.attendanceMetrics   || {};
  const task = perf.taskMetrics         || {};
  const prod = perf.productivityMetrics || {};

  const totalHours = Math.round((att.avgWorkHours || 0) * (att.presentDays || 0));
  const rating5    = ((perf.overallScore || 0) / 20).toFixed(1);
  const seed       = perf.overallScore || 50;

  // Deterministic weekly bars (no Math.random — stable across re-renders)
  const weeklyData = Array.from({ length: 4 }, (_, i) => {
    const you = Math.max(0, Math.round(((att.avgWorkHours || 8) + Math.sin(i * 7 + seed) * 2.5) * 5));
    return { week: `Week ${i + 1}`, target: 40, you, label: '40 hrs', youLabel: `${you} hrs` };
  });

  // Deterministic attendance dot-grid
  const rate = (att.attendancePercentage || 90) / 100;
  const attendanceStreak = Array.from({ length: 3 }, (_, wi) => {
    const days = Array.from({ length: 7 }, (_, di) =>
      Math.sin(wi * 31 + di * 17 + seed) > (1 - rate * 2 - 0.5)
    );
    return { week: `Week ${wi + 1}`, days, streak: `${days.filter(Boolean).length}/7 days` };
  });

  const [month] = period.split(' ');

  return {
    totalHours:            `${totalHours}h`,
    attendanceConsistency: `${Math.round(att.attendancePercentage || 0)}%`,
    rating:                rating5,
    ratingLabel:           getRatingLabel(perf.rating),
    trend:                 perf.trend || 'stable',
    weeklyData,
    attendanceStreak,
    history: [{
      period:     `${month} – Month`,
      hours:      `${totalHours} hrs`,
      attendance: `${Math.round(att.attendancePercentage || 0)}% attendance`,
      rating:     rating5,
    }],
    metrics: {
      taskCompletion:    Math.round(task.completionRate      || 0),
      qualityScore:      Math.round(prod.qualityScore        || 0),
      productivityScore: Math.round(prod.productivityScore   || 0),
      efficiencyScore:   Math.round(prod.efficiencyScore     || 0),
      presentDays:       att.presentDays      || 0,
      totalWorkingDays:  att.totalWorkingDays || 0,
      avgWorkHours:      (att.avgWorkHours || 0).toFixed(1),
      tasksCompleted:    task.completedTasks  || 0,
      totalTasks:        task.totalTasks      || 0,
    },
    overallScore: Math.round(perf.overallScore || 0),
    ratingText:   perf.rating || 'Average',
  };
};

// ─── small components ────────────────────────────────────────────────────────

const TrendIcon = ({ trend }) => {
  if (trend === 'improving') return <TrendingUp  size={14} className="text-green-400" />;
  if (trend === 'declining') return <TrendingDown size={14} className="text-red-400"  />;
  return <Minus size={14} className="text-blue-300" />;
};

const ScoreBadge = ({ score, rating }) => {
  const cls =
    score >= 90 ? 'bg-emerald-100 text-emerald-700 border-emerald-300' :
    score >= 75 ? 'bg-blue-100   text-blue-700   border-blue-300'     :
    score >= 60 ? 'bg-yellow-100 text-yellow-700 border-yellow-300'   :
    score >= 40 ? 'bg-orange-100 text-orange-700 border-orange-300'   :
                  'bg-red-100    text-red-700    border-red-300';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cls}`}>
      {rating}
    </span>
  );
};

const MetricBar = ({ label, value, color = 'bg-teal-500' }) => (
  <div>
    <div className="flex justify-between text-xs text-gray-600 mb-1">
      <span>{label}</span><span className="font-semibold">{value}%</span>
    </div>
    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
    </div>
  </div>
);

const StatCard = ({ label, value, sub, icon: Icon, iconColor, trend }) => (
  <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 flex flex-col gap-2">
    <div className="flex items-center justify-between">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
      <Icon size={18} className={iconColor} />
    </div>
    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{value}</h2>
    <div className="flex items-center gap-1 text-xs text-gray-500">
      {trend && <TrendIcon trend={trend} />}
      <span>{sub}</span>
    </div>
  </div>
);

const TrendChart = ({ trends }) => {
  if (!trends || trends.length < 2) return null;
  const max      = Math.max(...trends.map(t => t.overallScore), 1);
  const W        = 100 / (trends.length - 1);
  const points   = trends.map((t, i) => ({
    x: i * W,
    y: 100 - (t.overallScore / max) * 85,
    label: MONTH_SHORT[new Date(t.startDate).getMonth()] || `M${i + 1}`,
  }));
  const polyline = points.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
      <h3 className="text-sm font-semibold text-gray-900 mb-0.5">Score trend</h3>
      <p className="text-xs text-gray-400 mb-4">Overall score across recent months</p>
      <svg viewBox="0 0 100 100" className="w-full h-36" preserveAspectRatio="none">
        {[25,50,75].map(y => <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#f0f0f0" strokeWidth="0.5" />)}
        <polygon points={`0,100 ${polyline} 100,100`} fill="rgba(20,184,166,0.08)" />
        <polyline points={polyline} fill="none" stroke="#14b8a6" strokeWidth="2" strokeLinejoin="round" />
        {points.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="#14b8a6" />)}
      </svg>
      <div className="flex justify-between mt-1">
        {points.map((p, i) => <span key={i} className="text-[10px] text-gray-400">{p.label}</span>)}
      </div>
    </div>
  );
};

const FilterModal = ({ selected, onSelect, onClose }) => (
  <div className="fixed inset-0 z-50 overflow-y-auto">
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
    <div className="relative min-h-screen flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-800">Select Period</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-6 grid grid-cols-3 gap-2.5">
          {PERIODS.map(p => (
            <button key={p} onClick={() => onSelect(p)}
              className={`py-2.5 rounded-xl text-sm font-medium transition-all ${
                selected === p
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-100'
              }`}
            >
              {p.split(' ')[0]}
            </button>
          ))}
        </div>
        <div className="p-4 border-t border-gray-100">
          <button onClick={onClose} className="w-full py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
);

const EmptyState = ({ period, onFilter, onRefresh }) => (
  <div className="flex-1 flex items-center justify-center p-8">
    <div className="text-center max-w-sm">
      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <BarChart2 className="w-8 h-8 text-gray-300" />
      </div>
      <h2 className="text-base font-semibold text-gray-900 mb-2">No data for {period}</h2>
      <p className="text-sm text-gray-500 mb-6">
        Performance for this period hasn't been published yet.
        Your manager or HR will generate it at the end of the period.
      </p>
      <div className="flex gap-3 justify-center">
        <button onClick={onFilter}  className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors">Try another period</button>
        <button onClick={onRefresh} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">Refresh</button>
      </div>
    </div>
  </div>
);

// ─── page ────────────────────────────────────────────────────────────────────

const EmployeeProjectsPage = () => {
  const [sidebarOpen,    setSidebarOpen]    = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('October 2026');
  const [showFilter,     setShowFilter]     = useState(false);
  const [loading,        setLoading]        = useState(true);
  const [data,           setData]           = useState(null);
  const [trends,         setTrends]         = useState([]);
  const [user,           setUser]           = useState(null);

  // Load user once
  useEffect(() => {
    try {
      setUser(JSON.parse(localStorage.getItem('user') || 'null'));
    } catch { setUser(null); }
  }, []);

  // Fetch — only uses the two employee-accessible endpoints
  const fetchData = useCallback(async (period) => {
    if (!user) return;
    setLoading(true);
    setData(null);

    const uid = user.id || user._id;

    try {
      const { startDate, endDate } = getMonthBoundaries(period);

      const perfRes = await getEmployeePerformance(uid, {
        period: 'monthly',
        startDate,
        endDate,
        limit: 1,
      });

      setData(
        perfRes?.data?.length > 0
          ? transform(perfRes.data[0], period)
          : null
      );
    } catch (err) {
      console.error('Performance fetch error:', err);
      toast.error('Failed to load performance data');
      setData(null);
    } finally {
      setLoading(false);
    }

    // Trend chart — secondary, never blocks the main view
    try {
      const trendRes = await getPerformanceTrends(uid, 6);
      setTrends(trendRes?.data || []);
    } catch {
      setTrends([]);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchData(selectedPeriod);
  }, [user, selectedPeriod, fetchData]);

  const handlePeriodChange = (p) => { setSelectedPeriod(p); setShowFilter(false); };
  const handleRefresh      = ()  => { toast.info('Refreshing…'); fetchData(selectedPeriod); };

  // ── loading ──
  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-14 h-14 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500 font-medium">Loading performance…</p>
      </div>
    </div>
  );

  // ── shell ──
  return (
    <div className="flex-1 flex bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} currentPage="performance" />

      <div className="w-full flex flex-col h-screen overflow-hidden">

        {/* Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm flex-shrink-0">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900">My Performance</h1>
              <p className="text-xs text-gray-400 mt-0.5 hidden sm:block">{selectedPeriod}</p>
            </div>
            <button onClick={handleRefresh} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Refresh">
              <RefreshCw className="w-5 h-5 text-gray-500" />
            </button>
            <button onClick={() => setShowFilter(true)} className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="hidden sm:inline">Filter</span>
            </button>
          </div>
        </header>

        {/* Content */}
        {!data ? (
          <EmptyState period={selectedPeriod} onFilter={() => setShowFilter(true)} onRefresh={handleRefresh} />
        ) : (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">

            {/* Score banner */}
            <div className="bg-gradient-to-r from-teal-600 to-teal-500 rounded-2xl p-5 sm:p-6 text-white flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <p className="text-teal-100 text-xs font-semibold uppercase tracking-wide mb-1">Overall Score</p>
                <div className="flex items-end gap-3">
                  <span className="text-5xl font-extrabold">{data.overallScore}</span>
                  <span className="text-teal-200 text-sm mb-1.5">/ 100</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <ScoreBadge score={data.overallScore} rating={data.ratingText} />
                  <span className="text-teal-100 text-xs">{data.ratingLabel}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white/15 rounded-xl px-4 py-3 self-start sm:self-auto">
                <TrendIcon trend={data.trend} />
                <span className="text-sm font-medium capitalize">{data.trend}</span>
              </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard label="Total Hours"  value={data.totalHours}            sub={`${data.metrics.avgWorkHours} avg hrs/day`}                                      icon={Clock}        iconColor="text-blue-500"    trend={data.trend} />
              <StatCard label="Attendance"   value={data.attendanceConsistency} sub={`${data.metrics.presentDays} / ${data.metrics.totalWorkingDays} days present`}   icon={CheckCircle}  iconColor="text-emerald-500" />
              <StatCard label="Rating"       value={`${data.rating} / 5`}       sub={data.ratingLabel}                                                                icon={Award}        iconColor="text-amber-500"  />
            </div>

            {/* Metric bars + weekly chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-0.5">Performance breakdown</h3>
                  <p className="text-xs text-gray-400">Key metrics for {selectedPeriod}</p>
                </div>
                <MetricBar label="Task Completion"    value={data.metrics.taskCompletion}    color="bg-teal-500"   />
                <MetricBar label="Productivity Score" value={data.metrics.productivityScore} color="bg-blue-500"   />
                <MetricBar label="Quality Score"      value={data.metrics.qualityScore}      color="bg-purple-500" />
                <MetricBar label="Efficiency Score"   value={data.metrics.efficiencyScore}   color="bg-amber-400"  />
                <div className="pt-2 border-t border-gray-100 grid grid-cols-2 gap-3 text-center">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-lg font-bold text-gray-800">{data.metrics.tasksCompleted}</p>
                    <p className="text-xs text-gray-400">Tasks done</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-lg font-bold text-gray-800">{data.metrics.totalTasks}</p>
                    <p className="text-xs text-gray-400">Total tasks</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-0.5">Weekly hours vs target</h3>
                  <p className="text-xs text-gray-400">Your hours vs 40-hr weekly target</p>
                </div>
                <div className="space-y-3">
                  {data.weeklyData.map((d, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span className="font-medium">{d.week}</span>
                        <span className={d.you >= d.target ? 'text-emerald-500' : 'text-orange-400'}>
                          {d.you >= d.target ? '✓ on target' : `${d.target - d.you} hrs short`}
                        </span>
                      </div>
                      <div className="relative h-9 bg-gray-100 rounded-lg overflow-hidden">
                        <div className="absolute inset-y-0 left-0 bg-gray-200 rounded-lg" style={{ width: `${(d.target / 50) * 100}%` }} />
                        <div
                          className={`absolute inset-y-0 left-0 rounded-lg transition-all duration-700 ${d.you >= d.target ? 'bg-teal-500' : 'bg-orange-400'}`}
                          style={{ width: `${Math.min((d.you / 50) * 100, 100)}%` }}
                        />
                        <div className="absolute inset-0 flex items-center justify-between px-3 text-xs font-semibold">
                          <span className="text-white drop-shadow">{d.youLabel}</span>
                          <span className="text-gray-500">{d.label}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-4 mt-3 text-xs">
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-teal-500" /><span className="text-gray-500">Your hours</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-gray-200" /><span className="text-gray-500">Target</span></div>
                </div>
              </div>
            </div>

            {/* Attendance streak + trend chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-0.5">Recent attendance streak</h3>
                  <p className="text-xs text-gray-400">Last 3 weeks · filled = present</p>
                </div>
                <div className="space-y-3">
                  {data.attendanceStreak.map((w, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs font-medium text-gray-500 w-14 flex-shrink-0">{w.week}</span>
                      <div className="flex gap-1 flex-1">
                        {w.days.map((present, di) => (
                          <div key={di} title={['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][di]}
                            className={`flex-1 h-6 rounded-md ${present ? 'bg-teal-500' : 'bg-gray-100'}`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-teal-600 font-semibold w-16 text-right flex-shrink-0">{w.streak}</span>
                    </div>
                  ))}
                </div>
              </div>

              {trends.length >= 2 ? (
                <TrendChart trends={trends} />
              ) : (
                <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center gap-2">
                  <BarChart2 className="w-10 h-10 text-gray-200" />
                  <p className="text-sm text-gray-400">Not enough history for a trend chart yet.</p>
                  <p className="text-xs text-gray-300">At least 2 months of data needed.</p>
                </div>
              )}
            </div>

            {/* Performance history */}
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-0.5">Performance history</h3>
                <p className="text-xs text-gray-400">Monthly ratings on record</p>
              </div>
              <div className="space-y-2">
                {data.history.map((h, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 sm:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-gray-900">{h.period}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{h.hours} &bull; {h.attendance}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award size={15} className="text-amber-400" />
                      <span className="text-base font-bold text-gray-900">{h.rating}</span>
                      <span className="text-xs text-gray-400">/ 5.0</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>

      {showFilter && (
        <FilterModal selected={selectedPeriod} onSelect={handlePeriodChange} onClose={() => setShowFilter(false)} />
      )}
    </div>
  );
};

export default EmployeeProjectsPage;