'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    FiFileText,
    FiPlus,
    FiCalendar,
    FiCheck,
    FiTrash2,
    FiEdit,
    FiSun,
    FiMoon,
    FiCheckCircle,
    FiX,
    FiChevronLeft,
    FiChevronRight,
    FiEye,
    FiBriefcase,
    FiAlertCircle,
    FiLoader,
    FiRefreshCw
} from 'react-icons/fi';
import { Menu } from 'lucide-react';
import Sidebar from './sidebar';
import {
    getMyWorkLogs,
    submitWorkLog,
    updateWorkLog,
    deleteWorkLog,
} from '../../services/worklogService';

const LOGS_PER_PAGE = 4;

// ─── Toast Component ──────────────────────────────────────────────────────────
const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3500);
        return () => clearTimeout(timer);
    }, [onClose]);

    const styles = {
        success: 'bg-green-600 text-white',
        error:   'bg-red-600 text-white',
        info:    'bg-teal-600 text-white',
    };

    return (
        <div className={`fixed bottom-6 right-6 z-[60] flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-sm font-semibold animate-slideUp ${styles[type]}`}>
            {type === 'success' && <FiCheck className="w-4 h-4 flex-shrink-0" />}
            {type === 'error'   && <FiAlertCircle className="w-4 h-4 flex-shrink-0" />}
            {type === 'info'    && <FiRefreshCw className="w-4 h-4 flex-shrink-0" />}
            <span>{message}</span>
            <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100 transition-opacity">
                <FiX className="w-4 h-4" />
            </button>
        </div>
    );
};

// ─── Confirm Delete Dialog ────────────────────────────────────────────────────
const ConfirmDialog = ({ log, onConfirm, onCancel, loading }) => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[70]">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiTrash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">Delete Work Log?</h3>
            <p className="text-sm text-gray-500 mb-6">
                This will permanently remove the log for <strong>{log?.projectName || log?.project}</strong> on <strong>{log?.date}</strong>. This cannot be undone.
            </p>
            <div className="flex gap-3">
                <button
                    onClick={onCancel}
                    disabled={loading}
                    className="flex-1 px-4 py-2.5 border-2 border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    onClick={onConfirm}
                    disabled={loading}
                    className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiTrash2 className="w-4 h-4" />}
                    Delete
                </button>
            </div>
        </div>
    </div>
);

// ─── Reusable SectionList ─────────────────────────────────────────────────────
const SectionList = ({ items, icon: Icon, iconColor, badgeBg, badgeText, title }) => (
    <div>
        <div className="flex items-center gap-2 mb-3">
            <Icon className={`w-4 h-4 ${iconColor}`} />
            <h5 className="font-semibold text-gray-800 text-sm">{title}</h5>
        </div>
        <ul className="space-y-2">
            {items.map((item, i) => (
                <li key={i} className="flex gap-3 text-gray-700 text-sm">
                    <span className={`flex-shrink-0 w-5 h-5 ${badgeBg} ${badgeText} rounded-full flex items-center justify-center text-xs font-semibold`}>
                        {i + 1}
                    </span>
                    <span className="flex-1 leading-relaxed">{item}</span>
                </li>
            ))}
        </ul>
    </div>
);

// ─── Normalize API log → UI shape ─────────────────────────────────────────────
const normalizeLog = (log) => ({
    id:          log._id || log.id,
    date:        log.date
        ? new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : log.date,
    projectName: log.project || log.projectName,
    status:      log.status || 'pending',
    firstHalf:   log.firstHalf  || [],
    secondHalf:  log.secondHalf || [],
    todoList:    log.todoList   || [],
    // preserve raw date string for PATCH payload
    _rawDate:    log.date,
});

const emptyForm = () => ({
    date:              new Date().toISOString().split('T')[0],
    projectName:       '',
    firstHalfPoints:   ['', '', ''],
    secondHalfPoints:  ['', '', ''],
    todoList:          ['', '', '']
});

export default function DailyWorkLogs() {
    const [sidebarOpen,     setSidebarOpen]     = useState(false);
    const [showEditModal,   setShowEditModal]    = useState(false);
    const [showViewModal,   setShowViewModal]    = useState(false);
    const [showDeleteDialog,setShowDeleteDialog] = useState(false);
    const [editingLog,      setEditingLog]       = useState(null);
    const [viewingLog,      setViewingLog]       = useState(null);
    const [deletingLog,     setDeletingLog]      = useState(null);
    const [currentPage,     setCurrentPage]      = useState(1);

    // API state
    const [workLogs,        setWorkLogs]         = useState([]);
    const [loading,         setLoading]          = useState(true);
    const [submitting,      setSubmitting]       = useState(false);
    const [deletingId,      setDeletingId]       = useState(null);
    const [error,           setError]            = useState(null);

    // Toast
    const [toast, setToast] = useState(null);
    const showToast = useCallback((message, type = 'success') => {
        setToast({ message, type });
    }, []);

    // Form
    const [formData, setFormData] = useState(emptyForm());

    // ─── Fetch logs from backend ───────────────────────────────────────────────
    const fetchLogs = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getMyWorkLogs();
            // API returns { success, count, data: [...] }
            const raw = response?.data || response || [];
            setWorkLogs(raw.map(normalizeLog));
        } catch (err) {
            setError(err.message || 'Failed to load work logs');
            showToast(err.message || 'Failed to load work logs', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => { fetchLogs(); }, [fetchLogs]);

    // ─── Pagination ────────────────────────────────────────────────────────────
    const totalPages    = Math.ceil(workLogs.length / LOGS_PER_PAGE);
    const paginatedLogs = workLogs.slice(
        (currentPage - 1) * LOGS_PER_PAGE,
        currentPage * LOGS_PER_PAGE
    );

    // ─── View Modal ────────────────────────────────────────────────────────────
    const handleView = (log) => { setViewingLog(log); setShowViewModal(true); };
    const closeViewModal = () => { setShowViewModal(false); setViewingLog(null); };

    // ─── Edit Modal ────────────────────────────────────────────────────────────
    const handleEdit = (log, e) => {
        e?.stopPropagation();
        setEditingLog(log);
        setFormData({
            date:             log._rawDate
                ? new Date(log._rawDate).toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0],
            projectName:      log.projectName,
            firstHalfPoints:  [...log.firstHalf,  ...Array(Math.max(0, 3 - log.firstHalf.length)).fill('')],
            secondHalfPoints: [...log.secondHalf, ...Array(Math.max(0, 3 - log.secondHalf.length)).fill('')],
            todoList:         [...log.todoList,   ...Array(Math.max(0, 3 - log.todoList.length)).fill('')]
        });
        setShowViewModal(false);
        setShowEditModal(true);
    };

    const closeEditModal = () => {
        setShowEditModal(false);
        setEditingLog(null);
        setFormData(emptyForm());
    };

    // ─── Submit new log ────────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            const payload = {
                date:       formData.date,
                project:    formData.projectName,
                firstHalf:  formData.firstHalfPoints.filter(p => p.trim() !== ''),
                secondHalf: formData.secondHalfPoints.filter(p => p.trim() !== ''),
                todoList:   formData.todoList.filter(p => p.trim() !== ''),
            };
            const response = await submitWorkLog(payload);
            const created  = normalizeLog(response?.data || response);
            setWorkLogs(prev => [created, ...prev]);
            setCurrentPage(1);
            setFormData(emptyForm());
            showToast('Work log submitted successfully!', 'success');
        } catch (err) {
            showToast(err.message || 'Failed to submit work log', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    // ─── Update log ────────────────────────────────────────────────────────────
    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            const payload = {
                project:    formData.projectName,
                firstHalf:  formData.firstHalfPoints.filter(p => p.trim() !== ''),
                secondHalf: formData.secondHalfPoints.filter(p => p.trim() !== ''),
                todoList:   formData.todoList.filter(p => p.trim() !== ''),
            };
            const response = await updateWorkLog(editingLog.id, payload);
            const updated  = normalizeLog(response?.data || response);
            setWorkLogs(prev => prev.map(l => l.id === editingLog.id ? updated : l));
            closeEditModal();
            showToast('Work log updated successfully!', 'success');
        } catch (err) {
            showToast(err.message || 'Failed to update work log', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    // ─── Delete log ────────────────────────────────────────────────────────────
    const handleDeleteClick = (log, e) => {
        e?.stopPropagation();
        setDeletingLog(log);
        setShowDeleteDialog(true);
        setShowViewModal(false);
    };

    const handleDeleteConfirm = async () => {
        try {
            setDeletingId(deletingLog.id);
            await deleteWorkLog(deletingLog.id);
            setWorkLogs(prev => prev.filter(l => l.id !== deletingLog.id));
            // Fix page if we emptied the current page
            setCurrentPage(prev => {
                const newTotal = Math.ceil((workLogs.length - 1) / LOGS_PER_PAGE);
                return prev > newTotal ? Math.max(1, newTotal) : prev;
            });
            showToast('Work log deleted.', 'info');
        } catch (err) {
            showToast(err.message || 'Failed to delete work log', 'error');
        } finally {
            setDeletingId(null);
            setDeletingLog(null);
            setShowDeleteDialog(false);
        }
    };

    // ─── Form helpers ──────────────────────────────────────────────────────────
    const addPoint    = (section) => setFormData({ ...formData, [section]: [...formData[section], ''] });
    const removePoint = (section, index) => setFormData({ ...formData, [section]: formData[section].filter((_, i) => i !== index) });
    const updatePoint = (section, index, value) => {
        const arr = [...formData[section]]; arr[index] = value;
        setFormData({ ...formData, [section]: arr });
    };

    // ─── Status config ─────────────────────────────────────────────────────────
    const statusConfig = {
        approved: { label: '✓ Approved', classes: 'bg-green-100 text-green-700 border border-green-200' },
        rejected: { label: '✗ Rejected', classes: 'bg-red-100 text-red-700 border border-red-200' },
        pending:  { label: '⏳ Pending',  classes: 'bg-yellow-100 text-yellow-700 border border-yellow-200' }
    };

    const sectionConfigs = [
        { key: 'firstHalfPoints',  label: 'First Half',  Icon: FiSun,        iconColor: 'text-orange-600', bg: 'from-orange-50 to-yellow-50',  border: 'border-orange-200', inputBorder: 'border-orange-200', ring: 'focus:ring-orange-500', badgeBg: 'bg-orange-600' },
        { key: 'secondHalfPoints', label: 'Second Half', Icon: FiMoon,       iconColor: 'text-blue-600',   bg: 'from-blue-50 to-indigo-50',    border: 'border-blue-200',   inputBorder: 'border-blue-200',  ring: 'focus:ring-blue-500',   badgeBg: 'bg-blue-600'   },
        { key: 'todoList',         label: 'To-Do List',  Icon: FiCheckCircle,iconColor: 'text-green-600',  bg: 'from-green-50 to-emerald-50',  border: 'border-green-200',  inputBorder: 'border-green-200', ring: 'focus:ring-green-500',  badgeBg: 'bg-green-600'  }
    ];

    // ─── Shared section builder (used in both add & edit forms) ───────────────
    const renderFormSections = (accentRing) =>
        sectionConfigs.map(({ key, label, Icon, iconColor, bg, border, inputBorder, ring, badgeBg }) => (
            <div key={key} className={`bg-gradient-to-r ${bg} rounded-lg p-6 border ${border}`}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Icon className={`w-5 h-5 ${iconColor}`} />
                        <h4 className="text-lg font-semibold text-gray-800">{label}</h4>
                        <span className="text-xs text-gray-500">(Min 3 points)</span>
                    </div>
                    <button type="button" onClick={() => addPoint(key)}
                        className={`text-sm ${accentRing === 'teal' ? 'text-teal-600 hover:text-teal-700' : 'text-emerald-600 hover:text-emerald-700'} font-medium flex items-center gap-1`}>
                        <FiPlus className="w-4 h-4" /> Add Point
                    </button>
                </div>
                <div className="space-y-3">
                    {formData[key].map((point, index) => (
                        <div key={index} className="flex gap-2">
                            <div className={`flex-shrink-0 w-6 h-6 ${badgeBg} text-white rounded-full flex items-center justify-center text-xs font-semibold mt-2`}>
                                {index + 1}
                            </div>
                            <input
                                type="text"
                                value={point}
                                onChange={e => updatePoint(key, index, e.target.value)}
                                placeholder={`Point ${index + 1}${index < 3 ? ' (Required)' : ' (Optional)'}`}
                                className={`flex-1 px-4 py-2.5 text-black bg-white border ${inputBorder} rounded-lg focus:outline-none focus:ring-2 ${ring} focus:border-transparent`}
                                required={index < 3}
                            />
                            {index >= 3 && (
                                <button type="button" onClick={() => removePoint(key, index)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                    <FiTrash2 className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        ));

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} currentPage="workLogs" />

            <main className="flex-1 overflow-hidden flex flex-col">
                {/* ── Header ── */}
                <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm sticky top-0 z-30">
                    <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
                        <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <Menu className="w-5 h-5 text-gray-600" />
                        </button>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 truncate">Daily Work Logs</h2>
                            <p className="text-xs sm:text-sm text-gray-500 mt-0.5 hidden sm:block">Log your daily work activities with detailed breakdowns</p>
                        </div>
                        <button
                            onClick={fetchLogs}
                            disabled={loading}
                            className="p-2 text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors disabled:opacity-40"
                            title="Refresh logs"
                        >
                            <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </header>

                {/* ── Content ── */}
                <div className="flex-1 overflow-auto text-black">
                    <div className="p-4 sm:p-6 lg:p-8">
                        <div className="max-w-7xl mx-auto">

                            {/* ── Add Log Form ── */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                                <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-4">
                                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                        <FiPlus className="w-5 h-5" /> Add Work Log
                                    </h3>
                                    <p className="text-teal-50 text-sm mt-1">Document your daily work with first half, second half activities and tomorrow's to-do list</p>
                                </div>

                                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Date <span className="text-red-500">*</span></label>
                                            <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent" required />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Project Name <span className="text-red-500">*</span></label>
                                            <input type="text" value={formData.projectName} onChange={e => setFormData({...formData, projectName: e.target.value})}
                                                placeholder="e.g., E-commerce Platform Maintenance"
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent" required />
                                        </div>
                                    </div>

                                    {renderFormSections('teal')}

                                    <button type="submit" disabled={submitting}
                                        className="w-full bg-gradient-to-r from-teal-600 to-teal-700 text-white font-semibold py-4 px-6 rounded-lg hover:from-teal-700 hover:to-teal-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                                        {submitting
                                            ? <><FiLoader className="w-5 h-5 animate-spin" /> Saving…</>
                                            : <><FiCheck className="w-5 h-5" /> Save Work Log</>}
                                    </button>
                                </form>
                            </div>

                            {/* ── Work Log History ── */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800">Work Log History</h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {loading
                                                ? 'Loading your logs…'
                                                : `Showing ${paginatedLogs.length} of ${workLogs.length} logs — click any card to view details`}
                                        </p>
                                    </div>
                                    {!loading && totalPages > 0 && (
                                        <span className="text-sm text-gray-400 font-medium">Page {currentPage}/{totalPages}</span>
                                    )}
                                </div>

                                <div className="p-6">
                                    {/* Loading skeleton */}
                                    {loading && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4">
                                            {[1,2,3,4].map(i => (
                                                <div key={i} className="border border-gray-100 rounded-xl overflow-hidden animate-pulse">
                                                    <div className="bg-gray-200 h-14" />
                                                    <div className="p-4 space-y-3">
                                                        <div className="h-3 bg-gray-100 rounded w-3/4" />
                                                        <div className="h-3 bg-gray-100 rounded w-1/2" />
                                                        <div className="h-3 bg-gray-100 rounded w-2/3" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Error state */}
                                    {!loading && error && (
                                        <div className="text-center py-12">
                                            <FiAlertCircle className="w-12 h-12 text-red-300 mx-auto mb-4" />
                                            <p className="text-gray-500 mb-4">{error}</p>
                                            <button onClick={fetchLogs}
                                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700 transition-colors">
                                                <FiRefreshCw className="w-4 h-4" /> Retry
                                            </button>
                                        </div>
                                    )}

                                    {/* Empty state */}
                                    {!loading && !error && workLogs.length === 0 && (
                                        <div className="text-center py-12">
                                            <FiFileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                            <p className="text-gray-500">No work logs yet. Start adding your daily work!</p>
                                        </div>
                                    )}

                                    {/* Cards grid */}
                                    {!loading && !error && workLogs.length > 0 && (
                                        <>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4">
                                                {paginatedLogs.map(log => (
                                                    <div
                                                        key={log.id}
                                                        onClick={() => handleView(log)}
                                                        className="group border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-teal-300 transition-all cursor-pointer bg-white"
                                                    >
                                                        {/* Card Top Bar */}
                                                        <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-4 py-3 flex items-start justify-between gap-2">
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-white font-semibold text-sm truncate">{log.projectName}</p>
                                                                <p className="text-teal-100 text-xs flex items-center gap-1 mt-0.5">
                                                                    <FiCalendar className="w-3 h-3" /> {log.date}
                                                                </p>
                                                            </div>
                                                            <span className={`flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${statusConfig[log.status]?.classes}`}>
                                                                {statusConfig[log.status]?.label}
                                                            </span>
                                                        </div>

                                                        {/* Card Body — preview */}
                                                        <div className="px-4 py-3 space-y-3">
                                                            {[
                                                                { icon: FiSun,         color: 'text-orange-500', label: 'First Half',  items: log.firstHalf  },
                                                                { icon: FiMoon,        color: 'text-blue-500',   label: 'Second Half', items: log.secondHalf },
                                                                { icon: FiCheckCircle, color: 'text-green-500',  label: 'To-Do List',  items: log.todoList   },
                                                            ].map(({ icon: Icon, color, label, items }, idx) => (
                                                                <div key={label}>
                                                                    {idx > 0 && <div className="border-t border-dashed border-gray-100 mb-3" />}
                                                                    <div className="flex gap-2">
                                                                        <Icon className={`w-3.5 h-3.5 ${color} flex-shrink-0 mt-0.5`} />
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="text-xs font-semibold text-gray-500 mb-1">{label}</p>
                                                                            <p className="text-xs text-gray-700 truncate">{items[0]}</p>
                                                                            {items.length > 1 && (
                                                                                <p className="text-xs text-gray-400">+{items.length - 1} more</p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {/* Card Footer */}
                                                        <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                                                            <span className="text-xs text-gray-400 flex items-center gap-1">
                                                                <FiBriefcase className="w-3 h-3" />
                                                                {log.firstHalf.length + log.secondHalf.length} tasks logged
                                                            </span>
                                                            <div className="flex items-center gap-3">
                                                                {log.status === 'pending' && (
                                                                    <button
                                                                        onClick={e => handleDeleteClick(log, e)}
                                                                        disabled={deletingId === log.id}
                                                                        className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1 transition-colors disabled:opacity-40"
                                                                        title="Delete log"
                                                                    >
                                                                        {deletingId === log.id
                                                                            ? <FiLoader className="w-3 h-3 animate-spin" />
                                                                            : <FiTrash2 className="w-3 h-3" />}
                                                                    </button>
                                                                )}
                                                                <span className="text-xs text-teal-600 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                                                                    <FiEye className="w-3 h-3" /> View Details
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Pagination */}
                                            {totalPages > 1 && (
                                                <div className="mt-6 flex items-center justify-center gap-2">
                                                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                                                        className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                                                        <FiChevronLeft className="w-4 h-4 text-gray-600" />
                                                    </button>
                                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                                        <button key={page} onClick={() => setCurrentPage(page)}
                                                            className={`w-9 h-9 rounded-lg text-sm font-semibold border transition-all ${
                                                                page === currentPage
                                                                    ? 'bg-teal-600 text-white border-teal-600 shadow-md'
                                                                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                                            }`}>
                                                            {page}
                                                        </button>
                                                    ))}
                                                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                                                        className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                                                        <FiChevronRight className="w-4 h-4 text-gray-600" />
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* ════════════════════════════════════════
                VIEW MODAL
            ════════════════════════════════════════ */}
            {showViewModal && viewingLog && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-5 rounded-t-2xl flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <h3 className="text-xl font-bold text-white truncate">{viewingLog.projectName}</h3>
                                <div className="flex items-center gap-3 mt-2 flex-wrap">
                                    <p className="text-teal-100 text-sm flex items-center gap-1.5">
                                        <FiCalendar className="w-3.5 h-3.5" /> {viewingLog.date}
                                    </p>
                                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusConfig[viewingLog.status]?.classes}`}>
                                        {statusConfig[viewingLog.status]?.label}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                {viewingLog.status === 'pending' && (
                                    <>
                                        <button onClick={e => handleEdit(viewingLog, e)}
                                            className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors" title="Edit">
                                            <FiEdit className="w-4 h-4 text-white" />
                                        </button>
                                        <button onClick={e => handleDeleteClick(viewingLog, e)}
                                            className="p-2 bg-white/20 hover:bg-red-500/50 rounded-lg transition-colors" title="Delete">
                                            <FiTrash2 className="w-4 h-4 text-white" />
                                        </button>
                                    </>
                                )}
                                <button onClick={closeViewModal} className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors" title="Close">
                                    <FiX className="w-4 h-4 text-white" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                            {/* Stats Row */}
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { label: 'First Half',   count: viewingLog.firstHalf.length,  color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
                                    { label: 'Second Half',  count: viewingLog.secondHalf.length, color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-200'   },
                                    { label: 'To-Do Tasks',  count: viewingLog.todoList.length,   color: 'text-green-600',  bg: 'bg-green-50',  border: 'border-green-200'  }
                                ].map(s => (
                                    <div key={s.label} className={`${s.bg} border ${s.border} rounded-lg p-3 text-center`}>
                                        <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-5 border border-orange-200">
                                <SectionList items={viewingLog.firstHalf}  icon={FiSun}         iconColor="text-orange-600" badgeBg="bg-orange-100" badgeText="text-orange-600" title="First Half" />
                            </div>
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
                                <SectionList items={viewingLog.secondHalf} icon={FiMoon}        iconColor="text-blue-600"   badgeBg="bg-blue-100"   badgeText="text-blue-600"   title="Second Half" />
                            </div>
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
                                <SectionList items={viewingLog.todoList}   icon={FiCheckCircle} iconColor="text-green-600"  badgeBg="bg-green-100"  badgeText="text-green-600"  title="To-Do List (Next Day)" />
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 rounded-b-2xl bg-gray-50">
                            <button onClick={closeViewModal}
                                className="flex-1 px-5 py-2.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-all text-sm">
                                Close
                            </button>
                            {viewingLog.status === 'pending' && (
                                <button onClick={e => handleEdit(viewingLog, e)}
                                    className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2.5 px-5 rounded-lg transition-all text-sm flex items-center justify-center gap-2 shadow-md">
                                    <FiEdit className="w-4 h-4" /> Edit Log
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ════════════════════════════════════════
                EDIT MODAL
            ════════════════════════════════════════ */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8">
                        <div className="bg-emerald-500 px-6 py-4 flex items-center justify-between rounded-t-2xl sticky top-0 z-10">
                            <div>
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <FiEdit className="w-5 h-5" /> Edit Work Log
                                </h3>
                                <p className="text-emerald-100 text-sm mt-1">Update your work log details</p>
                            </div>
                            <button onClick={closeEditModal} className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
                                <FiX className="w-5 h-5 text-white" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdate} className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-black mb-2">Date</label>
                                    {/* Date is not editable on update (backend only accepts project/firstHalf/secondHalf/todoList) */}
                                    <input type="date" value={formData.date} disabled
                                        className="w-full px-4 py-3 text-gray-400 bg-gray-100 border border-gray-200 rounded-lg cursor-not-allowed" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-black mb-2">Project Name <span className="text-red-500">*</span></label>
                                    <input type="text" value={formData.projectName} onChange={e => setFormData({...formData, projectName: e.target.value})}
                                        className="w-full px-4 py-3 text-black bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" required />
                                </div>
                            </div>

                            {renderFormSections('emerald')}

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={closeEditModal} disabled={submitting}
                                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50">
                                    Cancel
                                </button>
                                <button type="submit" disabled={submitting}
                                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-6 rounded-lg transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-60">
                                    {submitting
                                        ? <><FiLoader className="w-5 h-5 animate-spin" /> Updating…</>
                                        : <><FiCheck className="w-5 h-5" /> Update Work Log</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ════════════════════════════════════════
                DELETE CONFIRM DIALOG
            ════════════════════════════════════════ */}
            {showDeleteDialog && (
                <ConfirmDialog
                    log={deletingLog}
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => { setShowDeleteDialog(false); setDeletingLog(null); }}
                    loading={!!deletingId}
                />
            )}

            {/* ── Toast ── */}
            {toast && (
                <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
            )}

            {/* ── Slide-up animation ── */}
            <style>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to   { opacity: 1; transform: translateY(0);    }
                }
                .animate-slideUp { animation: slideUp 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
}