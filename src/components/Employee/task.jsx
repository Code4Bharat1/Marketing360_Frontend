'use client';

import { useState } from 'react';
import {
    FiFileText,
    FiPlus,
    FiCalendar,
    FiChevronDown,
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
    FiClock,
    FiBriefcase
} from 'react-icons/fi';
import { Menu } from 'lucide-react';
import Sidebar from './sidebar';

const LOGS_PER_PAGE = 4;

export default function DailyWorkLogs() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [editingLog, setEditingLog] = useState(null);
    const [viewingLog, setViewingLog] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    // Form state
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        projectName: '',
        firstHalfPoints: ['', '', ''],
        secondHalfPoints: ['', '', ''],
        todoList: ['', '', '']
    });

    const [workLogs, setWorkLogs] = useState([
        {
            id: 1,
            date: 'Oct 24, 2024',
            projectName: 'E-commerce Platform Maintenance',
            status: 'approved',
            firstHalf: [
                'Fixed Amazon & Flipkart follow ups and pricing updates',
                'Reconciled laptop inventory across all platforms',
                'Updated product listings for festive offers'
            ],
            secondHalf: [
                'Closed open service tickets for smartphone repairs',
                'Coordinated with logistics team for pending deliveries',
                'Prepared daily sales report and shared with management'
            ],
            todoList: [
                'Follow up on pending customer queries',
                'Update inventory spreadsheet for new arrivals',
                'Schedule team meeting for next week planning'
            ]
        },
        {
            id: 2,
            date: 'Oct 23, 2024',
            projectName: 'Mobile App UI Revamp',
            status: 'pending',
            firstHalf: [
                'Completed wireframes for onboarding screens',
                'Reviewed design system with senior designer',
                'Updated color palette based on feedback'
            ],
            secondHalf: [
                'Implemented new login screen components',
                'Fixed responsive issues on dashboard',
                'Prepared handoff document for developers'
            ],
            todoList: [
                'Start on profile settings screen',
                'Review developer feedback',
                'Submit weekly status report'
            ]
        },
        {
            id: 3,
            date: 'Oct 22, 2024',
            projectName: 'CRM Data Migration',
            status: 'rejected',
            firstHalf: [
                'Mapped legacy fields to new schema',
                'Ran test migration on 500 records',
                'Documented transformation rules'
            ],
            secondHalf: [
                'Fixed 12 data inconsistency errors',
                'Coordinated with DBA for index optimization',
                'Sent migration progress report'
            ],
            todoList: [
                'Re-run migration with fixed mappings',
                'Validate migrated records with QA',
                'Update runbook documentation'
            ]
        },
        {
            id: 4,
            date: 'Oct 21, 2024',
            projectName: 'E-commerce Platform Maintenance',
            status: 'approved',
            firstHalf: [
                'Resolved payment gateway timeout issue',
                'Updated SSL certificates on staging server',
                'Synced product catalog with warehouse system'
            ],
            secondHalf: [
                'Deployed hotfix to production',
                'Monitored error logs post-deployment',
                'Communicated update to stakeholders'
            ],
            todoList: [
                'Performance audit on checkout page',
                'Review A/B test results',
                'Plan sprint retrospective'
            ]
        },
        {
            id: 5,
            date: 'Oct 20, 2024',
            projectName: 'Internal HR Portal',
            status: 'pending',
            firstHalf: [
                'Built leave request form with validation',
                'Integrated with email notification service',
                'Unit tested 3 new API endpoints'
            ],
            secondHalf: [
                'Code review for team PR submissions',
                'Updated API documentation',
                'Demo to HR stakeholders'
            ],
            todoList: [
                'Address HR feedback from demo',
                'Fix pagination bug on leave history',
                'Sync with backend team on permissions'
            ]
        }
    ]);

    // ─── Pagination ───────────────────────────────────────────────────────────
    const totalPages = Math.ceil(workLogs.length / LOGS_PER_PAGE);
    const paginatedLogs = workLogs.slice(
        (currentPage - 1) * LOGS_PER_PAGE,
        currentPage * LOGS_PER_PAGE
    );

    // ─── View Modal ───────────────────────────────────────────────────────────
    const handleView = (log) => {
        setViewingLog(log);
        setShowViewModal(true);
    };

    const closeViewModal = () => {
        setShowViewModal(false);
        setViewingLog(null);
    };

    // ─── Edit Modal ───────────────────────────────────────────────────────────
    const handleEdit = (log, e) => {
        e?.stopPropagation();
        setEditingLog(log);
        setFormData({
            date: new Date(log.date).toISOString().split('T')[0],
            projectName: log.projectName,
            firstHalfPoints: [...log.firstHalf, ...Array(Math.max(0, 3 - log.firstHalf.length)).fill('')],
            secondHalfPoints: [...log.secondHalf, ...Array(Math.max(0, 3 - log.secondHalf.length)).fill('')],
            todoList: [...log.todoList, ...Array(Math.max(0, 3 - log.todoList.length)).fill('')]
        });
        setShowViewModal(false);
        setShowEditModal(true);
    };

    const closeEditModal = () => {
        setShowEditModal(false);
        setEditingLog(null);
        setFormData({
            date: new Date().toISOString().split('T')[0],
            projectName: '',
            firstHalfPoints: ['', '', ''],
            secondHalfPoints: ['', '', ''],
            todoList: ['', '', '']
        });
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        const updatedData = {
            ...editingLog,
            date: new Date(formData.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            projectName: formData.projectName,
            firstHalf: formData.firstHalfPoints.filter(p => p.trim() !== ''),
            secondHalf: formData.secondHalfPoints.filter(p => p.trim() !== ''),
            todoList: formData.todoList.filter(p => p.trim() !== ''),
            status: 'pending'
        };
        setWorkLogs(workLogs.map(log => log.id === editingLog.id ? updatedData : log));
        closeEditModal();
    };

    // ─── Form helpers ─────────────────────────────────────────────────────────
    const addPoint = (section) => setFormData({ ...formData, [section]: [...formData[section], ''] });
    const removePoint = (section, index) => setFormData({ ...formData, [section]: formData[section].filter((_, i) => i !== index) });
    const updatePoint = (section, index, value) => {
        const arr = [...formData[section]];
        arr[index] = value;
        setFormData({ ...formData, [section]: arr });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newLog = {
            id: Date.now(),
            date: new Date(formData.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            projectName: formData.projectName,
            firstHalf: formData.firstHalfPoints.filter(p => p.trim() !== ''),
            secondHalf: formData.secondHalfPoints.filter(p => p.trim() !== ''),
            todoList: formData.todoList.filter(p => p.trim() !== ''),
            status: 'pending'
        };
        setWorkLogs([newLog, ...workLogs]);
        setCurrentPage(1);
        setFormData({ date: new Date().toISOString().split('T')[0], projectName: '', firstHalfPoints: ['', '', ''], secondHalfPoints: ['', '', ''], todoList: ['', '', ''] });
    };

    // ─── Status helpers ───────────────────────────────────────────────────────
    const statusConfig = {
        approved: { label: '✓ Approved', classes: 'bg-green-100 text-green-700 border border-green-200' },
        rejected: { label: '✗ Rejected', classes: 'bg-red-100 text-red-700 border border-red-200' },
        pending:  { label: '⏳ Pending', classes: 'bg-yellow-100 text-yellow-700 border border-yellow-200' }
    };

    // ─── Reusable section renderer ────────────────────────────────────────────
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

                                    {/* First Half */}
                                    {[
                                        { key: 'firstHalfPoints', label: 'First Half', Icon: FiSun, iconColor: 'text-orange-600', bg: 'from-orange-50 to-yellow-50', border: 'border-orange-200', inputBorder: 'border-orange-200', ring: 'focus:ring-orange-500', badgeBg: 'bg-orange-600' },
                                        { key: 'secondHalfPoints', label: 'Second Half', Icon: FiMoon, iconColor: 'text-blue-600', bg: 'from-blue-50 to-indigo-50', border: 'border-blue-200', inputBorder: 'border-blue-200', ring: 'focus:ring-blue-500', badgeBg: 'bg-blue-600' },
                                        { key: 'todoList', label: 'To-Do List', Icon: FiCheckCircle, iconColor: 'text-green-600', bg: 'from-green-50 to-emerald-50', border: 'border-green-200', inputBorder: 'border-green-200', ring: 'focus:ring-green-500', badgeBg: 'bg-green-600' }
                                    ].map(({ key, label, Icon, iconColor, bg, border, inputBorder, ring, badgeBg }) => (
                                        <div key={key} className={`bg-gradient-to-r ${bg} rounded-lg p-6 border ${border}`}>
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-2">
                                                    <Icon className={`w-5 h-5 ${iconColor}`} />
                                                    <h4 className="text-lg font-semibold text-gray-800">{label}</h4>
                                                    <span className="text-xs text-gray-500">(Minimum 3 points)</span>
                                                </div>
                                                <button type="button" onClick={() => addPoint(key)} className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1">
                                                    <FiPlus className="w-4 h-4" /> Add Point
                                                </button>
                                            </div>
                                            <div className="space-y-3">
                                                {formData[key].map((point, index) => (
                                                    <div key={index} className="flex gap-2">
                                                        <div className={`flex-shrink-0 w-6 h-6 ${badgeBg} text-white rounded-full flex items-center justify-center text-xs font-semibold mt-2`}>{index + 1}</div>
                                                        <input type="text" value={point} onChange={e => updatePoint(key, index, e.target.value)}
                                                            placeholder={`Point ${index + 1}${index < 3 ? ' (Required)' : ' (Optional)'}`}
                                                            className={`flex-1 px-4 py-2.5 bg-white border ${inputBorder} rounded-lg focus:outline-none focus:ring-2 ${ring} focus:border-transparent`}
                                                            required={index < 3} />
                                                        {index >= 3 && (
                                                            <button type="button" onClick={() => removePoint(key, index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                                <FiTrash2 className="w-5 h-5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}

                                    <button type="submit" className="w-full bg-gradient-to-r from-teal-600 to-teal-700 text-white font-semibold py-4 px-6 rounded-lg hover:from-teal-700 hover:to-teal-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
                                        <FiCheck className="w-5 h-5" /> Save Work Log
                                    </button>
                                </form>
                            </div>

                            {/* ── Work Log History ── */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800">Work Log History</h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Showing {paginatedLogs.length} of {workLogs.length} logs — click any card to view details
                                        </p>
                                    </div>
                                    <span className="text-sm text-gray-400 font-medium">Page {currentPage}/{totalPages}</span>
                                </div>

                                <div className="p-6">
                                    {workLogs.length === 0 ? (
                                        <div className="text-center py-12">
                                            <FiFileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                            <p className="text-gray-500">No work logs yet. Start adding your daily work!</p>
                                        </div>
                                    ) : (
                                        <>
                                            {/* ── Cards Grid ── */}
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
                                                            {/* First Half preview */}
                                                            <div className="flex gap-2">
                                                                <FiSun className="w-3.5 h-3.5 text-orange-500 flex-shrink-0 mt-0.5" />
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-xs font-semibold text-gray-500 mb-1">First Half</p>
                                                                    <p className="text-xs text-gray-700 truncate">{log.firstHalf[0]}</p>
                                                                    {log.firstHalf.length > 1 && (
                                                                        <p className="text-xs text-gray-400">+{log.firstHalf.length - 1} more</p>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Divider */}
                                                            <div className="border-t border-dashed border-gray-100" />

                                                            {/* Second Half preview */}
                                                            <div className="flex gap-2">
                                                                <FiMoon className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-xs font-semibold text-gray-500 mb-1">Second Half</p>
                                                                    <p className="text-xs text-gray-700 truncate">{log.secondHalf[0]}</p>
                                                                    {log.secondHalf.length > 1 && (
                                                                        <p className="text-xs text-gray-400">+{log.secondHalf.length - 1} more</p>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Divider */}
                                                            <div className="border-t border-dashed border-gray-100" />

                                                            {/* To-Do preview */}
                                                            <div className="flex gap-2">
                                                                <FiCheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-xs font-semibold text-gray-500 mb-1">To-Do List</p>
                                                                    <p className="text-xs text-gray-700 truncate">{log.todoList[0]}</p>
                                                                    {log.todoList.length > 1 && (
                                                                        <p className="text-xs text-gray-400">+{log.todoList.length - 1} more</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Card Footer */}
                                                        <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                                                            <span className="text-xs text-gray-400 flex items-center gap-1">
                                                                <FiBriefcase className="w-3 h-3" />
                                                                {log.firstHalf.length + log.secondHalf.length} tasks logged
                                                            </span>
                                                            <span className="text-xs text-teal-600 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                                                                <FiEye className="w-3 h-3" /> View Details
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* ── Pagination ── */}
                                            {totalPages > 1 && (
                                                <div className="mt-6 flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                        disabled={currentPage === 1}
                                                        className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                                    >
                                                        <FiChevronLeft className="w-4 h-4 text-gray-600" />
                                                    </button>

                                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                                        <button
                                                            key={page}
                                                            onClick={() => setCurrentPage(page)}
                                                            className={`w-9 h-9 rounded-lg text-sm font-semibold border transition-all ${
                                                                page === currentPage
                                                                    ? 'bg-teal-600 text-white border-teal-600 shadow-md'
                                                                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                                            }`}
                                                        >
                                                            {page}
                                                        </button>
                                                    ))}

                                                    <button
                                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                        disabled={currentPage === totalPages}
                                                        className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                                    >
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
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8 animate-fadeIn">

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
                                <button
                                    onClick={e => handleEdit(viewingLog, e)}
                                    className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                                    title="Edit"
                                >
                                    <FiEdit className="w-4 h-4 text-white" />
                                </button>
                                <button
                                    onClick={closeViewModal}
                                    className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                                    title="Close"
                                >
                                    <FiX className="w-4 h-4 text-white" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">

                            {/* Stats Row */}
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { label: 'First Half', count: viewingLog.firstHalf.length, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
                                    { label: 'Second Half', count: viewingLog.secondHalf.length, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
                                    { label: 'To-Do Tasks', count: viewingLog.todoList.length, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' }
                                ].map(s => (
                                    <div key={s.label} className={`${s.bg} border ${s.border} rounded-lg p-3 text-center`}>
                                        <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                                    </div>
                                ))}
                            </div>

                            {/* First Half */}
                            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-5 border border-orange-200">
                                <SectionList
                                    items={viewingLog.firstHalf}
                                    icon={FiSun}
                                    iconColor="text-orange-600"
                                    badgeBg="bg-orange-100"
                                    badgeText="text-orange-600"
                                    title="First Half"
                                />
                            </div>

                            {/* Second Half */}
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
                                <SectionList
                                    items={viewingLog.secondHalf}
                                    icon={FiMoon}
                                    iconColor="text-blue-600"
                                    badgeBg="bg-blue-100"
                                    badgeText="text-blue-600"
                                    title="Second Half"
                                />
                            </div>

                            {/* To-Do List */}
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
                                <SectionList
                                    items={viewingLog.todoList}
                                    icon={FiCheckCircle}
                                    iconColor="text-green-600"
                                    badgeBg="bg-green-100"
                                    badgeText="text-green-600"
                                    title="To-Do List (Next Day)"
                                />
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 rounded-b-2xl bg-gray-50">
                            <button onClick={closeViewModal} className="flex-1 px-5 py-2.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-all text-sm">
                                Close
                            </button>
                            <button onClick={e => handleEdit(viewingLog, e)} className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2.5 px-5 rounded-lg transition-all text-sm flex items-center justify-center gap-2 shadow-md">
                                <FiEdit className="w-4 h-4" /> Edit Log
                            </button>
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
                        {/* Modal Header */}
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
                                    <label className="block text-sm font-semibold text-black mb-2">Date <span className="text-red-500">*</span></label>
                                    <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})}
                                        className="w-full px-4 py-3 text-black bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-black mb-2">Project Name <span className="text-red-500">*</span></label>
                                    <input type="text" value={formData.projectName} onChange={e => setFormData({...formData, projectName: e.target.value})}
                                        className="w-full px-4 py-3 text-black bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" required />
                                </div>
                            </div>

                            {[
                                { key: 'firstHalfPoints', label: 'First Half', Icon: FiSun, iconColor: 'text-orange-600', bg: 'from-orange-50 to-yellow-50', border: 'border-orange-200', inputBorder: 'border-orange-200', ring: 'focus:ring-orange-500', badgeBg: 'bg-orange-600' },
                                { key: 'secondHalfPoints', label: 'Second Half', Icon: FiMoon, iconColor: 'text-blue-600', bg: 'from-blue-50 to-indigo-50', border: 'border-blue-200', inputBorder: 'border-blue-200', ring: 'focus:ring-blue-500', badgeBg: 'bg-blue-600' },
                                { key: 'todoList', label: 'To-Do List', Icon: FiCheckCircle, iconColor: 'text-green-600', bg: 'from-green-50 to-emerald-50', border: 'border-green-200', inputBorder: 'border-green-200', ring: 'focus:ring-green-500', badgeBg: 'bg-green-600' }
                            ].map(({ key, label, Icon, iconColor, bg, border, inputBorder, ring, badgeBg }) => (
                                <div key={key} className={`bg-gradient-to-r ${bg} rounded-lg p-6 border ${border}`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <Icon className={`w-5 h-5 ${iconColor}`} />
                                            <h4 className="text-lg font-semibold text-black">{label}</h4>
                                        </div>
                                        <button type="button" onClick={() => addPoint(key)} className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
                                            <FiPlus className="w-4 h-4" /> Add Point
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {formData[key].map((point, index) => (
                                            <div key={index} className="flex gap-2">
                                                <div className={`flex-shrink-0 w-6 h-6 ${badgeBg} text-white rounded-full flex items-center justify-center text-xs font-semibold mt-2`}>{index + 1}</div>
                                                <input type="text" value={point} onChange={e => updatePoint(key, index, e.target.value)}
                                                    className={`flex-1 px-4 py-2.5 text-black bg-white border ${inputBorder} rounded-lg focus:outline-none focus:ring-2 ${ring}`}
                                                    required={index < 3} />
                                                {index >= 3 && (
                                                    <button type="button" onClick={() => removePoint(key, index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                        <FiTrash2 className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={closeEditModal} className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all">
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-6 rounded-lg transition-all shadow-lg flex items-center justify-center gap-2">
                                    <FiCheck className="w-5 h-5" /> Update Work Log
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}