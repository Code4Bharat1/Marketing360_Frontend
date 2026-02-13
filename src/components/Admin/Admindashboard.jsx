'use client';

import { useState } from 'react';
import {
    FiUsers, FiFileText, FiCheckCircle, FiXCircle, FiClock,
    FiTrendingUp, FiSun, FiMoon, FiCalendar, FiSearch,
    FiFilter, FiEye, FiCheck, FiX, FiChevronLeft, FiChevronRight,
    FiBell, FiSettings, FiLogOut, FiBarChart2, FiActivity,
    FiAlertCircle, FiDownload, FiRefreshCw, FiMenu
} from 'react-icons/fi';
import { BiPackage } from 'react-icons/bi';
import AdminSidebar from './Admimsidebar';

// ── Mock Data ──────────────────────────────────────────────────────────────────
const ALL_LOGS = [
    { id: 1, employee: 'Rahul Sharma', avatar: 'RS', dept: 'Engineering', date: 'Feb 13, 2025', project: 'E-commerce Platform Maintenance', status: 'pending', firstHalf: ['Fixed Amazon & Flipkart follow ups and pricing updates', 'Reconciled laptop inventory across all platforms', 'Updated product listings for festive offers'], secondHalf: ['Closed open service tickets for smartphone repairs', 'Coordinated with logistics team for pending deliveries', 'Prepared daily sales report and shared with management'], todoList: ['Follow up on pending customer queries', 'Update inventory spreadsheet for new arrivals', 'Schedule team meeting for next week planning'] },
    { id: 2, employee: 'Priya Patel', avatar: 'PP', dept: 'Design', date: 'Feb 13, 2025', project: 'Mobile App UI Revamp', status: 'approved', firstHalf: ['Completed wireframes for onboarding screens', 'Reviewed design system with senior designer', 'Updated color palette based on feedback'], secondHalf: ['Implemented new login screen components', 'Fixed responsive issues on dashboard', 'Prepared handoff document for developers'], todoList: ['Start on profile settings screen', 'Review developer feedback', 'Submit weekly status report'] },
    { id: 3, employee: 'Amit Kumar', avatar: 'AK', dept: 'Data', date: 'Feb 12, 2025', project: 'CRM Data Migration', status: 'rejected', firstHalf: ['Mapped legacy fields to new schema', 'Ran test migration on 500 records', 'Documented transformation rules'], secondHalf: ['Fixed 12 data inconsistency errors', 'Coordinated with DBA for index optimization', 'Sent migration progress report'], todoList: ['Re-run migration with fixed mappings', 'Validate migrated records with QA', 'Update runbook documentation'] },
    { id: 4, employee: 'Sneha Reddy', avatar: 'SR', dept: 'Engineering', date: 'Feb 12, 2025', project: 'Internal HR Portal', status: 'approved', firstHalf: ['Built leave request form with validation', 'Integrated with email notification service', 'Unit tested 3 new API endpoints'], secondHalf: ['Code review for team PR submissions', 'Updated API documentation', 'Demo to HR stakeholders'], todoList: ['Address HR feedback from demo', 'Fix pagination bug on leave history', 'Sync with backend team on permissions'] },
    { id: 5, employee: 'Vikram Singh', avatar: 'VS', dept: 'Operations', date: 'Feb 11, 2025', project: 'Warehouse Management System', status: 'pending', firstHalf: ['Audited inbound shipment records', 'Synced barcode scanner firmware', 'Generated weekly stock report'], secondHalf: ['Resolved discrepancy in rack B-12', 'Trained 2 staff on new scanning workflow', 'Updated SOP documentation'], todoList: ['Complete monthly audit checklist', 'Report damaged goods to procurement', 'Schedule maintenance for conveyor belt'] },
    { id: 6, employee: 'Meera Joshi', avatar: 'MJ', dept: 'Marketing', date: 'Feb 11, 2025', project: 'Festive Campaign Q4', status: 'approved', firstHalf: ['Drafted email campaign copy for Diwali', 'Coordinated with design team on banners', 'Updated landing page content'], secondHalf: ['Analyzed A/B test results', 'Sent campaign brief to media partners', 'Prepared ROI report for management'], todoList: ['Launch SMS campaign', 'Monitor campaign metrics', 'Prepare post-campaign analysis'] },
    { id: 7, employee: 'Karan Mehta', avatar: 'KM', dept: 'Engineering', date: 'Feb 10, 2025', project: 'Payment Gateway Integration', status: 'pending', firstHalf: ['Integrated Razorpay webhook handlers', 'Tested payment flow on staging', 'Fixed currency rounding bug'], secondHalf: ['Deployed to production with feature flag', 'Monitored transaction success rate', 'Updated merchant documentation'], todoList: ['Enable for all merchants', 'Set up alerting for failures', 'Write integration test suite'] },
    { id: 8, employee: 'Divya Nair', avatar: 'DN', dept: 'QA', date: 'Feb 10, 2025', project: 'Mobile App UI Revamp', status: 'rejected', firstHalf: ['Wrote test cases for new onboarding flow', 'Ran regression on authentication module', 'Filed 5 UI bug reports'], secondHalf: ['Retested 8 resolved issues', 'Updated test plan document', 'Synced with dev team on blockers'], todoList: ['Complete smoke testing for v2.1', 'Update JIRA with test results', 'Attend sprint review meeting'] },
];

const LOGS_PER_PAGE = 5;
const avatarColors = ['bg-teal-500', 'bg-blue-500', 'bg-orange-500', 'bg-purple-500', 'bg-rose-500', 'bg-emerald-500', 'bg-amber-500', 'bg-cyan-500'];

const statusCfg = {
    approved: { label: '✓ Approved', pill: 'bg-green-100 text-green-700 border border-green-200', dot: 'bg-green-500' },
    rejected: { label: '✗ Rejected', pill: 'bg-red-100 text-red-700 border border-red-200', dot: 'bg-red-500' },
    pending:  { label: '⏳ Pending',  pill: 'bg-yellow-100 text-yellow-700 border border-yellow-200', dot: 'bg-yellow-400' },
};

export default function AdminDashboard() {
    const [logs, setLogs] = useState(ALL_LOGS);
    const [viewLog, setViewLog] = useState(null);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeNav, setActiveNav] = useState('dashboard');

    // ── Derived stats ──────────────────────────────────────────────────────────
    const total    = logs.length;
    const approved = logs.filter(l => l.status === 'approved').length;
    const rejected = logs.filter(l => l.status === 'rejected').length;
    const pending  = logs.filter(l => l.status === 'pending').length;
    const employees = [...new Set(logs.map(l => l.employee))].length;

    // ── Filter + search ────────────────────────────────────────────────────────
    const filtered = logs.filter(l => {
        const matchSearch = l.employee.toLowerCase().includes(search.toLowerCase()) ||
                            l.project.toLowerCase().includes(search.toLowerCase()) ||
                            l.dept.toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === 'all' || l.status === filterStatus;
        return matchSearch && matchStatus;
    });
    const totalPages = Math.ceil(filtered.length / LOGS_PER_PAGE);
    const paginated  = filtered.slice((currentPage - 1) * LOGS_PER_PAGE, currentPage * LOGS_PER_PAGE);

    // ── Actions ────────────────────────────────────────────────────────────────
    const updateStatus = (id, status) => {
        setLogs(logs.map(l => l.id === id ? { ...l, status } : l));
        if (viewLog?.id === id) setViewLog({ ...viewLog, status });
    };

    const handleSearch = (val) => { setSearch(val); setCurrentPage(1); };
    const handleFilter = (val) => { setFilterStatus(val); setCurrentPage(1); };

    // ── Sidebar nav items ──────────────────────────────────────────────────────
    

    // ── Bar chart mock ─────────────────────────────────────────────────────────
    const weekData = [
        { day: 'Mon', approved: 4, pending: 2, rejected: 1 },
        { day: 'Tue', approved: 6, pending: 1, rejected: 0 },
        { day: 'Wed', approved: 3, pending: 4, rejected: 2 },
        { day: 'Thu', approved: 7, pending: 2, rejected: 1 },
        { day: 'Fri', approved: 5, pending: 3, rejected: 0 },
        { day: 'Sat', approved: 2, pending: 1, rejected: 0 },
        { day: 'Sun', approved: 1, pending: 0, rejected: 0 },
    ];
    const maxBar = Math.max(...weekData.map(d => d.approved + d.pending + d.rejected));

    // ── Dept breakdown ─────────────────────────────────────────────────────────
    const depts = [...new Set(logs.map(l => l.dept))];
    const deptColors = ['bg-teal-500', 'bg-blue-500', 'bg-orange-500', 'bg-purple-500', 'bg-rose-500'];

    return (
        <div className="flex h-screen bg-gray-50 font-sans overflow-hidden text-black">

            {/* ════ SIDEBAR ════ */}
          <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} currentPage="dashboard" />
            {/* ════ MAIN ════ */}
            <div className="flex-1 flex flex-col overflow-hidden">

                {/* ── Topbar ── */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 gap-4 flex-shrink-0 sticky top-0 z-10">
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <FiMenu className="w-4 h-4 text-gray-600" />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-lg font-bold text-gray-800">Admin Dashboard</h1>
                        <p className="text-xs text-gray-400">Thursday, Feb 13 2025</p>
                    </div>
                    <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <FiBell className="w-4 h-4 text-gray-600" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                    </button>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white text-xs font-bold">A</div>
                </header>

                {/* ── Scrollable body ── */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">

                    {/* ── STAT CARDS ── */}
                    <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
                        {[
                            { label: 'Total Logs',  value: total,    icon: FiFileText,    color: 'from-teal-500 to-teal-600',   light: 'bg-teal-50 text-teal-600' },
                            { label: 'Employees',   value: employees, icon: FiUsers,       color: 'from-blue-500 to-blue-600',   light: 'bg-blue-50 text-blue-600' },
                            { label: 'Approved',    value: approved, icon: FiCheckCircle, color: 'from-green-500 to-green-600', light: 'bg-green-50 text-green-600' },
                            { label: 'Pending',     value: pending,  icon: FiClock,       color: 'from-yellow-500 to-yellow-600', light: 'bg-yellow-50 text-yellow-600' },
                            { label: 'Rejected',    value: rejected, icon: FiXCircle,     color: 'from-red-500 to-red-600',     light: 'bg-red-50 text-red-600' },
                        ].map(({ label, value, icon: Icon, color, light }) => (
                            <div key={label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-3">
                                    <span className={`text-xs font-semibold text-gray-500 uppercase tracking-wide`}>{label}</span>
                                    <div className={`w-8 h-8 rounded-lg ${light} flex items-center justify-center`}>
                                        <Icon className="w-4 h-4" />
                                    </div>
                                </div>
                                <p className="text-3xl font-bold text-gray-800">{value}</p>
                                <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
                                    <div className={`h-full bg-gradient-to-r ${color} rounded-full`} style={{ width: `${(value / total) * 100}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ── CHARTS ROW ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                        {/* Bar Chart */}
                        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-sm font-bold text-gray-800">Weekly Log Activity</h3>
                                    <p className="text-xs text-gray-400">This week's submission overview</p>
                                </div>
                                <div className="flex items-center gap-3 text-xs">
                                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-teal-500 inline-block" />Approved</span>
                                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-yellow-400 inline-block" />Pending</span>
                                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-red-400 inline-block" />Rejected</span>
                                </div>
                            </div>
                            <div className="flex items-end gap-2 h-40">
                                {weekData.map((d) => {
                                    const tot = d.approved + d.pending + d.rejected;
                                    const maxH = 120;
                                    return (
                                        <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                                            <div className="w-full flex flex-col-reverse gap-0.5" style={{ height: maxH }}>
                                                <div className="w-full rounded-b bg-teal-500 transition-all" style={{ height: maxBar ? (d.approved / maxBar) * maxH : 0 }} />
                                                <div className="w-full bg-yellow-400 transition-all" style={{ height: maxBar ? (d.pending / maxBar) * maxH : 0 }} />
                                                <div className="w-full rounded-t bg-red-400 transition-all" style={{ height: maxBar ? (d.rejected / maxBar) * maxH : 0 }} />
                                            </div>
                                            <span className="text-xs text-gray-400">{d.day}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Dept Breakdown */}
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                            <h3 className="text-sm font-bold text-gray-800 mb-1">By Department</h3>
                            <p className="text-xs text-gray-400 mb-4">Log submissions per team</p>
                            <div className="space-y-3">
                                {depts.map((dept, i) => {
                                    const count = logs.filter(l => l.dept === dept).length;
                                    const pct = Math.round((count / total) * 100);
                                    return (
                                        <div key={dept}>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs font-medium text-gray-700">{dept}</span>
                                                <span className="text-xs text-gray-400">{count} logs · {pct}%</span>
                                            </div>
                                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div className={`h-full ${deptColors[i]} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* ── PENDING ALERTS ── */}
                    {pending > 0 && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                                <FiAlertCircle className="w-4 h-4 text-amber-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-amber-800">{pending} work log{pending > 1 ? 's' : ''} awaiting review</p>
                                <p className="text-xs text-amber-600">Please review and approve or reject pending submissions.</p>
                            </div>
                            <button onClick={() => handleFilter('pending')} className="text-xs font-semibold text-amber-700 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors">
                                Review Now
                            </button>
                        </div>
                    )}

                    {/* ── LOG TABLE ── */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                        {/* Table Header */}
                        <div className="px-5 py-4 border-b border-gray-100">
                            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-bold text-gray-800">Work Log Submissions</h3>
                                    <p className="text-xs text-gray-400">{filtered.length} records found</p>
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    {/* Search */}
                                    <div className="relative">
                                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                        <input
                                            type="text"
                                            value={search}
                                            onChange={e => handleSearch(e.target.value)}
                                            placeholder="Search employee, project..."
                                            className="pl-8 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 w-52"
                                        />
                                    </div>
                                    {/* Status Filter */}
                                    <div className="relative">
                                        <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                        <select
                                            value={filterStatus}
                                            onChange={e => handleFilter(e.target.value)}
                                            className="pl-8 pr-6 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none"
                                        >
                                            <option value="all">All Status</option>
                                            <option value="pending">Pending</option>
                                            <option value="approved">Approved</option>
                                            <option value="rejected">Rejected</option>
                                        </select>
                                    </div>
                                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500" title="Refresh">
                                        <FiRefreshCw className="w-3.5 h-3.5" />
                                    </button>
                                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500" title="Export">
                                        <FiDownload className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Employee</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Project</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tasks</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {paginated.length === 0 ? (
                                        <tr><td colSpan={6} className="text-center py-12 text-gray-400 text-sm">No records found.</td></tr>
                                    ) : paginated.map((log, i) => (
                                        <tr key={log.id} className="hover:bg-gray-50/80 transition-colors group">
                                            {/* Employee */}
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-full ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                                                        {log.avatar}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-semibold text-gray-800">{log.employee}</p>
                                                        <p className="text-xs text-gray-400">{log.dept}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            {/* Project */}
                                            <td className="px-4 py-3.5">
                                                <p className="text-xs text-gray-700 font-medium max-w-[180px] truncate">{log.project}</p>
                                            </td>
                                            {/* Date */}
                                            <td className="px-4 py-3.5">
                                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                                    <FiCalendar className="w-3 h-3" /> {log.date}
                                                </p>
                                            </td>
                                            {/* Tasks */}
                                            <td className="px-4 py-3.5">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="flex items-center gap-1 text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full border border-orange-100">
                                                        <FiSun className="w-3 h-3" /> {log.firstHalf.length}
                                                    </span>
                                                    <span className="flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100">
                                                        <FiMoon className="w-3 h-3" /> {log.secondHalf.length}
                                                    </span>
                                                    <span className="flex items-center gap-1 text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full border border-green-100">
                                                        <FiCheckCircle className="w-3 h-3" /> {log.todoList.length}
                                                    </span>
                                                </div>
                                            </td>
                                            {/* Status */}
                                            <td className="px-4 py-3.5">
                                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusCfg[log.status].pill}`}>
                                                    {statusCfg[log.status].label}
                                                </span>
                                            </td>
                                            {/* Actions */}
                                            <td className="px-4 py-3.5">
                                                <div className="flex items-center gap-1.5">
                                                    <button
                                                        onClick={() => setViewLog(log)}
                                                        className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                                                        title="View"
                                                    >
                                                        <FiEye className="w-3.5 h-3.5" />
                                                    </button>
                                                    {log.status !== 'approved' && (
                                                        <button
                                                            onClick={() => updateStatus(log.id, 'approved')}
                                                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                            title="Approve"
                                                        >
                                                            <FiCheck className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                    {log.status !== 'rejected' && (
                                                        <button
                                                            onClick={() => updateStatus(log.id, 'rejected')}
                                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Reject"
                                                        >
                                                            <FiX className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
                                <p className="text-xs text-gray-400">
                                    Showing {(currentPage - 1) * LOGS_PER_PAGE + 1}–{Math.min(currentPage * LOGS_PER_PAGE, filtered.length)} of {filtered.length}
                                </p>
                                <div className="flex items-center gap-1.5">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <FiChevronLeft className="w-3.5 h-3.5 text-gray-600" />
                                    </button>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                        <button
                                            key={p}
                                            onClick={() => setCurrentPage(p)}
                                            className={`w-7 h-7 rounded-lg text-xs font-semibold border transition-all ${
                                                p === currentPage ? 'bg-teal-600 text-white border-teal-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                            }`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <FiChevronRight className="w-3.5 h-3.5 text-gray-600" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── RECENT ACTIVITY ── */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                        <h3 className="text-sm font-bold text-gray-800 mb-1">Recent Activity</h3>
                        <p className="text-xs text-gray-400 mb-4">Latest log submissions across all employees</p>
                        <div className="space-y-3">
                            {logs.slice(0, 5).map((log, i) => (
                                <div key={log.id} className="flex items-center gap-3">
                                    <div className={`w-7 h-7 rounded-full ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                                        {log.avatar}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-gray-800">{log.employee} <span className="font-normal text-gray-500">submitted a log for</span> {log.project}</p>
                                        <p className="text-xs text-gray-400">{log.date} · {log.dept}</p>
                                    </div>
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${statusCfg[log.status].pill}`}>
                                        {statusCfg[log.status].label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>{/* end scrollable */}
            </div>{/* end main */}

            {/* ════ VIEW MODAL ════ */}
            {viewLog && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">

                        {/* Header */}
                        <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-5 rounded-t-2xl flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                                <div className={`w-10 h-10 rounded-xl ${avatarColors[logs.findIndex(l => l.id === viewLog.id) % avatarColors.length]} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                                    {viewLog.avatar}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-bold text-white">{viewLog.employee}</h3>
                                    <p className="text-teal-100 text-xs mt-0.5">{viewLog.dept} · {viewLog.project}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <p className="text-teal-100 text-xs flex items-center gap-1"><FiCalendar className="w-3 h-3" /> {viewLog.date}</p>
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusCfg[viewLog.status].pill}`}>
                                            {statusCfg[viewLog.status].label}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setViewLog(null)} className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex-shrink-0">
                                <FiX className="w-4 h-4 text-white" />
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-3 p-5 pb-0">
                            {[
                                { label: 'First Half', count: viewLog.firstHalf.length, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
                                { label: 'Second Half', count: viewLog.secondHalf.length, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
                                { label: 'To-Do Tasks', count: viewLog.todoList.length, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
                            ].map(s => (
                                <div key={s.label} className={`${s.bg} border ${s.border} rounded-lg p-3 text-center`}>
                                    <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Body */}
                        <div className="p-5 space-y-4 max-h-[50vh] overflow-y-auto">
                            {[
                                { title: 'First Half', items: viewLog.firstHalf, Icon: FiSun, sectionBg: 'from-orange-50 to-yellow-50', border: 'border-orange-200', iconColor: 'text-orange-600', badgeBg: 'bg-orange-100', badgeText: 'text-orange-600' },
                                { title: 'Second Half', items: viewLog.secondHalf, Icon: FiMoon, sectionBg: 'from-blue-50 to-indigo-50', border: 'border-blue-200', iconColor: 'text-blue-600', badgeBg: 'bg-blue-100', badgeText: 'text-blue-600' },
                                { title: 'To-Do List (Next Day)', items: viewLog.todoList, Icon: FiCheckCircle, sectionBg: 'from-green-50 to-emerald-50', border: 'border-green-200', iconColor: 'text-green-600', badgeBg: 'bg-green-100', badgeText: 'text-green-600' },
                            ].map(({ title, items, Icon, sectionBg, border, iconColor, badgeBg, badgeText }) => (
                                <div key={title} className={`bg-gradient-to-r ${sectionBg} rounded-xl p-4 border ${border}`}>
                                    <div className="flex items-center gap-2 mb-3">
                                        <Icon className={`w-4 h-4 ${iconColor}`} />
                                        <h5 className="font-semibold text-gray-800 text-sm">{title}</h5>
                                    </div>
                                    <ul className="space-y-2">
                                        {items.map((item, i) => (
                                            <li key={i} className="flex gap-2.5 text-gray-700 text-xs">
                                                <span className={`flex-shrink-0 w-5 h-5 ${badgeBg} ${badgeText} rounded-full flex items-center justify-center text-xs font-semibold`}>{i + 1}</span>
                                                <span className="leading-relaxed">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="px-5 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex gap-3">
                            <button onClick={() => setViewLog(null)} className="flex-1 px-4 py-2.5 border-2 border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-all text-sm">
                                Close
                            </button>
                            {viewLog.status !== 'approved' && (
                                <button onClick={() => updateStatus(viewLog.id, 'approved')} className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 px-4 rounded-lg transition-all text-sm flex items-center justify-center gap-2 shadow-md">
                                    <FiCheck className="w-4 h-4" /> Approve
                                </button>
                            )}
                            {viewLog.status !== 'rejected' && (
                                <button onClick={() => updateStatus(viewLog.id, 'rejected')} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 px-4 rounded-lg transition-all text-sm flex items-center justify-center gap-2 shadow-md">
                                    <FiX className="w-4 h-4" /> Reject
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}