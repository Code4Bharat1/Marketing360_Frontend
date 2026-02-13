'use client';

import { useState, useMemo } from 'react';
import {
    FiPlus, FiX, FiCheck, FiEdit2, FiTrash2, FiEye,
    FiCalendar, FiFlag, FiUser, FiSearch, FiFilter,
    FiChevronLeft, FiChevronRight, FiBell, FiMenu,
    FiCheckCircle, FiClock, FiAlertCircle, FiList,
    FiGrid, FiTag, FiBriefcase, FiMoreVertical,
    FiArrowUp, FiArrowRight, FiArrowDown, FiRefreshCw
} from 'react-icons/fi';
import AdminSidebar from './Admimsidebar';

// ── Constants ──────────────────────────────────────────────────────────────────
const TASKS_PER_PAGE = 8;

const EMPLOYEES = [
    { id: 1,  name: 'Rahul Sharma',  avatar: 'RS', dept: 'Engineering', color: 'bg-teal-500'    },
    { id: 2,  name: 'Priya Patel',   avatar: 'PP', dept: 'Design',      color: 'bg-blue-500'    },
    { id: 3,  name: 'Amit Kumar',    avatar: 'AK', dept: 'Data',        color: 'bg-orange-500'  },
    { id: 4,  name: 'Sneha Reddy',   avatar: 'SR', dept: 'Engineering', color: 'bg-purple-500'  },
    { id: 5,  name: 'Vikram Singh',  avatar: 'VS', dept: 'Operations',  color: 'bg-rose-500'    },
    { id: 6,  name: 'Meera Joshi',   avatar: 'MJ', dept: 'Marketing',   color: 'bg-emerald-500' },
    { id: 7,  name: 'Karan Mehta',   avatar: 'KM', dept: 'Engineering', color: 'bg-amber-500'   },
    { id: 8,  name: 'Divya Nair',    avatar: 'DN', dept: 'QA',          color: 'bg-cyan-500'    },
];

const PRIORITY_CFG = {
    high:   { label: 'High',   icon: FiArrowUp,    pill: 'bg-red-100 text-red-700 border-red-200',      dot: 'bg-red-500',    flag: 'text-red-500'    },
    medium: { label: 'Medium', icon: FiArrowRight, pill: 'bg-yellow-100 text-yellow-700 border-yellow-200', dot: 'bg-yellow-400', flag: 'text-yellow-500' },
    low:    { label: 'Low',    icon: FiArrowDown,  pill: 'bg-green-100 text-green-700 border-green-200', dot: 'bg-green-500',  flag: 'text-green-500'  },
};

const STATUS_CFG = {
    todo:        { label: 'To Do',       pill: 'bg-gray-100 text-gray-600 border-gray-200',    dot: 'bg-gray-400'    },
    in_progress: { label: 'In Progress', pill: 'bg-blue-100 text-blue-700 border-blue-200',    dot: 'bg-blue-500'    },
    review:      { label: 'In Review',   pill: 'bg-purple-100 text-purple-700 border-purple-200', dot: 'bg-purple-500' },
    done:        { label: 'Done',        pill: 'bg-green-100 text-green-700 border-green-200',  dot: 'bg-green-500'   },
};

const CATEGORIES = ['Development', 'Design', 'Marketing', 'Operations', 'QA', 'Data', 'HR', 'Finance'];

const INITIAL_TASKS = [
    { id: 1,  title: 'Fix payment gateway timeout on checkout',    desc: 'Investigate and resolve recurring timeout issues during high-traffic checkout events. Coordinate with Razorpay support.', assignedTo: [1, 4], priority: 'high',   status: 'in_progress', category: 'Development', dueDate: '2025-02-16', createdAt: 'Feb 11, 2025' },
    { id: 2,  title: 'Design new onboarding screens for mobile app', desc: 'Create wireframes and high-fidelity mockups for the new user onboarding flow. Follow the updated design system.', assignedTo: [2],    priority: 'medium', status: 'review',      category: 'Design',       dueDate: '2025-02-20', createdAt: 'Feb 10, 2025' },
    { id: 3,  title: 'Migrate CRM data to new schema',              desc: 'Run the data migration script on production after successful staging validation. Ensure rollback plan is ready.', assignedTo: [3],    priority: 'high',   status: 'todo',        category: 'Data',         dueDate: '2025-02-14', createdAt: 'Feb 09, 2025' },
    { id: 4,  title: 'Q4 Festive campaign email blast',             desc: 'Prepare, schedule and send the Diwali email campaign to the segmented customer list. Track open rates.', assignedTo: [6],    priority: 'medium', status: 'done',        category: 'Marketing',    dueDate: '2025-02-13', createdAt: 'Feb 08, 2025' },
    { id: 5,  title: 'Conduct warehouse Zone B cycle count',        desc: 'Complete physical inventory count for Zone B and reconcile with the WMS records. File discrepancy report.', assignedTo: [5],    priority: 'low',    status: 'in_progress', category: 'Operations',   dueDate: '2025-02-18', createdAt: 'Feb 10, 2025' },
    { id: 6,  title: 'Write integration test suite for auth API',   desc: 'Cover all authentication endpoints with integration tests. Minimum 80% coverage required before merge.', assignedTo: [7, 4], priority: 'medium', status: 'todo',        category: 'Development', dueDate: '2025-02-22', createdAt: 'Feb 11, 2025' },
    { id: 7,  title: 'Mobile app v2.1 smoke testing',               desc: 'Execute the smoke test checklist on the v2.1 release candidate across iOS and Android devices.', assignedTo: [8],    priority: 'high',   status: 'review',      category: 'QA',           dueDate: '2025-02-15', createdAt: 'Feb 12, 2025' },
    { id: 8,  title: 'Update brand identity color tokens',          desc: 'Finalize new brand color palette and update all design tokens in Figma and Storybook.', assignedTo: [2],    priority: 'low',    status: 'todo',        category: 'Design',       dueDate: '2025-02-25', createdAt: 'Feb 12, 2025' },
    { id: 9,  title: 'Set up monitoring dashboard for microservices', desc: 'Configure Grafana dashboards for the new auth and user microservices. Set alerting thresholds.', assignedTo: [1],    priority: 'medium', status: 'in_progress', category: 'Development', dueDate: '2025-02-19', createdAt: 'Feb 09, 2025' },
    { id: 10, title: 'SEO audit for top 50 landing pages',          desc: 'Audit on-page SEO factors, fix missing meta tags, and submit updated sitemap to Search Console.', assignedTo: [6],    priority: 'low',    status: 'done',        category: 'Marketing',    dueDate: '2025-02-12', createdAt: 'Feb 07, 2025' },
    { id: 11, title: 'Resolve rack B-12 inventory discrepancy',     desc: 'Investigate and correct the stock discrepancy identified during Zone A cycle count in rack B-12.', assignedTo: [5],    priority: 'high',   status: 'done',        category: 'Operations',   dueDate: '2025-02-11', createdAt: 'Feb 08, 2025' },
    { id: 12, title: 'HR portal leave request form QA',             desc: 'Test the new leave request form end-to-end including email notifications and manager approval workflow.', assignedTo: [8, 4], priority: 'medium', status: 'review',      category: 'QA',           dueDate: '2025-02-17', createdAt: 'Feb 11, 2025' },
];

const EMPTY_FORM = {
    title: '', desc: '', assignedTo: [], priority: 'medium',
    status: 'todo', category: 'Development',
    dueDate: new Date().toISOString().split('T')[0],
};

// ── Helpers ────────────────────────────────────────────────────────────────────
function getEmployee(id) { return EMPLOYEES.find(e => e.id === id); }

function isOverdue(dueDate, status) {
    if (status === 'done') return false;
    return new Date(dueDate) < new Date();
}

function formatDate(d) {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ── Avatar Stack ───────────────────────────────────────────────────────────────
function AvatarStack({ ids, max = 3, size = 'md' }) {
    const sz = size === 'sm' ? 'w-6 h-6 text-xs' : 'w-7 h-7 text-xs';
    const shown = ids.slice(0, max);
    const extra = ids.length - max;
    return (
        <div className="flex items-center -space-x-2">
            {shown.map(id => {
                const emp = getEmployee(id);
                if (!emp) return null;
                return (
                    <div key={id} title={emp.name}
                        className={`${sz} ${emp.color} rounded-full border-2 border-white flex items-center justify-center text-white font-bold flex-shrink-0`}>
                        {emp.avatar}
                    </div>
                );
            })}
            {extra > 0 && (
                <div className={`${sz} bg-gray-200 rounded-full border-2 border-white flex items-center justify-center text-gray-600 font-bold`}>
                    +{extra}
                </div>
            )}
        </div>
    );
}

export default function AssignTasks() {
    const [tasks, setTasks] = useState(INITIAL_TASKS);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [activeNav, setActiveNav] = useState('assign-tasks');

    // modal state
    const [showForm, setShowForm]       = useState(false);
    const [editTask, setEditTask]       = useState(null);
    const [viewTask, setViewTask]       = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    // filters
    const [search, setSearch]           = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPriority, setFilterPriority] = useState('all');
    const [filterAssignee, setFilterAssignee] = useState('all');
    const [viewMode, setViewMode]       = useState('table');
    const [currentPage, setCurrentPage] = useState(1);

    // form
    const [form, setForm] = useState(EMPTY_FORM);
    const [formError, setFormError] = useState('');

    // ── Stats ──────────────────────────────────────────────────────────────────
    const total       = tasks.length;
    const byStatus    = s => tasks.filter(t => t.status === s).length;
    const overdueCnt  = tasks.filter(t => isOverdue(t.dueDate, t.status)).length;

    // ── Filtered ───────────────────────────────────────────────────────────────
    const filtered = useMemo(() => tasks.filter(t => {
        const q = search.toLowerCase();
        const matchQ    = !q || t.title.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
        const matchS    = filterStatus   === 'all' || t.status   === filterStatus;
        const matchP    = filterPriority === 'all' || t.priority === filterPriority;
        const matchA    = filterAssignee === 'all' || t.assignedTo.includes(Number(filterAssignee));
        return matchQ && matchS && matchP && matchA;
    }), [tasks, search, filterStatus, filterPriority, filterAssignee]);

    const totalPages = Math.ceil(filtered.length / TASKS_PER_PAGE);
    const paginated  = filtered.slice((currentPage - 1) * TASKS_PER_PAGE, currentPage * TASKS_PER_PAGE);

    const resetPage = () => setCurrentPage(1);

    // ── Form handlers ──────────────────────────────────────────────────────────
    const openCreate = () => { setForm(EMPTY_FORM); setEditTask(null); setFormError(''); setShowForm(true); };
    const openEdit   = (t) => {
        setForm({ title: t.title, desc: t.desc, assignedTo: t.assignedTo, priority: t.priority, status: t.status, category: t.category, dueDate: t.dueDate });
        setEditTask(t); setFormError(''); setShowForm(true); setViewTask(null);
    };
    const closeForm  = () => { setShowForm(false); setEditTask(null); setForm(EMPTY_FORM); setFormError(''); };

    const toggleAssignee = (id) => {
        setForm(f => ({
            ...f,
            assignedTo: f.assignedTo.includes(id) ? f.assignedTo.filter(i => i !== id) : [...f.assignedTo, id]
        }));
    };

    const submitForm = (e) => {
        e.preventDefault();
        if (!form.title.trim())            return setFormError('Task title is required.');
        if (form.assignedTo.length === 0)  return setFormError('Assign to at least one employee.');
        if (!form.dueDate)                 return setFormError('Due date is required.');
        setFormError('');

        if (editTask) {
            setTasks(prev => prev.map(t => t.id === editTask.id ? { ...t, ...form } : t));
        } else {
            setTasks(prev => [{
                id: Date.now(), ...form,
                createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            }, ...prev]);
            resetPage();
        }
        closeForm();
    };

    const deleteTask = (id) => { setTasks(prev => prev.filter(t => t.id !== id)); setDeleteConfirm(null); setViewTask(null); };

    const quickStatus = (id, status) => setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));

    const clearFilters = () => { setSearch(''); setFilterStatus('all'); setFilterPriority('all'); setFilterAssignee('all'); resetPage(); };

    const hasFilters = search || filterStatus !== 'all' || filterPriority !== 'all' || filterAssignee !== 'all';

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden text-black">

            {/* ════ SIDEBAR ════ */}
            <AdminSidebar
                activeNav={activeNav}
                onNavigate={setActiveNav}
                collapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(c => !c)}
            />

            {/* ════ MAIN ════ */}
            <div className="flex-1 flex flex-col overflow-hidden">

                {/* ── Topbar ── */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 gap-4 flex-shrink-0 sticky top-0 z-10">
                    <button onClick={() => setSidebarCollapsed(c => !c)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <FiMenu className="w-4 h-4 text-gray-600" />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-lg font-bold text-gray-800">Assign Tasks</h1>
                        <p className="text-xs text-gray-400">Create, assign and track employee tasks</p>
                    </div>
                    {/* <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <FiBell className="w-4 h-4 text-gray-600" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
                    </button> */}
                    <button onClick={openCreate}
                        className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all shadow-md hover:shadow-lg">
                        <FiPlus className="w-4 h-4" /> New Task
                    </button>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white text-xs font-bold">A</div>
                </header>

                {/* ── Scrollable ── */}
                <div className="flex-1 overflow-y-auto">

                    {/* ── Hero ── */}
                    <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-6">
                        <div className="flex items-start justify-between gap-4 mb-5">
                            <div>
                                <h2 className="text-xl font-bold text-white">Task Management</h2>
                                <p className="text-teal-100 text-sm mt-1">Assign, track and manage all employee tasks in one place</p>
                            </div>
                            <button onClick={openCreate}
                                className="hidden sm:flex items-center gap-2 bg-white text-teal-700 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-teal-50 transition-colors shadow-md flex-shrink-0">
                                <FiPlus className="w-4 h-4" /> Assign Task
                            </button>
                        </div>

                        {/* Stat cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                            {[
                                { label: 'Total',       value: total,              bg: 'bg-white/20',         txt: 'text-white',       click: () => { setFilterStatus('all'); resetPage(); } },
                                { label: 'To Do',       value: byStatus('todo'),        bg: 'bg-gray-500/30',      txt: 'text-gray-100',    click: () => { setFilterStatus('todo'); resetPage(); } },
                                { label: 'In Progress', value: byStatus('in_progress'), bg: 'bg-blue-500/30',      txt: 'text-blue-100',    click: () => { setFilterStatus('in_progress'); resetPage(); } },
                                { label: 'In Review',   value: byStatus('review'),      bg: 'bg-purple-500/30',    txt: 'text-purple-100',  click: () => { setFilterStatus('review'); resetPage(); } },
                                { label: 'Done',        value: byStatus('done'),        bg: 'bg-green-500/30',     txt: 'text-green-100',   click: () => { setFilterStatus('done'); resetPage(); } },
                            ].map(s => (
                                <button key={s.label} onClick={s.click}
                                    className={`${s.bg} backdrop-blur-sm rounded-xl p-3 border border-white/10 text-left hover:border-white/30 transition-all`}>
                                    <p className={`text-2xl font-bold ${s.txt}`}>{s.value}</p>
                                    <p className="text-teal-100 text-xs mt-0.5">{s.label}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-6 space-y-4">

                        {/* Overdue alert */}
                        {overdueCnt > 0 && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                                    <FiAlertCircle className="w-4 h-4 text-red-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-red-800">{overdueCnt} task{overdueCnt > 1 ? 's are' : ' is'} overdue</p>
                                    <p className="text-xs text-red-500">These tasks have passed their due date and are still not completed.</p>
                                </div>
                            </div>
                        )}

                        {/* ── Filters ── */}
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                            <div className="flex flex-wrap gap-3 items-center">
                                {/* Search */}
                                <div className="relative flex-1 min-w-[200px] max-w-xs">
                                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                    <input type="text" value={search} onChange={e => { setSearch(e.target.value); resetPage(); }}
                                        placeholder="Search tasks..."
                                        className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                                </div>

                                {/* Status */}
                                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg flex-shrink-0">
                                    {['all', 'todo', 'in_progress', 'review', 'done'].map(s => (
                                        <button key={s} onClick={() => { setFilterStatus(s); resetPage(); }}
                                            className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${filterStatus === s ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                                            {s === 'all' ? 'All' : s === 'in_progress' ? 'In Progress' : s === 'todo' ? 'To Do' : s === 'review' ? 'Review' : 'Done'}
                                        </button>
                                    ))}
                                </div>

                                {/* Priority */}
                                <select value={filterPriority} onChange={e => { setFilterPriority(e.target.value); resetPage(); }}
                                    className="px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none cursor-pointer flex-shrink-0">
                                    <option value="all">All Priority</option>
                                    <option value="high">High</option>
                                    <option value="medium">Medium</option>
                                    <option value="low">Low</option>
                                </select>

                                {/* Assignee */}
                                <select value={filterAssignee} onChange={e => { setFilterAssignee(e.target.value); resetPage(); }}
                                    className="px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none cursor-pointer flex-shrink-0">
                                    <option value="all">All Employees</option>
                                    {EMPLOYEES.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                                </select>

                                {/* View toggle */}
                                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg ml-auto flex-shrink-0">
                                    <button onClick={() => setViewMode('table')} className={`p-1.5 rounded-md transition-all ${viewMode === 'table' ? 'bg-white shadow-sm text-teal-700' : 'text-gray-400'}`}><FiList className="w-3.5 h-3.5" /></button>
                                    <button onClick={() => setViewMode('card')}  className={`p-1.5 rounded-md transition-all ${viewMode === 'card'  ? 'bg-white shadow-sm text-teal-700' : 'text-gray-400'}`}><FiGrid className="w-3.5 h-3.5" /></button>
                                </div>
                            </div>
                        </div>

                        {/* Result count + clear */}
                        <div className="flex items-center justify-between px-1">
                            <p className="text-xs text-gray-400">{filtered.length} task{filtered.length !== 1 ? 's' : ''} found</p>
                            {hasFilters && (
                                <button onClick={clearFilters} className="text-xs text-teal-600 hover:text-teal-800 font-medium">Clear filters ×</button>
                            )}
                        </div>

                        {/* ══ TABLE VIEW ══ */}
                        {viewMode === 'table' && (
                            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-100">
                                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-8">#</th>
                                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Task</th>
                                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Assigned To</th>
                                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Priority</th>
                                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Due Date</th>
                                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {paginated.length === 0 ? (
                                                <tr><td colSpan={7} className="text-center py-16">
                                                    <FiCheckCircle className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                                                    <p className="text-gray-400 text-sm">No tasks match your filters.</p>
                                                </td></tr>
                                            ) : paginated.map((task, i) => {
                                                const P = PRIORITY_CFG[task.priority];
                                                const S = STATUS_CFG[task.status];
                                                const overdue = isOverdue(task.dueDate, task.status);
                                                return (
                                                    <tr key={task.id} className="hover:bg-gray-50/80 transition-colors group">
                                                        <td className="px-5 py-3.5 text-xs text-gray-400 font-mono">{(currentPage - 1) * TASKS_PER_PAGE + i + 1}</td>
                                                        <td className="px-4 py-3.5 max-w-xs">
                                                            <p className="text-sm font-semibold text-gray-800 truncate">{task.title}</p>
                                                            <p className="text-xs text-gray-400 truncate mt-0.5">{task.desc}</p>
                                                            <span className="inline-block mt-1 text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{task.category}</span>
                                                        </td>
                                                        <td className="px-4 py-3.5">
                                                            <AvatarStack ids={task.assignedTo} />
                                                        </td>
                                                        <td className="px-4 py-3.5">
                                                            <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border w-fit ${P.pill}`}>
                                                                <P.icon className="w-3 h-3" />{P.label}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3.5">
                                                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${S.pill}`}>{S.label}</span>
                                                        </td>
                                                        <td className="px-4 py-3.5">
                                                            <p className={`text-xs flex items-center gap-1 ${overdue ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                                                                {overdue && <FiAlertCircle className="w-3 h-3" />}
                                                                <FiCalendar className="w-3 h-3" />
                                                                {formatDate(task.dueDate)}
                                                            </p>
                                                        </td>
                                                        <td className="px-4 py-3.5">
                                                            <div className="flex items-center gap-1">
                                                                <button onClick={() => setViewTask(task)} title="View" className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"><FiEye className="w-3.5 h-3.5" /></button>
                                                                <button onClick={() => openEdit(task)} title="Edit" className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><FiEdit2 className="w-3.5 h-3.5" /></button>
                                                                <button onClick={() => setDeleteConfirm(task)} title="Delete" className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><FiTrash2 className="w-3.5 h-3.5" /></button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                                {/* Pagination */}
                                <Pagination current={currentPage} total={totalPages} filtered={filtered.length} perPage={TASKS_PER_PAGE} onChange={setCurrentPage} />
                            </div>
                        )}

                        {/* ══ CARD VIEW ══ */}
                        {viewMode === 'card' && (
                            <>
                                {paginated.length === 0 ? (
                                    <div className="bg-white rounded-xl border border-gray-100 text-center py-16 shadow-sm">
                                        <FiCheckCircle className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                                        <p className="text-gray-400 text-sm">No tasks match your filters.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                        {paginated.map(task => {
                                            const P = PRIORITY_CFG[task.priority];
                                            const S = STATUS_CFG[task.status];
                                            const overdue = isOverdue(task.dueDate, task.status);
                                            return (
                                                <div key={task.id} className="bg-white rounded-xl border border-gray-200 hover:shadow-lg hover:border-teal-300 transition-all overflow-hidden group">
                                                    {/* Priority stripe */}
                                                    <div className={`h-1 w-full ${P.dot}`} />

                                                    <div className="p-4">
                                                        {/* Top row */}
                                                        <div className="flex items-start justify-between gap-2 mb-3">
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-bold text-gray-800 leading-snug line-clamp-2">{task.title}</p>
                                                                <span className="inline-block mt-1 text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{task.category}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button onClick={() => setViewTask(task)} className="p-1 text-teal-600 hover:bg-teal-50 rounded transition-colors"><FiEye className="w-3.5 h-3.5" /></button>
                                                                <button onClick={() => openEdit(task)} className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"><FiEdit2 className="w-3.5 h-3.5" /></button>
                                                                <button onClick={() => setDeleteConfirm(task)} className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"><FiTrash2 className="w-3.5 h-3.5" /></button>
                                                            </div>
                                                        </div>

                                                        <p className="text-xs text-gray-500 line-clamp-2 mb-3">{task.desc}</p>

                                                        {/* Badges */}
                                                        <div className="flex items-center gap-2 flex-wrap mb-3">
                                                            <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${P.pill}`}>
                                                                <P.icon className="w-3 h-3" />{P.label}
                                                            </span>
                                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${S.pill}`}>{S.label}</span>
                                                        </div>

                                                        {/* Assignees + due */}
                                                        <div className="flex items-center justify-between">
                                                            <AvatarStack ids={task.assignedTo} size="sm" />
                                                            <p className={`text-xs flex items-center gap-1 ${overdue ? 'text-red-600 font-semibold' : 'text-gray-400'}`}>
                                                                {overdue && <FiAlertCircle className="w-3 h-3" />}
                                                                <FiCalendar className="w-3 h-3" />
                                                                {formatDate(task.dueDate)}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Quick status footer */}
                                                    <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100 flex items-center gap-1.5 overflow-x-auto">
                                                        {Object.entries(STATUS_CFG).map(([key, cfg]) => (
                                                            <button key={key} onClick={() => quickStatus(task.id, key)}
                                                                className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full border font-medium transition-all ${task.status === key ? cfg.pill + ' font-bold' : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}>
                                                                {cfg.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                                <Pagination current={currentPage} total={totalPages} filtered={filtered.length} perPage={TASKS_PER_PAGE} onChange={setCurrentPage} isCard />
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* ════ CREATE / EDIT MODAL ════ */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-5 rounded-t-2xl flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-white">{editTask ? 'Edit Task' : 'Assign New Task'}</h3>
                                <p className="text-teal-100 text-xs mt-0.5">{editTask ? 'Update task details below' : 'Fill in the details and assign to employees'}</p>
                            </div>
                            <button onClick={closeForm} className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
                                <FiX className="w-4 h-4 text-white" />
                            </button>
                        </div>

                        <form onSubmit={submitForm} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
                            {formError && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-700 text-sm">
                                    <FiAlertCircle className="w-4 h-4 flex-shrink-0" /> {formError}
                                </div>
                            )}

                            {/* Title */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Task Title <span className="text-red-500">*</span></label>
                                <input type="text" value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))}
                                    placeholder="e.g., Fix payment gateway timeout issue"
                                    className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-800" />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Description</label>
                                <textarea value={form.desc} onChange={e => setForm(f => ({...f, desc: e.target.value}))}
                                    placeholder="Describe what needs to be done..."
                                    rows={3}
                                    className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-800 resize-none" />
                            </div>

                            {/* Row: Priority + Category + Due */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Priority <span className="text-red-500">*</span></label>
                                    <div className="flex gap-2">
                                        {Object.entries(PRIORITY_CFG).map(([key, cfg]) => (
                                            <button key={key} type="button" onClick={() => setForm(f => ({...f, priority: key}))}
                                                className={`flex-1 flex items-center justify-center gap-1 py-2 text-xs font-semibold rounded-lg border transition-all ${form.priority === key ? cfg.pill : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}>
                                                <cfg.icon className="w-3 h-3" />{cfg.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Category</label>
                                    <select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))}
                                        className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none text-gray-800">
                                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Due Date <span className="text-red-500">*</span></label>
                                    <input type="date" value={form.dueDate} onChange={e => setForm(f => ({...f, dueDate: e.target.value}))}
                                        className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-800" />
                                </div>
                            </div>

                            {/* Status (edit only) */}
                            {editTask && (
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Status</label>
                                    <div className="flex flex-wrap gap-2">
                                        {Object.entries(STATUS_CFG).map(([key, cfg]) => (
                                            <button key={key} type="button" onClick={() => setForm(f => ({...f, status: key}))}
                                                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${form.status === key ? cfg.pill : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}>
                                                {cfg.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Assign to */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-2">
                                    Assign To <span className="text-red-500">*</span>
                                    {form.assignedTo.length > 0 && <span className="ml-2 text-teal-600">({form.assignedTo.length} selected)</span>}
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {EMPLOYEES.map(emp => {
                                        const selected = form.assignedTo.includes(emp.id);
                                        return (
                                            <button key={emp.id} type="button" onClick={() => toggleAssignee(emp.id)}
                                                className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${selected ? 'border-teal-400 bg-teal-50 ring-2 ring-teal-100' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                                                <div className={`w-7 h-7 rounded-full ${emp.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>{emp.avatar}</div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-semibold text-gray-800 truncate">{emp.name.split(' ')[0]}</p>
                                                    <p className="text-xs text-gray-400 truncate">{emp.dept}</p>
                                                </div>
                                                {selected && <FiCheck className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={closeForm} className="flex-1 px-5 py-2.5 border-2 border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 text-sm transition-all">
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-semibold py-2.5 px-5 rounded-lg text-sm transition-all shadow-md flex items-center justify-center gap-2">
                                    <FiCheck className="w-4 h-4" /> {editTask ? 'Update Task' : 'Assign Task'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ════ VIEW MODAL ════ */}
            {viewTask && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-8">
                        {/* Header */}
                        <div className={`bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-5 rounded-t-2xl flex items-start justify-between gap-4`}>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${PRIORITY_CFG[viewTask.priority].pill}`}>
                                        {PRIORITY_CFG[viewTask.priority].label} Priority
                                    </span>
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${STATUS_CFG[viewTask.status].pill}`}>
                                        {STATUS_CFG[viewTask.status].label}
                                    </span>
                                </div>
                                <h3 className="text-base font-bold text-white mt-2 leading-snug">{viewTask.title}</h3>
                                <p className="text-teal-200 text-xs mt-1">{viewTask.category} · Created {viewTask.createdAt}</p>
                            </div>
                            <button onClick={() => setViewTask(null)} className="p-2 bg-white/20 hover:bg-white/30 rounded-lg flex-shrink-0 transition-colors">
                                <FiX className="w-4 h-4 text-white" />
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            {/* Description */}
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Description</p>
                                <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-lg p-3 border border-gray-100">{viewTask.desc || 'No description provided.'}</p>
                            </div>

                            {/* Due + overdue */}
                            <div className="flex items-center gap-3">
                                <div className="flex-1 bg-gray-50 rounded-lg p-3 border border-gray-100">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Due Date</p>
                                    <p className={`text-sm font-semibold flex items-center gap-1.5 ${isOverdue(viewTask.dueDate, viewTask.status) ? 'text-red-600' : 'text-gray-800'}`}>
                                        {isOverdue(viewTask.dueDate, viewTask.status) && <FiAlertCircle className="w-4 h-4" />}
                                        <FiCalendar className="w-4 h-4" />
                                        {formatDate(viewTask.dueDate)}
                                        {isOverdue(viewTask.dueDate, viewTask.status) && <span className="text-xs text-red-500 font-normal ml-1">(Overdue)</span>}
                                    </p>
                                </div>
                                <div className="flex-1 bg-gray-50 rounded-lg p-3 border border-gray-100">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Category</p>
                                    <p className="text-sm font-semibold text-gray-800 flex items-center gap-1.5"><FiTag className="w-4 h-4 text-gray-400" />{viewTask.category}</p>
                                </div>
                            </div>

                            {/* Assigned to */}
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Assigned To ({viewTask.assignedTo.length})</p>
                                <div className="space-y-2">
                                    {viewTask.assignedTo.map(id => {
                                        const emp = getEmployee(id);
                                        if (!emp) return null;
                                        return (
                                            <div key={id} className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                                                <div className={`w-8 h-8 rounded-full ${emp.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>{emp.avatar}</div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-800">{emp.name}</p>
                                                    <p className="text-xs text-gray-400">{emp.dept}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Status change */}
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Update Status</p>
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(STATUS_CFG).map(([key, cfg]) => (
                                        <button key={key} onClick={() => { quickStatus(viewTask.id, key); setViewTask(v => ({...v, status: key})); }}
                                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${viewTask.status === key ? cfg.pill + ' font-bold' : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}>
                                            {cfg.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex gap-3">
                            <button onClick={() => setViewTask(null)} className="flex-1 border-2 border-gray-200 text-gray-700 font-semibold py-2.5 rounded-lg hover:bg-gray-100 text-sm transition-all">Close</button>
                            <button onClick={() => openEdit(viewTask)} className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 shadow-md transition-all">
                                <FiEdit2 className="w-4 h-4" /> Edit Task
                            </button>
                            <button onClick={() => setDeleteConfirm(viewTask)} className="p-2.5 text-red-500 hover:bg-red-50 border-2 border-red-200 rounded-lg transition-all">
                                <FiTrash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ════ DELETE CONFIRM ════ */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
                        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                            <FiTrash2 className="w-6 h-6 text-red-600" />
                        </div>
                        <h3 className="text-base font-bold text-gray-800 text-center mb-1">Delete Task?</h3>
                        <p className="text-sm text-gray-500 text-center mb-5">
                            "<span className="font-medium text-gray-700">{deleteConfirm.title}</span>" will be permanently deleted.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteConfirm(null)} className="flex-1 border-2 border-gray-200 text-gray-700 font-semibold py-2.5 rounded-lg hover:bg-gray-50 text-sm transition-all">Cancel</button>
                            <button onClick={() => deleteTask(deleteConfirm.id)} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-lg text-sm shadow-md transition-all">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Pagination component ───────────────────────────────────────────────────────
function Pagination({ current, total, filtered, perPage, onChange, isCard }) {
    if (total <= 1) return null;
    return (
        <div className={`flex items-center justify-between ${isCard ? 'mt-2' : 'px-5 py-3 border-t border-gray-100'}`}>
            {!isCard && (
                <p className="text-xs text-gray-400">
                    Showing {(current - 1) * perPage + 1}–{Math.min(current * perPage, filtered)} of {filtered}
                </p>
            )}
            <div className={`flex items-center gap-1.5 ${isCard ? 'mx-auto' : ''}`}>
                <button onClick={() => onChange(p => Math.max(1, p - 1))} disabled={current === 1}
                    className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed bg-white transition-colors">
                    <FiChevronLeft className="w-3.5 h-3.5 text-gray-600" />
                </button>
                {Array.from({ length: total }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => onChange(p)}
                        className={`w-7 h-7 rounded-lg text-xs font-semibold border transition-all ${p === current ? 'bg-teal-600 text-white border-teal-600 shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                        {p}
                    </button>
                ))}
                <button onClick={() => onChange(p => Math.min(total, p + 1))} disabled={current === total}
                    className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed bg-white transition-colors">
                    <FiChevronRight className="w-3.5 h-3.5 text-gray-600" />
                </button>
            </div>
        </div>
    );
}