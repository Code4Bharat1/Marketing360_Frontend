'use client';

import { useState, useEffect, useMemo } from 'react';
import {
    FiPlus, FiX, FiCheck, FiEdit2, FiTrash2, FiEye,
    FiSearch, FiMenu, FiBell, FiMail, FiPhone,
    FiMapPin, FiCalendar, FiUsers, FiChevronLeft,
    FiChevronRight, FiAlertCircle, FiGrid, FiList,
    FiBriefcase, FiShield, FiUserCheck, FiUserX,
    FiDownload, FiRefreshCw, FiLock, FiUnlock, FiClock,
    FiLoader
} from 'react-icons/fi';
import AdminSidebar from './Admimsidebar';
import {
    getAllEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee
} from '../../services/adminService';

// ── Constants ────────────────────────────────────────────────────────────────
const PER_PAGE = 8;

const DEPT_COLORS = {
    Engineering: 'bg-teal-500',
    Design: 'bg-blue-500',
    Data: 'bg-orange-500',
    Operations: 'bg-purple-500',
    Marketing: 'bg-rose-500',
    QA: 'bg-emerald-500',
    HR: 'bg-amber-500',
    Finance: 'bg-cyan-500',
};

const SHIFT_TYPES = ['Morning', 'Afternoon', 'Night', 'Flexible'];
const SHIFT_COLORS = {
    Morning: 'bg-amber-100 text-amber-700 border-amber-200',
    Afternoon: 'bg-orange-100 text-orange-700 border-orange-200',
    Night: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    Flexible: 'bg-purple-100 text-purple-700 border-purple-200',
};

const ROLE_OPTIONS = ['Software Engineer', 'Senior Engineer', 'UI/UX Designer', 'Data Analyst', 'Operations Manager', 'Marketing Executive', 'QA Engineer', 'HR Executive', 'Finance Analyst', 'Team Lead', 'Project Manager'];
const DEPT_OPTIONS = Object.keys(DEPT_COLORS);
const STATUS_OPTIONS = ['Active', 'Inactive'];

const STATUS_CFG = {
    Active: { label: 'Active', pill: 'bg-green-100 text-green-700 border-green-200', dot: 'bg-green-500' },
    Inactive: { label: 'Inactive', pill: 'bg-gray-100 text-gray-500 border-gray-200', dot: 'bg-gray-400' },
};

const EMPTY_FORM = {
    name: '',
    email: '',
    phoneNumber: '',
    role: 'Software Engineer',
    department: 'Engineering',
    Location: 'Mumbai',
    joiningDate: new Date().toISOString().split('T')[0],
    Status: 'Active',
    shiftName: 'Morning',
    assignedStartTime: '09:00',
    assignedEndTime: '18:00',
    managerName: '',
};

// ── Helper Functions ─────────────────────────────────────────────────────────
function formatDate(d) {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function avatarColor(dept) {
    return DEPT_COLORS[dept] || 'bg-teal-500';
}

function formatTime(time) {
    if (!time) return '';
    const [h, m] = time.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${m} ${ampm}`;
}

// ── Form field component ─────────────────────────────────────────────────────
function Field({ label, required, children }) {
    return (
        <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            {children}
        </div>
    );
}

// ── Toast Notification Component ────────────────────────────────────────────
function Toast({ message, type, onClose }) {
    useEffect(() => {
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';

    return (
        <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-slideIn`}>
            <span className="text-sm font-medium">{message}</span>
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded transition-colors">
                <FiX className="w-4 h-4" />
            </button>
        </div>
    );
}

export default function EmployeesPage() {
    const [employees, setEmployees] = useState([]);
    const [collapsed, setCollapsed] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // modals
    const [showForm, setShowForm] = useState(false);
    const [editEmp, setEditEmp] = useState(null);
    const [viewEmp, setViewEmp] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    // filters
    const [search, setSearch] = useState('');
    const [filterDept, setFilterDept] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [viewMode, setViewMode] = useState('table');
    const [currentPage, setCurrentPage] = useState(1);

    // form
    const [form, setForm] = useState(EMPTY_FORM);
    const [formError, setFormError] = useState('');

    // toast
    const [toast, setToast] = useState(null);

    // ── Fetch Employees ───────────────────────────────────────────────────────
    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const response = await getAllEmployees();

            if (response.success) {
                // Transform backend data to match frontend format
                const transformedEmployees = response.data.map(emp => ({
                    id: emp._id,
                    name: emp.name,
                    email: emp.email,
                    phone: emp.phoneNumber,
                    role: emp.designation,           // ✅ Changed: use designation
                    dept: emp.department,
                    location: emp.Location,
                    joinDate: emp.joiningDate,
                    status: emp.Status,
                    avatar: getInitials(emp.name),
                    shiftType: emp.shiftName,
                    shiftStart: emp.assignedStartTime,
                    shiftEnd: emp.assignedEndTime,
                    managerName: emp.managerName,
                    systemRole: emp.role,            // ✅ New: store system role
                    logsCount: emp.workLogs?.length || 0,
                    tasksCount: emp.tasks?.length || 0,
                }));
                setEmployees(transformedEmployees);
            } else {
                showToast('Failed to fetch employees', 'error');
            }
        } catch (error) {
            console.error('Fetch employees error:', error);
            showToast(error.response?.data?.message || 'Failed to fetch employees', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    // ── Toast Helper ──────────────────────────────────────────────────────────
    const showToast = (message, type = 'info') => {
        setToast({ message, type });
    };

    // ── Stats ─────────────────────────────────────────────────────────────────
    const total = employees.length;
    const active = employees.filter(e => e.status === 'Active').length;
    const inactive = employees.filter(e => e.status === 'Inactive').length;
    const depts = [...new Set(employees.map(e => e.dept))];

    // ── Filtered + paginated ──────────────────────────────────────────────────
    const filtered = useMemo(() => employees.filter(e => {
        const q = search.toLowerCase();
        const matchQ = !q || e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q) || e.role.toLowerCase().includes(q) || e.dept.toLowerCase().includes(q);
        const matchD = filterDept === 'all' || e.dept === filterDept;
        const matchS = filterStatus === 'all' || e.status === filterStatus;
        return matchQ && matchD && matchS;
    }), [employees, search, filterDept, filterStatus]);

    const totalPages = Math.ceil(filtered.length / PER_PAGE);
    const paginated = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

    const resetPage = () => setCurrentPage(1);

    // ── CRUD ──────────────────────────────────────────────────────────────────
    const openCreate = () => {
        setForm(EMPTY_FORM);
        setEditEmp(null);
        setFormError('');
        setShowForm(true);
    };

    const openEdit = (emp, e) => {
        e?.stopPropagation();
        setForm({
            name: emp.name,
            email: emp.email,
            phoneNumber: emp.phone,
            role: emp.role,
            department: emp.dept,
            Location: emp.location,
            joiningDate: emp.joinDate,
            Status: emp.status,
            shiftName: emp.shiftType,
            assignedStartTime: emp.shiftStart,
            assignedEndTime: emp.shiftEnd,
            managerName: emp.managerName || '',
        });
        setEditEmp(emp);
        setFormError('');
        setShowForm(true);
        setViewEmp(null);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditEmp(null);
        setForm(EMPTY_FORM);
        setFormError('');
    };

    const submitForm = async (ev) => {
        ev.preventDefault();

        if (!form.name.trim()) return setFormError('Employee name is required.');
        if (!form.email.trim()) return setFormError('Email address is required.');
        if (!form.phoneNumber.trim()) return setFormError('Phone number is required.');

        setFormError('');
        setSubmitting(true);

        try {
            if (editEmp) {
                // Update existing employee
                const response = await updateEmployee(editEmp.id, form);

                if (response.success) {
                    showToast('Employee updated successfully', 'success');
                    await fetchEmployees();
                    closeForm();
                } else {
                    setFormError(response.message || 'Failed to update employee');
                }
            } else {
                // Create new employee
                const response = await createEmployee(form);

                if (response.success) {
                    showToast('Employee created successfully', 'success');
                    await fetchEmployees();
                    closeForm();
                    resetPage();
                } else {
                    setFormError(response.message || 'Failed to create employee');
                }
            }
        } catch (error) {
            console.error('Submit form error:', error);
            setFormError(error.response?.data?.message || 'An error occurred');
            showToast(error.response?.data?.message || 'Operation failed', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const deleteEmployeeHandler = async (id) => {
        try {
            const response = await deleteEmployee(id);

            if (response.success) {
                showToast('Employee deleted successfully', 'success');
                await fetchEmployees();
                setDeleteConfirm(null);
                setViewEmp(null);
            } else {
                showToast(response.message || 'Failed to delete employee', 'error');
            }
        } catch (error) {
            console.error('Delete employee error:', error);
            showToast(error.response?.data?.message || 'Failed to delete employee', 'error');
        }
    };

    const toggleStatus = async (id, e) => {
        e?.stopPropagation();

        const employee = employees.find(emp => emp.id === id);
        if (!employee) return;

        const newStatus = employee.status === 'Active' ? 'Inactive' : 'Active';

        try {
            const response = await updateEmployee(id, { Status: newStatus });

            if (response.success) {
                showToast(`Employee ${newStatus === 'Active' ? 'activated' : 'deactivated'} successfully`, 'success');
                await fetchEmployees();

                if (viewEmp?.id === id) {
                    setViewEmp(v => ({ ...v, status: newStatus }));
                }
            } else {
                showToast(response.message || 'Failed to update status', 'error');
            }
        } catch (error) {
            console.error('Toggle status error:', error);
            showToast(error.response?.data?.message || 'Failed to update status', 'error');
        }
    };

    const clearFilters = () => {
        setSearch('');
        setFilterDept('all');
        setFilterStatus('all');
        resetPage();
    };

    const hasFilters = search || filterDept !== 'all' || filterStatus !== 'all';

    // ── Input class ───────────────────────────────────────────────────────────
    const inp = "w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-800";

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden text-black">

            {/* Toast Notification */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {/* ════ SIDEBAR ════ */}
            <AdminSidebar
                collapsed={collapsed}
                onToggle={() => setCollapsed(c => !c)}
            />

            {/* ════ MAIN ════ */}
            <div className="flex-1 flex flex-col overflow-hidden">

                {/* ── Topbar ── */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 gap-4 flex-shrink-0 sticky top-0 z-10">
                    <button onClick={() => setCollapsed(c => !c)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <FiMenu className="w-4 h-4 text-gray-600" />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-lg font-bold text-gray-800">Employees</h1>
                        <p className="text-xs text-gray-400">Manage your team members and their profiles</p>
                    </div>
                    <button onClick={openCreate}
                        className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all shadow-md hover:shadow-lg">
                        <FiPlus className="w-4 h-4" /> Add Employee
                    </button>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white text-xs font-bold">A</div>
                </header>

                {/* ── Scrollable body ── */}
                <div className="flex-1 overflow-y-auto">

                    {/* ── Hero ── */}
                    <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-6">
                        <div className="flex items-start justify-between gap-4 mb-5">
                            <div>
                                <h2 className="text-xl font-bold text-white">Team Directory</h2>
                                <p className="text-teal-100 text-sm mt-1">View, add and manage all employees across departments</p>
                            </div>
                            <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                                <button onClick={fetchEmployees} className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                                    <FiRefreshCw className="w-4 h-4" /> Refresh
                                </button>
                            </div>
                        </div>

                        {/* Stat cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                                { label: 'Total Employees', value: total, bg: 'bg-white/20', click: () => { setFilterStatus('all'); resetPage(); } },
                                { label: 'Departments', value: depts.length, bg: 'bg-white/15', click: () => { } },
                                { label: 'Active', value: active, bg: 'bg-green-500/30', click: () => { setFilterStatus('Active'); resetPage(); } },
                                { label: 'Inactive', value: inactive, bg: 'bg-red-500/30', click: () => { setFilterStatus('Inactive'); resetPage(); } },
                            ].map(s => (
                                <button key={s.label} onClick={s.click}
                                    className={`${s.bg} backdrop-blur-sm rounded-xl p-3 border border-white/10 text-left hover:border-white/30 transition-all`}>
                                    <p className="text-2xl font-bold text-white">{s.value}</p>
                                    <p className="text-teal-100 text-xs mt-0.5">{s.label}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-6 space-y-4">

                        {/* ── Department quick filters ── */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-1">
                            <button onClick={() => { setFilterDept('all'); resetPage(); }}
                                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${filterDept === 'all' ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-500 border-gray-200 hover:border-teal-300'}`}>
                                All Depts
                            </button>
                            {DEPT_OPTIONS.filter(d => employees.some(e => e.dept === d)).map(dept => (
                                <button key={dept} onClick={() => { setFilterDept(dept); resetPage(); }}
                                    className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${filterDept === dept ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-500 border-gray-200 hover:border-teal-300'}`}>
                                    <span className={`w-2 h-2 rounded-full ${DEPT_COLORS[dept] || 'bg-gray-400'}`} />
                                    {dept}
                                    <span className="opacity-60">({employees.filter(e => e.dept === dept).length})</span>
                                </button>
                            ))}
                        </div>

                        {/* ── Search + filters toolbar ── */}
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                            <div className="flex flex-wrap gap-3 items-center">
                                <div className="relative flex-1 min-w-[200px] max-w-sm">
                                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                    <input type="text" value={search} onChange={e => { setSearch(e.target.value); resetPage(); }}
                                        placeholder="Search name, email, role..."
                                        className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                                </div>

                                {/* Status tabs */}
                                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg flex-shrink-0">
                                    {['all', 'Active', 'Inactive'].map(s => (
                                        <button key={s} onClick={() => { setFilterStatus(s); resetPage(); }}
                                            className={`px-3 py-1.5 text-xs font-semibold rounded-md capitalize transition-all ${filterStatus === s ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                                            {s === 'all' ? `All (${total})` : s === 'Active' ? `Active (${active})` : `Inactive (${inactive})`}
                                        </button>
                                    ))}
                                </div>

                                {/* View toggle */}
                                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg ml-auto flex-shrink-0">
                                    <button onClick={() => setViewMode('table')} className={`p-1.5 rounded-md transition-all ${viewMode === 'table' ? 'bg-white shadow-sm text-teal-700' : 'text-gray-400 hover:text-gray-600'}`}><FiList className="w-3.5 h-3.5" /></button>
                                    <button onClick={() => setViewMode('card')} className={`p-1.5 rounded-md transition-all ${viewMode === 'card' ? 'bg-white shadow-sm text-teal-700' : 'text-gray-400 hover:text-gray-600'}`}><FiGrid className="w-3.5 h-3.5" /></button>
                                </div>
                            </div>
                        </div>

                        {/* Result + clear */}
                        <div className="flex items-center justify-between px-1">
                            <p className="text-xs text-gray-400">{filtered.length} employee{filtered.length !== 1 ? 's' : ''} found</p>
                            {hasFilters && <button onClick={clearFilters} className="text-xs text-teal-600 hover:text-teal-800 font-medium">Clear filters ×</button>}
                        </div>

                        {/* Loading State */}
                        {loading ? (
                            <div className="bg-white rounded-xl border border-gray-100 shadow-sm py-32">
                                <div className="flex flex-col items-center justify-center">
                                    <FiLoader className="w-10 h-10 text-teal-600 animate-spin mb-4" />
                                    <p className="text-gray-400 text-sm">Loading employees...</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* ══ TABLE VIEW ══ */}
                                {viewMode === 'table' && (
                                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="bg-gray-50 border-b border-gray-100">
                                                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">#</th>
                                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Employee</th>
                                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Department</th>
                                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Shift</th>
                                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Location</th>
                                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50">
                                                    {paginated.length === 0 ? (
                                                        <tr><td colSpan={8} className="text-center py-16">
                                                            <FiUsers className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                                                            <p className="text-gray-400 text-sm">No employees found.</p>
                                                        </td></tr>
                                                    ) : paginated.map((emp, i) => (
                                                        <tr key={emp.id} className="hover:bg-gray-50/80 transition-colors cursor-pointer group" onClick={() => setViewEmp(emp)}>
                                                            <td className="px-5 py-3.5 text-xs text-gray-400 font-mono">{(currentPage - 1) * PER_PAGE + i + 1}</td>
                                                            <td className="px-4 py-3.5">
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`w-9 h-9 rounded-full ${avatarColor(emp.dept)} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                                                                        {emp.avatar}
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm font-semibold text-gray-800">{emp.name}</p>
                                                                        <p className="text-xs text-gray-400 flex items-center gap-1"><FiMail className="w-3 h-3" />{emp.email}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3.5">
                                                                <p className="text-xs font-medium text-gray-700">{emp.role}</p>
                                                            </td>
                                                            <td className="px-4 py-3.5">
                                                                <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                                                                    <span className={`w-2 h-2 rounded-full ${avatarColor(emp.dept)}`} />
                                                                    {emp.dept}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3.5">
                                                                <div>
                                                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${SHIFT_COLORS[emp.shiftType]}`}>
                                                                        {emp.shiftType}
                                                                    </span>
                                                                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                                                        <FiClock className="w-3 h-3" />
                                                                        {formatTime(emp.shiftStart)} - {formatTime(emp.shiftEnd)}
                                                                    </p>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3.5">
                                                                <p className="text-xs text-gray-500 flex items-center gap-1"><FiMapPin className="w-3 h-3" />{emp.location}</p>
                                                            </td>
                                                            <td className="px-4 py-3.5">
                                                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_CFG[emp.status].pill}`}>
                                                                    <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${STATUS_CFG[emp.status].dot}`} />
                                                                    {STATUS_CFG[emp.status].label}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3.5">
                                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                                                                    <button onClick={() => setViewEmp(emp)} title="View" className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"><FiEye className="w-3.5 h-3.5" /></button>
                                                                    <button onClick={(e) => openEdit(emp, e)} title="Edit" className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><FiEdit2 className="w-3.5 h-3.5" /></button>
                                                                    <button onClick={(e) => toggleStatus(emp.id, e)} title={emp.status === 'Active' ? 'Deactivate' : 'Activate'} className={`p-1.5 rounded-lg transition-colors ${emp.status === 'Active' ? 'text-orange-500 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'}`}>
                                                                        {emp.status === 'Active' ? <FiLock className="w-3.5 h-3.5" /> : <FiUnlock className="w-3.5 h-3.5" />}
                                                                    </button>
                                                                    <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm(emp); }} title="Delete" className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><FiTrash2 className="w-3.5 h-3.5" /></button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <Pagination current={currentPage} total={totalPages} filtered={filtered.length} perPage={PER_PAGE} onChange={setCurrentPage} />
                                    </div>
                                )}

                                {/* ══ CARD VIEW ══ */}
                                {viewMode === 'card' && (
                                    <>
                                        {paginated.length === 0 ? (
                                            <div className="bg-white rounded-xl border border-gray-100 text-center py-16 shadow-sm">
                                                <FiUsers className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                                                <p className="text-gray-400 text-sm">No employees found.</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                                                {paginated.map(emp => (
                                                    <div key={emp.id} onClick={() => setViewEmp(emp)}
                                                        className="bg-white rounded-xl border border-gray-200 hover:shadow-lg hover:border-teal-300 transition-all cursor-pointer overflow-hidden group">

                                                        {/* Dept color bar */}
                                                        <div className={`h-1.5 w-full ${avatarColor(emp.dept)}`} />

                                                        <div className="p-5">
                                                            {/* Avatar + status */}
                                                            <div className="flex items-start justify-between mb-4">
                                                                <div className={`w-12 h-12 rounded-2xl ${avatarColor(emp.dept)} flex items-center justify-center text-white text-sm font-bold shadow-md`}>
                                                                    {emp.avatar}
                                                                </div>
                                                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${STATUS_CFG[emp.status].pill}`}>
                                                                    <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${STATUS_CFG[emp.status].dot}`} />
                                                                    {STATUS_CFG[emp.status].label}
                                                                </span>
                                                            </div>

                                                            {/* Name + role */}
                                                            <div className="mb-3">
                                                                <h3 className="text-sm font-bold text-gray-800">{emp.name}</h3>
                                                                <p className="text-xs text-gray-500 mt-0.5">{emp.role}</p>
                                                                <span className="inline-flex items-center gap-1 mt-1.5 text-xs font-medium text-gray-500">
                                                                    <span className={`w-2 h-2 rounded-full ${avatarColor(emp.dept)}`} />
                                                                    {emp.dept}
                                                                </span>
                                                            </div>

                                                            {/* Shift info */}
                                                            <div className="bg-gray-50 rounded-lg p-2.5 mb-3 border border-gray-100">
                                                                <div className="flex items-center justify-between mb-1">
                                                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${SHIFT_COLORS[emp.shiftType]}`}>
                                                                        {emp.shiftType}
                                                                    </span>
                                                                </div>
                                                                <p className="text-xs text-gray-600 flex items-center gap-1.5">
                                                                    <FiClock className="w-3 h-3" />
                                                                    {formatTime(emp.shiftStart)} - {formatTime(emp.shiftEnd)}
                                                                </p>
                                                            </div>

                                                            {/* Contact */}
                                                            <div className="space-y-1.5 mb-4">
                                                                <p className="text-xs text-gray-400 flex items-center gap-1.5"><FiMail className="w-3 h-3 flex-shrink-0" /><span className="truncate">{emp.email}</span></p>
                                                                <p className="text-xs text-gray-400 flex items-center gap-1.5"><FiMapPin className="w-3 h-3 flex-shrink-0" />{emp.location}</p>
                                                                <p className="text-xs text-gray-400 flex items-center gap-1.5"><FiCalendar className="w-3 h-3 flex-shrink-0" />Joined {formatDate(emp.joinDate)}</p>
                                                            </div>

                                                            {/* Stats */}
                                                            <div className="grid grid-cols-2 gap-2">
                                                                <div className="bg-teal-50 rounded-lg p-2 text-center border border-teal-100">
                                                                    <p className="text-lg font-bold text-teal-700">{emp.logsCount}</p>
                                                                    <p className="text-xs text-teal-500">Logs</p>
                                                                </div>
                                                                <div className="bg-blue-50 rounded-lg p-2 text-center border border-blue-100">
                                                                    <p className="text-lg font-bold text-blue-700">{emp.tasksCount}</p>
                                                                    <p className="text-xs text-blue-500">Tasks</p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Card footer actions */}
                                                        <div className="px-5 py-2.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity"
                                                            onClick={e => e.stopPropagation()}>
                                                            <button onClick={(e) => openEdit(emp, e)} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors">
                                                                <FiEdit2 className="w-3 h-3" /> Edit
                                                            </button>
                                                            <button onClick={(e) => toggleStatus(emp.id, e)} className={`flex items-center gap-1 text-xs font-medium transition-colors ${emp.status === 'Active' ? 'text-orange-500 hover:text-orange-700' : 'text-green-600 hover:text-green-800'}`}>
                                                                {emp.status === 'Active' ? <><FiLock className="w-3 h-3" /> Deactivate</> : <><FiUnlock className="w-3 h-3" /> Activate</>}
                                                            </button>
                                                            <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm(emp); }} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium transition-colors">
                                                                <FiTrash2 className="w-3 h-3" /> Delete
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <Pagination current={currentPage} total={totalPages} filtered={filtered.length} perPage={PER_PAGE} onChange={setCurrentPage} isCard />
                                    </>
                                )}
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
                                <h3 className="text-lg font-bold text-white">{editEmp ? 'Edit Employee' : 'Add New Employee'}</h3>
                                <p className="text-teal-100 text-xs mt-0.5">{editEmp ? 'Update employee information' : 'Fill in the details to add a new team member'}</p>
                            </div>
                            <button onClick={closeForm} className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
                                <FiX className="w-4 h-4 text-white" />
                            </button>
                        </div>

                        <form onSubmit={submitForm} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
                            {formError && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-700 text-sm">
                                    <FiAlertCircle className="w-4 h-4 flex-shrink-0" />{formError}
                                </div>
                            )}

                            {/* Name + Email */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field label="Full Name" required>
                                    <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                        placeholder="e.g., Rahul Sharma" className={inp} />
                                </Field>
                                <Field label="Email Address" required>
                                    <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                        placeholder="rahul@worktrack.in" className={inp} />
                                </Field>
                            </div>

                            {/* Phone + Location */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field label="Phone Number" required>
                                    <input type="tel" value={form.phoneNumber} onChange={e => setForm(f => ({ ...f, phoneNumber: e.target.value }))}
                                        placeholder="+91 98200 00000" className={inp} />
                                </Field>
                                <Field label="Location">
                                    <input type="text" value={form.Location} onChange={e => setForm(f => ({ ...f, Location: e.target.value }))}
                                        placeholder="e.g., Mumbai" className={inp} />
                                </Field>
                            </div>

                            {/* Role + Dept */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field label="Role / Designation" required>
                                    <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className={inp + ' appearance-none cursor-pointer'}>
                                        {ROLE_OPTIONS.map(r => <option key={r}>{r}</option>)}
                                    </select>
                                </Field>
                                <Field label="Department" required>
                                    <select value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} className={inp + ' appearance-none cursor-pointer'}>
                                        {DEPT_OPTIONS.map(d => <option key={d}>{d}</option>)}
                                    </select>
                                </Field>
                            </div>

                            {/* Shift Type + Join Date */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field label="Shift Type" required>
                                    <select value={form.shiftName} onChange={e => setForm(f => ({ ...f, shiftName: e.target.value }))} className={inp + ' appearance-none cursor-pointer'}>
                                        {SHIFT_TYPES.map(s => <option key={s}>{s}</option>)}
                                    </select>
                                </Field>
                                <Field label="Joining Date" required>
                                    <input type="date" value={form.joiningDate} onChange={e => setForm(f => ({ ...f, joiningDate: e.target.value }))} className={inp} />
                                </Field>
                            </div>

                            {/* Shift Timings */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field label="Shift Start Time" required>
                                    <input type="time" value={form.assignedStartTime} onChange={e => setForm(f => ({ ...f, assignedStartTime: e.target.value }))} className={inp} />
                                </Field>
                                <Field label="Shift End Time" required>
                                    <input type="time" value={form.assignedEndTime} onChange={e => setForm(f => ({ ...f, assignedEndTime: e.target.value }))} className={inp} />
                                </Field>
                            </div>

                            {/* Manager Name */}
                            <Field label="Manager Name">
                                <input type="text" value={form.managerName} onChange={e => setForm(f => ({ ...f, managerName: e.target.value }))}
                                    placeholder="e.g., John Doe" className={inp} />
                            </Field>

                            {/* Status */}
                            <Field label="Status">
                                <div className="flex gap-3 pt-1">
                                    {STATUS_OPTIONS.map(s => (
                                        <button key={s} type="button" onClick={() => setForm(f => ({ ...f, Status: s }))}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg border transition-all capitalize ${form.Status === s ? STATUS_CFG[s].pill : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}>
                                            <span className={`w-2 h-2 rounded-full ${STATUS_CFG[s].dot}`} />{STATUS_CFG[s].label}
                                        </button>
                                    ))}
                                </div>
                            </Field>

                            {/* Preview card */}
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                <div className="flex items-center gap-4 mb-3">
                                    <div className={`w-12 h-12 rounded-2xl ${avatarColor(form.department)} flex items-center justify-center text-white text-sm font-bold shadow-md flex-shrink-0`}>
                                        {form.name ? getInitials(form.name) : '??'}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-gray-800">{form.name || 'Employee Name'}</p>
                                        <p className="text-xs text-gray-500">{form.role} · {form.department}</p>
                                        <p className="text-xs text-gray-400">{form.email || 'email@worktrack.in'}</p>
                                    </div>
                                </div>
                                <div className="bg-white rounded-lg p-2.5 border border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${SHIFT_COLORS[form.shiftName]}`}>
                                            {form.shiftName} Shift
                                        </span>
                                        <p className="text-xs text-gray-600 flex items-center gap-1">
                                            <FiClock className="w-3 h-3" />
                                            {formatTime(form.assignedStartTime)} - {formatTime(form.assignedEndTime)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={closeForm} className="flex-1 px-5 py-2.5 border-2 border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 text-sm transition-all" disabled={submitting}>
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-semibold py-2.5 px-5 rounded-lg text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" disabled={submitting}>
                                    {submitting ? (
                                        <>
                                            <FiLoader className="w-4 h-4 animate-spin" />
                                            {editEmp ? 'Updating...' : 'Creating...'}
                                        </>
                                    ) : (
                                        <>
                                            <FiCheck className="w-4 h-4" />
                                            {editEmp ? 'Update Employee' : 'Add Employee'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ════ VIEW MODAL ════ */}
            {viewEmp && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-8">

                        {/* Header */}
                        <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-5 rounded-t-2xl">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className={`w-14 h-14 rounded-2xl ${avatarColor(viewEmp.dept)} flex items-center justify-center text-white text-lg font-bold shadow-lg flex-shrink-0`}>
                                        {viewEmp.avatar}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">{viewEmp.name}</h3>
                                        <p className="text-teal-100 text-sm">{viewEmp.role}</p>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <span className="flex items-center gap-1 text-xs text-teal-200">
                                                <span className={`w-2 h-2 rounded-full ${avatarColor(viewEmp.dept)}`} />{viewEmp.dept}
                                            </span>
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${STATUS_CFG[viewEmp.status].pill}`}>
                                                {STATUS_CFG[viewEmp.status].label}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setViewEmp(null)} className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex-shrink-0">
                                    <FiX className="w-4 h-4 text-white" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-5">
                            {/* Stats row */}
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { label: 'Work Logs', value: viewEmp.logsCount, color: 'text-teal-700', bg: 'bg-teal-50', border: 'border-teal-100' },
                                    { label: 'Tasks', value: viewEmp.tasksCount, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-100' },
                                    {
                                        label: 'Dept Rank', value: '#' + (employees.filter(e => e.dept === viewEmp.dept).sort((a, b) => b.logsCount - a.logsCount).findIndex(e => e.id === viewEmp.id) + 1),
                                        color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-100'
                                    },
                                ].map(s => (
                                    <div key={s.label} className={`${s.bg} border ${s.border} rounded-xl p-3 text-center`}>
                                        <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Shift Information */}
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                                        <FiClock className="w-3.5 h-3.5" />
                                        Shift Schedule
                                    </p>
                                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${SHIFT_COLORS[viewEmp.shiftType]}`}>
                                        {viewEmp.shiftType}
                                    </span>
                                </div>
                                <div className="bg-white rounded-lg p-3 border border-gray-200">
                                    <div className="flex items-center justify-center gap-3">
                                        <div className="text-center">
                                            <p className="text-xs text-gray-400 mb-1">Start</p>
                                            <p className="text-lg font-bold text-gray-800">{formatTime(viewEmp.shiftStart)}</p>
                                        </div>
                                        <div className="w-8 h-0.5 bg-gray-300 rounded"></div>
                                        <div className="text-center">
                                            <p className="text-xs text-gray-400 mb-1">End</p>
                                            <p className="text-lg font-bold text-gray-800">{formatTime(viewEmp.shiftEnd)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Contact info */}
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Contact Information</p>
                                {[
                                    { icon: FiMail, val: viewEmp.email },
                                    { icon: FiPhone, val: viewEmp.phone },
                                    { icon: FiMapPin, val: viewEmp.location },
                                    { icon: FiCalendar, val: `Joined ${formatDate(viewEmp.joinDate)}` },
                                ].map(({ icon: Icon, val }) => (
                                    <div key={val} className="flex items-center gap-3 text-sm text-gray-700">
                                        <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center border border-gray-200 flex-shrink-0">
                                            <Icon className="w-3.5 h-3.5 text-teal-600" />
                                        </div>
                                        <span className="text-sm">{val}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex gap-2">
                            <button onClick={() => setViewEmp(null)} className="flex-1 border-2 border-gray-200 text-gray-700 font-semibold py-2.5 rounded-lg hover:bg-gray-100 text-sm transition-all">Close</button>
                            <button onClick={(e) => openEdit(viewEmp, e)} className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 shadow-md transition-all">
                                <FiEdit2 className="w-4 h-4" /> Edit
                            </button>
                            <button onClick={(e) => toggleStatus(viewEmp.id, e)} className={`flex-1 font-semibold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 transition-all ${viewEmp.status === 'Active' ? 'bg-orange-100 hover:bg-orange-200 text-orange-700 border border-orange-200' : 'bg-green-100 hover:bg-green-200 text-green-700 border border-green-200'}`}>
                                {viewEmp.status === 'Active' ? <><FiLock className="w-4 h-4" /> Deactivate</> : <><FiUnlock className="w-4 h-4" /> Activate</>}
                            </button>
                            <button onClick={() => { setDeleteConfirm(viewEmp); setViewEmp(null); }} className="p-2.5 text-red-500 hover:bg-red-50 border-2 border-red-200 rounded-lg transition-all">
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
                        <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                            <FiTrash2 className="w-6 h-6 text-red-500" />
                        </div>
                        <h3 className="text-base font-bold text-gray-800 text-center mb-1">Remove Employee?</h3>
                        <p className="text-sm text-gray-500 text-center mb-1">
                            <span className="font-semibold text-gray-700">{deleteConfirm.name}</span>
                        </p>
                        <p className="text-xs text-gray-400 text-center mb-5">{deleteConfirm.role} · {deleteConfirm.dept}</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteConfirm(null)} className="flex-1 border-2 border-gray-200 text-gray-700 font-semibold py-2.5 rounded-lg hover:bg-gray-50 text-sm transition-all">Cancel</button>
                            <button onClick={() => deleteEmployeeHandler(deleteConfirm.id)} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-lg text-sm shadow-md transition-all">Remove</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Pagination ────────────────────────────────────────────────────────────────
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