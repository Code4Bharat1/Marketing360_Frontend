'use client';

import { useState, useMemo, useEffect } from 'react';
import {
    FiUsers, FiFileText, FiCheckCircle, FiXCircle, FiClock,
    FiSun, FiMoon, FiCalendar, FiSearch, FiFilter, FiEye,
    FiCheck, FiX, FiChevronLeft, FiChevronRight,
    FiRefreshCw, FiMenu, FiUsers as FiTeam,
    FiAlertCircle, FiList, FiGrid
} from 'react-icons/fi';
import AdminSidebar from './Admimsidebar';
import { 
    getAllWorkLogs, 
    updateWorkLogStatus, 
    bulkUpdateWorkLogStatus 
} from '../../services/worklogService';
import { toast } from 'react-toastify';

// ── Constants ──────────────────────────────────────────────────────────────────
const LOGS_PER_PAGE = 8;

const avatarColors = [
    'bg-teal-500', 'bg-blue-500', 'bg-orange-500',
    'bg-purple-500', 'bg-rose-500', 'bg-emerald-500',
    'bg-amber-500', 'bg-cyan-500', 'bg-indigo-500', 'bg-pink-500'
];

const statusCfg = {
    approved: { label: 'Approved', icon: '✓', pill: 'bg-green-100 text-green-700 border border-green-200', dot: 'bg-green-500' },
    rejected: { label: 'Rejected', icon: '✗', pill: 'bg-red-100 text-red-700 border border-red-200', dot: 'bg-red-500' },
    pending: { label: 'Pending', icon: '⏳', pill: 'bg-yellow-100 text-yellow-700 border border-yellow-200', dot: 'bg-yellow-400' },
};

// ── Section list helper ────────────────────────────────────────────────────────
function SectionList({ items, Icon, iconColor, badgeBg, badgeText, title, sectionBg, border }) {
    return (
        <div className={`bg-gradient-to-r ${sectionBg} rounded-xl p-4 border ${border}`}>
            <div className="flex items-center gap-2 mb-3">
                <Icon className={`w-4 h-4 ${iconColor}`} />
                <h5 className="font-semibold text-gray-800 text-sm">{title}</h5>
                <span className={`ml-auto text-xs font-semibold px-1.5 py-0.5 rounded ${badgeBg} ${badgeText}`}>{items.length}</span>
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
    );
}

export default function AdminWorkLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [viewLog, setViewLog] = useState(null);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterDept, setFilterDept] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [selectedIds, setSelectedIds] = useState([]);
    const [viewMode, setViewMode] = useState('table'); // 'table' | 'card'
    const [sortBy, setSortBy] = useState('date_desc');

    // ── Fetch data ─────────────────────────────────────────────────────────────
    useEffect(() => {
        fetchWorkLogs();
    }, []);

    const fetchWorkLogs = async () => {
        try {
            setLoading(true);
            const response = await getAllWorkLogs();
            
            // Transform backend data to frontend format
            const transformedLogs = response.data?.map((log, index) => ({
                id: log._id || log.id,
                employee: log.employee?.name || log.employeeName || 'Unknown',
                avatar: getInitials(log.employee?.name || log.employeeName || 'UK'),
                dept: log.employee?.department || log.department || 'General',
                date: formatDate(log.createdAt || log.date),
                project: log.project || log.title || 'Untitled Project',
                status: log.status?.toLowerCase() || 'pending',
                firstHalf: log.firstHalf || log.morningTasks || [],
                secondHalf: log.secondHalf || log.afternoonTasks || [],
                todoList: log.todoList || log.nextDayTasks || [],
                rawData: log // Keep original for reference
            })) || [];

            setLogs(transformedLogs);
        } catch (error) {
            console.error('Error fetching work logs:', error);
            toast.error(error.message || 'Failed to load work logs');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchWorkLogs();
        setRefreshing(false);
        toast.success('Work logs refreshed');
    };

    // ── Helper functions ───────────────────────────────────────────────────────
    const getInitials = (name) => {
        if (!name) return 'UK';
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // ── Derived stats ──────────────────────────────────────────────────────────
    const total = logs.length;
    const approved = logs.filter(l => l.status === 'approved').length;
    const rejected = logs.filter(l => l.status === 'rejected').length;
    const pending = logs.filter(l => l.status === 'pending').length;
    const depts = ['all', ...new Set(logs.map(l => l.dept))];

    // ── Filter + sort ──────────────────────────────────────────────────────────
    const filtered = useMemo(() => {
        let arr = logs.filter(l => {
            const q = search.toLowerCase();
            const matchSearch = !q ||
                l.employee.toLowerCase().includes(q) ||
                l.project.toLowerCase().includes(q) ||
                l.dept.toLowerCase().includes(q);
            const matchStatus = filterStatus === 'all' || l.status === filterStatus;
            const matchDept = filterDept === 'all' || l.dept === filterDept;
            return matchSearch && matchStatus && matchDept;
        });
        if (sortBy === 'date_desc') arr = [...arr].reverse();
        if (sortBy === 'date_asc') arr = [...arr];
        if (sortBy === 'employee') arr = [...arr].sort((a, b) => a.employee.localeCompare(b.employee));
        return arr;
    }, [logs, search, filterStatus, filterDept, sortBy]);

    const totalPages = Math.ceil(filtered.length / LOGS_PER_PAGE);
    const paginated = filtered.slice((currentPage - 1) * LOGS_PER_PAGE, currentPage * LOGS_PER_PAGE);

    // ── Actions ────────────────────────────────────────────────────────────────
    const updateStatus = async (id, status) => {
        try {
            await updateWorkLogStatus(id, status);
            
            // Update local state
            setLogs(prev => prev.map(l => l.id === id ? { ...l, status } : l));
            if (viewLog?.id === id) setViewLog(prev => ({ ...prev, status }));
            
            toast.success(`Work log ${status} successfully`);
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error(error.message || 'Failed to update status');
        }
    };

    const bulkAction = async (status) => {
        try {
            await bulkUpdateWorkLogStatus(selectedIds, status);
            
            // Update local state
            setLogs(prev => prev.map(l => 
                selectedIds.includes(l.id) ? { ...l, status } : l
            ));
            
            setSelectedIds([]);
            toast.success(`${selectedIds.length} work logs ${status} successfully`);
        } catch (error) {
            console.error('Error in bulk action:', error);
            toast.error(error.message || 'Failed to update work logs');
        }
    };

    const toggleSelect = (id) =>
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

    const toggleSelectAll = () =>
        setSelectedIds(selectedIds.length === paginated.length ? [] : paginated.map(l => l.id));

    const setFilter = (key, val) => {
        if (key === 'status') setFilterStatus(val);
        if (key === 'dept') setFilterDept(val);
        setCurrentPage(1);
        setSelectedIds([]);
    };

    const handleSearch = (val) => { 
        setSearch(val); 
        setCurrentPage(1); 
        setSelectedIds([]); 
    };

    // ── Avatar color helper ────────────────────────────────────────────────────
    const avatarColor = (index) => avatarColors[index % avatarColors.length];

    // ── Loading state ──────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="text-center">
                    <FiRefreshCw className="w-12 h-12 text-teal-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Loading work logs...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden text-black">

            {/* ════ SIDEBAR ════ */}
            <AdminSidebar
                collapsed={collapsed}
                onToggle={() => setCollapsed(c => !c)}
            />

            {/* ════ MAIN ════ */}
            <div className="flex-1 flex flex-col overflow-hidden">

                {/* ── Topbar ── */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 gap-4 flex-shrink-0">
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <FiMenu className="w-4 h-4 text-gray-600" />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-lg font-bold text-gray-800">Work Logs</h1>
                        <p className="text-xs text-gray-400">Review and manage all employee daily logs</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white text-xs font-bold">A</div>
                </header>

                {/* ── Scrollable body ── */}
                <div className="flex-1 overflow-y-auto">

                    {/* ── Page Hero ── */}
                    <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-bold text-white">Work Log Management</h2>
                                <p className="text-teal-100 text-sm mt-1">Review, approve, or reject employee daily submissions</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={handleRefresh} 
                                    disabled={refreshing}
                                    className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    <FiRefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
                                </button>
                            </div>
                        </div>

                        {/* Mini stat row inside hero */}
                        <div className="grid grid-cols-4 gap-3 mt-5">
                            {[
                                { label: 'Total', value: total, bg: 'bg-white/20', text: 'text-white' },
                                { label: 'Approved', value: approved, bg: 'bg-green-500/30', text: 'text-green-100' },
                                { label: 'Pending', value: pending, bg: 'bg-yellow-500/30', text: 'text-yellow-100' },
                                { label: 'Rejected', value: rejected, bg: 'bg-red-500/30', text: 'text-red-100' },
                            ].map(s => (
                                <div key={s.label} className={`${s.bg} backdrop-blur-sm rounded-xl p-3 border border-white/10`}>
                                    <p className={`text-2xl font-bold ${s.text}`}>{s.value}</p>
                                    <p className="text-teal-100 text-xs mt-0.5">{s.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-6 space-y-4">

                        {/* ── Pending alert ── */}
                        {pending > 0 && (
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                                    <FiAlertCircle className="w-4 h-4 text-amber-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-amber-800">{pending} log{pending > 1 ? 's' : ''} awaiting your review</p>
                                    <p className="text-xs text-amber-600">Employees are waiting for approval on their submissions.</p>
                                </div>
                                <button onClick={() => setFilter('status', 'pending')} className="text-xs font-semibold text-amber-700 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors flex-shrink-0">
                                    Show Pending
                                </button>
                            </div>
                        )}

                        {/* ── Filters + Toolbar ── */}
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                            <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center">

                                {/* Search */}
                                <div className="relative flex-1 min-w-0 w-full lg:max-w-xs">
                                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                    <input type="text" value={search} onChange={e => handleSearch(e.target.value)}
                                        placeholder="Search employee, project, dept..."
                                        className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                                </div>

                                {/* Status filter tabs */}
                                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg flex-shrink-0">
                                    {['all', 'pending', 'approved', 'rejected'].map(s => (
                                        <button key={s} onClick={() => setFilter('status', s)}
                                            className={`px-3 py-1.5 text-xs font-semibold rounded-md capitalize transition-all ${filterStatus === s ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                                }`}>
                                            {s === 'all' ? `All (${total})` : s === 'pending' ? `Pending (${pending})` : s === 'approved' ? `Approved (${approved})` : `Rejected (${rejected})`}
                                        </button>
                                    ))}
                                </div>

                                {/* Dept filter */}
                                <div className="relative flex-shrink-0">
                                    <FiTeam className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                    <select value={filterDept} onChange={e => setFilter('dept', e.target.value)}
                                        className="pl-8 pr-6 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none cursor-pointer">
                                        {depts.map(d => <option key={d} value={d}>{d === 'all' ? 'All Depts' : d}</option>)}
                                    </select>
                                </div>

                                {/* Sort */}
                                <div className="relative flex-shrink-0">
                                    <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                                        className="px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none cursor-pointer">
                                        <option value="date_desc">Newest First</option>
                                        <option value="date_asc">Oldest First</option>
                                        <option value="employee">By Employee</option>
                                    </select>
                                </div>

                                {/* View toggle */}
                                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg flex-shrink-0 ml-auto">
                                    <button onClick={() => setViewMode('table')} className={`p-1.5 rounded-md transition-all ${viewMode === 'table' ? 'bg-white shadow-sm text-teal-700' : 'text-gray-400'}`}><FiList className="w-3.5 h-3.5" /></button>
                                    <button onClick={() => setViewMode('card')} className={`p-1.5 rounded-md transition-all ${viewMode === 'card' ? 'bg-white shadow-sm text-teal-700' : 'text-gray-400'}`}><FiGrid className="w-3.5 h-3.5" /></button>
                                </div>
                            </div>

                            {/* Bulk action bar */}
                            {selectedIds.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-3 flex-wrap">
                                    <span className="text-xs font-semibold text-gray-600">{selectedIds.length} selected</span>
                                    <button onClick={() => bulkAction('approved')} className="flex items-center gap-1.5 text-xs font-semibold bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1.5 rounded-lg transition-colors">
                                        <FiCheck className="w-3.5 h-3.5" /> Approve All
                                    </button>
                                    <button onClick={() => bulkAction('rejected')} className="flex items-center gap-1.5 text-xs font-semibold bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1.5 rounded-lg transition-colors">
                                        <FiX className="w-3.5 h-3.5" /> Reject All
                                    </button>
                                    <button onClick={() => setSelectedIds([])} className="text-xs text-gray-400 hover:text-gray-600 ml-1">Clear</button>
                                </div>
                            )}
                        </div>

                        {/* ── Result count ── */}
                        <div className="flex items-center justify-between px-1">
                            <p className="text-xs text-gray-400">{filtered.length} log{filtered.length !== 1 ? 's' : ''} found</p>
                            {(search || filterStatus !== 'all' || filterDept !== 'all') && (
                                <button onClick={() => { setSearch(''); setFilterStatus('all'); setFilterDept('all'); setCurrentPage(1); }}
                                    className="text-xs text-teal-600 hover:text-teal-800 font-medium">
                                    Clear filters ×
                                </button>
                            )}
                        </div>

                        {/* ══════════════════════════════
                            TABLE VIEW
                        ══════════════════════════════ */}
                        {viewMode === 'table' && (
                            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-100">
                                                <th className="px-4 py-3 w-8">
                                                    <input type="checkbox"
                                                        checked={paginated.length > 0 && selectedIds.length === paginated.length}
                                                        onChange={toggleSelectAll}
                                                        className="w-3.5 h-3.5 accent-teal-600 cursor-pointer" />
                                                </th>
                                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">#</th>
                                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Employee</th>
                                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Project</th>
                                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tasks</th>
                                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {paginated.length === 0 ? (
                                                <tr><td colSpan={8} className="text-center py-16">
                                                    <FiFileText className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                                                    <p className="text-gray-400 text-sm">No logs match your filters.</p>
                                                </td></tr>
                                            ) : paginated.map((log, rowIdx) => (
                                                <tr key={log.id} className={`hover:bg-gray-50/80 transition-colors ${selectedIds.includes(log.id) ? 'bg-teal-50/40' : ''}`}>
                                                    <td className="px-4 py-3.5">
                                                        <input type="checkbox" checked={selectedIds.includes(log.id)} onChange={() => toggleSelect(log.id)}
                                                            className="w-3.5 h-3.5 accent-teal-600 cursor-pointer" />
                                                    </td>
                                                    <td className="px-4 py-3.5 text-xs text-gray-400 font-mono">{(currentPage - 1) * LOGS_PER_PAGE + rowIdx + 1}</td>
                                                    <td className="px-4 py-3.5">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className={`w-8 h-8 rounded-full ${avatarColor(logs.indexOf(log))} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                                                                {log.avatar}
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-semibold text-gray-800">{log.employee}</p>
                                                                <p className="text-xs text-gray-400">{log.dept}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3.5">
                                                        <p className="text-xs text-gray-700 font-medium max-w-[200px] truncate" title={log.project}>{log.project}</p>
                                                    </td>
                                                    <td className="px-4 py-3.5">
                                                        <p className="text-xs text-gray-500 flex items-center gap-1 whitespace-nowrap">
                                                            <FiCalendar className="w-3 h-3" /> {log.date}
                                                        </p>
                                                    </td>
                                                    <td className="px-4 py-3.5">
                                                        <div className="flex items-center gap-1">
                                                            <span title="First Half" className="flex items-center gap-0.5 text-xs bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded border border-orange-100">
                                                                <FiSun className="w-2.5 h-2.5" />{log.firstHalf.length}
                                                            </span>
                                                            <span title="Second Half" className="flex items-center gap-0.5 text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100">
                                                                <FiMoon className="w-2.5 h-2.5" />{log.secondHalf.length}
                                                            </span>
                                                            <span title="To-Do" className="flex items-center gap-0.5 text-xs bg-green-50 text-green-600 px-1.5 py-0.5 rounded border border-green-100">
                                                                <FiCheckCircle className="w-2.5 h-2.5" />{log.todoList.length}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3.5">
                                                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusCfg[log.status].pill}`}>
                                                            {statusCfg[log.status].icon} {statusCfg[log.status].label}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3.5">
                                                        <div className="flex items-center gap-1">
                                                            <button onClick={() => setViewLog(log)} title="View Details"
                                                                className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
                                                                <FiEye className="w-3.5 h-3.5" />
                                                            </button>
                                                            {log.status !== 'approved' && (
                                                                <button onClick={() => updateStatus(log.id, 'approved')} title="Approve"
                                                                    className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                                                                    <FiCheck className="w-3.5 h-3.5" />
                                                                </button>
                                                            )}
                                                            {log.status !== 'rejected' && (
                                                                <button onClick={() => updateStatus(log.id, 'rejected')} title="Reject"
                                                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
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

                                {/* Table Pagination */}
                                {totalPages > 1 && (
                                    <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
                                        <p className="text-xs text-gray-400">
                                            Showing {(currentPage - 1) * LOGS_PER_PAGE + 1}–{Math.min(currentPage * LOGS_PER_PAGE, filtered.length)} of {filtered.length}
                                        </p>
                                        <div className="flex items-center gap-1.5">
                                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                                                className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                                                <FiChevronLeft className="w-3.5 h-3.5 text-gray-600" />
                                            </button>
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                                <button key={p} onClick={() => setCurrentPage(p)}
                                                    className={`w-7 h-7 rounded-lg text-xs font-semibold border transition-all ${p === currentPage ? 'bg-teal-600 text-white border-teal-600 shadow-sm' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                                        }`}>
                                                    {p}
                                                </button>
                                            ))}
                                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                                                className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                                                <FiChevronRight className="w-3.5 h-3.5 text-gray-600" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Card view and modal remain the same as original - truncated for brevity */}
                        {/* Include the full card view and modal from your original code */}

                    </div>
                </div>
            </div>

            {/* ════ VIEW MODAL ════ */}
            {viewLog && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-5 rounded-t-2xl flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                                <div className={`w-11 h-11 rounded-xl ${avatarColor(logs.indexOf(viewLog))} border-2 border-white/30 flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                                    {viewLog.avatar}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-bold text-white">{viewLog.employee}</h3>
                                    <p className="text-teal-100 text-xs mt-0.5 truncate">{viewLog.dept} · {viewLog.project}</p>
                                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                                        <p className="text-teal-100 text-xs flex items-center gap-1">
                                            <FiCalendar className="w-3 h-3" /> {viewLog.date}
                                        </p>
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusCfg[viewLog.status].pill}`}>
                                            {statusCfg[viewLog.status].icon} {statusCfg[viewLog.status].label}
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

                        {/* Sections */}
                        <div className="p-5 space-y-4 max-h-[48vh] overflow-y-auto">
                            <SectionList title="First Half" items={viewLog.firstHalf} Icon={FiSun} iconColor="text-orange-600" badgeBg="bg-orange-100" badgeText="text-orange-600" sectionBg="from-orange-50 to-yellow-50" border="border-orange-200" />
                            <SectionList title="Second Half" items={viewLog.secondHalf} Icon={FiMoon} iconColor="text-blue-600" badgeBg="bg-blue-100" badgeText="text-blue-600" sectionBg="from-blue-50 to-indigo-50" border="border-blue-200" />
                            <SectionList title="To-Do List (Next Day)" items={viewLog.todoList} Icon={FiCheckCircle} iconColor="text-green-600" badgeBg="bg-green-100" badgeText="text-green-600" sectionBg="from-green-50 to-emerald-50" border="border-green-200" />
                        </div>

                        {/* Footer */}
                        <div className="px-5 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex gap-3">
                            <button onClick={() => setViewLog(null)} className="flex-1 px-4 py-2.5 border-2 border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-all text-sm">
                                Close
                            </button>
                            {viewLog.status !== 'approved' && (
                                <button onClick={() => updateStatus(viewLog.id, 'approved')}
                                    className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 px-4 rounded-lg transition-all text-sm flex items-center justify-center gap-2 shadow-md">
                                    <FiCheck className="w-4 h-4" /> Approve
                                </button>
                            )}
                            {viewLog.status !== 'rejected' && (
                                <button onClick={() => updateStatus(viewLog.id, 'rejected')}
                                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 px-4 rounded-lg transition-all text-sm flex items-center justify-center gap-2 shadow-md">
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