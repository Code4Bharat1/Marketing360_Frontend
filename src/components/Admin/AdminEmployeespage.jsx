'use client';

import { useState, useMemo } from 'react';
import {
    FiPlus, FiX, FiCheck, FiEdit2, FiTrash2, FiEye,
    FiSearch, FiMenu, FiBell, FiMail, FiPhone,
    FiMapPin, FiCalendar, FiUsers, FiChevronLeft,
    FiChevronRight, FiAlertCircle, FiGrid, FiList,
    FiBriefcase, FiShield, FiUserCheck, FiUserX,
    FiDownload, FiRefreshCw, FiLock, FiUnlock, FiClock
} from 'react-icons/fi';
import AdminSidebar from './Admimsidebar';

// ── Constants ────────────────────────────────────────────────────────────────
const PER_PAGE = 8;

const DEPT_COLORS = {
    Engineering: 'bg-teal-500',
    Design:      'bg-blue-500',
    Data:        'bg-orange-500',
    Operations:  'bg-purple-500',
    Marketing:   'bg-rose-500',
    QA:          'bg-emerald-500',
    HR:          'bg-amber-500',
    Finance:     'bg-cyan-500',
};

const SHIFT_TYPES = ['Morning', 'Afternoon', 'Night', 'Flexible'];
const SHIFT_COLORS = {
    Morning:   'bg-amber-100 text-amber-700 border-amber-200',
    Afternoon: 'bg-orange-100 text-orange-700 border-orange-200',
    Night:     'bg-indigo-100 text-indigo-700 border-indigo-200',
    Flexible:  'bg-purple-100 text-purple-700 border-purple-200',
};

const ROLE_OPTIONS   = ['Software Engineer', 'Senior Engineer', 'UI/UX Designer', 'Data Analyst', 'Operations Manager', 'Marketing Executive', 'QA Engineer', 'HR Executive', 'Finance Analyst', 'Team Lead', 'Project Manager'];
const DEPT_OPTIONS   = Object.keys(DEPT_COLORS);
const STATUS_OPTIONS = ['active', 'inactive'];

const STATUS_CFG = {
    active:   { label: 'Active',   pill: 'bg-green-100 text-green-700 border-green-200',  dot: 'bg-green-500'  },
    inactive: { label: 'Inactive', pill: 'bg-gray-100 text-gray-500 border-gray-200',     dot: 'bg-gray-400'   },
};

const EMPTY_FORM = {
    name: '', email: '', phone: '', role: 'Software Engineer',
    dept: 'Engineering', location: 'Mumbai', joinDate: new Date().toISOString().split('T')[0],
    status: 'active', avatar: '', shiftType: 'Morning', shiftStart: '09:00', shiftEnd: '18:00',
};

// ── Mock Data ────────────────────────────────────────────────────────────────
const INITIAL_EMPLOYEES = [
    { id: 1,  name: 'Rahul Sharma',   email: 'rahul.sharma@worktrack.in',   phone: '+91 98200 11111', role: 'Senior Engineer',      dept: 'Engineering', location: 'Mumbai',    joinDate: '2022-03-15', status: 'active',   avatar: 'RS', logsCount: 48, tasksCount: 12, shiftType: 'Morning',   shiftStart: '09:00', shiftEnd: '18:00' },
    { id: 2,  name: 'Priya Patel',    email: 'priya.patel@worktrack.in',    phone: '+91 98200 22222', role: 'UI/UX Designer',        dept: 'Design',      location: 'Bangalore', joinDate: '2022-07-01', status: 'active',   avatar: 'PP', logsCount: 39, tasksCount: 8,  shiftType: 'Flexible',  shiftStart: '10:00', shiftEnd: '19:00' },
    { id: 3,  name: 'Amit Kumar',     email: 'amit.kumar@worktrack.in',     phone: '+91 98200 33333', role: 'Data Analyst',          dept: 'Data',        location: 'Hyderabad', joinDate: '2021-11-20', status: 'active',   avatar: 'AK', logsCount: 52, tasksCount: 6,  shiftType: 'Morning',   shiftStart: '08:30', shiftEnd: '17:30' },
    { id: 4,  name: 'Sneha Reddy',    email: 'sneha.reddy@worktrack.in',    phone: '+91 98200 44444', role: 'Software Engineer',     dept: 'Engineering', location: 'Pune',      joinDate: '2023-01-10', status: 'active',   avatar: 'SR', logsCount: 31, tasksCount: 9,  shiftType: 'Afternoon', shiftStart: '13:00', shiftEnd: '22:00' },
    { id: 5,  name: 'Vikram Singh',   email: 'vikram.singh@worktrack.in',   phone: '+91 98200 55555', role: 'Operations Manager',    dept: 'Operations',  location: 'Delhi',     joinDate: '2020-06-05', status: 'active',   avatar: 'VS', logsCount: 60, tasksCount: 7,  shiftType: 'Morning',   shiftStart: '09:00', shiftEnd: '18:00' },
    { id: 6,  name: 'Meera Joshi',    email: 'meera.joshi@worktrack.in',    phone: '+91 98200 66666', role: 'Marketing Executive',   dept: 'Marketing',   location: 'Chennai',   joinDate: '2022-09-18', status: 'active',   avatar: 'MJ', logsCount: 44, tasksCount: 5,  shiftType: 'Flexible',  shiftStart: '10:00', shiftEnd: '19:00' },
    { id: 7,  name: 'Karan Mehta',    email: 'karan.mehta@worktrack.in',    phone: '+91 98200 77777', role: 'Software Engineer',     dept: 'Engineering', location: 'Mumbai',    joinDate: '2023-03-22', status: 'active',   avatar: 'KM', logsCount: 27, tasksCount: 11, shiftType: 'Night',     shiftStart: '22:00', shiftEnd: '07:00' },
    { id: 8,  name: 'Divya Nair',     email: 'divya.nair@worktrack.in',     phone: '+91 98200 88888', role: 'QA Engineer',           dept: 'QA',          location: 'Bangalore', joinDate: '2022-05-30', status: 'active',   avatar: 'DN', logsCount: 36, tasksCount: 4,  shiftType: 'Morning',   shiftStart: '09:00', shiftEnd: '18:00' },
    { id: 9,  name: 'Arjun Nair',     email: 'arjun.nair@worktrack.in',     phone: '+91 98200 99999', role: 'Senior Engineer',       dept: 'Engineering', location: 'Hyderabad', joinDate: '2021-08-14', status: 'active',   avatar: 'AN', logsCount: 55, tasksCount: 14, shiftType: 'Morning',   shiftStart: '09:00', shiftEnd: '18:00' },
    { id: 10, name: 'Kavya Iyer',     email: 'kavya.iyer@worktrack.in',     phone: '+91 98201 10000', role: 'UI/UX Designer',        dept: 'Design',      location: 'Pune',      joinDate: '2023-06-01', status: 'active',   avatar: 'KI', logsCount: 18, tasksCount: 3,  shiftType: 'Afternoon', shiftStart: '14:00', shiftEnd: '23:00' },
    { id: 11, name: 'Ravi Verma',     email: 'ravi.verma@worktrack.in',     phone: '+91 98201 11111', role: 'Operations Manager',    dept: 'Operations',  location: 'Delhi',     joinDate: '2020-02-28', status: 'inactive', avatar: 'RV', logsCount: 72, tasksCount: 0,  shiftType: 'Morning',   shiftStart: '09:00', shiftEnd: '18:00' },
    { id: 12, name: 'Pooja Shah',     email: 'pooja.shah@worktrack.in',     phone: '+91 98201 12222', role: 'Marketing Executive',   dept: 'Marketing',   location: 'Mumbai',    joinDate: '2021-12-05', status: 'inactive', avatar: 'PS', logsCount: 43, tasksCount: 0,  shiftType: 'Flexible',  shiftStart: '10:00', shiftEnd: '19:00' },
    { id: 13, name: 'Nikhil Desai',   email: 'nikhil.desai@worktrack.in',   phone: '+91 98201 13333', role: 'Finance Analyst',       dept: 'Finance',     location: 'Ahmedabad', joinDate: '2022-04-11', status: 'active',   avatar: 'ND', logsCount: 29, tasksCount: 2,  shiftType: 'Morning',   shiftStart: '09:00', shiftEnd: '18:00' },
    { id: 14, name: 'Anjali Gupta',   email: 'anjali.gupta@worktrack.in',   phone: '+91 98201 14444', role: 'HR Executive',          dept: 'HR',          location: 'Chennai',   joinDate: '2021-07-19', status: 'active',   avatar: 'AG', logsCount: 38, tasksCount: 1,  shiftType: 'Morning',   shiftStart: '09:00', shiftEnd: '18:00' },
    { id: 15, name: 'Siddharth Rao',  email: 'siddharth.rao@worktrack.in',  phone: '+91 98201 15555', role: 'Team Lead',             dept: 'Engineering', location: 'Bangalore', joinDate: '2019-10-07', status: 'active',   avatar: 'SR', logsCount: 88, tasksCount: 18, shiftType: 'Flexible',  shiftStart: '10:00', shiftEnd: '19:00' },
];

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

export default function EmployeesPage() {
    const [employees, setEmployees]       = useState(INITIAL_EMPLOYEES);
    const [collapsed, setCollapsed]       = useState(false);

    // modals
    const [showForm, setShowForm]         = useState(false);
    const [editEmp, setEditEmp]           = useState(null);
    const [viewEmp, setViewEmp]           = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    // filters
    const [search, setSearch]             = useState('');
    const [filterDept, setFilterDept]     = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [viewMode, setViewMode]         = useState('table');
    const [currentPage, setCurrentPage]   = useState(1);

    // form
    const [form, setForm]                 = useState(EMPTY_FORM);
    const [formError, setFormError]       = useState('');

    // ── Stats ─────────────────────────────────────────────────────────────────
    const total    = employees.length;
    const active   = employees.filter(e => e.status === 'active').length;
    const inactive = employees.filter(e => e.status === 'inactive').length;
    const depts    = [...new Set(employees.map(e => e.dept))];

    // ── Filtered + paginated ──────────────────────────────────────────────────
    const filtered = useMemo(() => employees.filter(e => {
        const q = search.toLowerCase();
        const matchQ = !q || e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q) || e.role.toLowerCase().includes(q) || e.dept.toLowerCase().includes(q);
        const matchD = filterDept   === 'all' || e.dept   === filterDept;
        const matchS = filterStatus === 'all' || e.status === filterStatus;
        return matchQ && matchD && matchS;
    }), [employees, search, filterDept, filterStatus]);

    const totalPages = Math.ceil(filtered.length / PER_PAGE);
    const paginated  = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

    const resetPage  = () => setCurrentPage(1);

    // ── CRUD ──────────────────────────────────────────────────────────────────
    const openCreate = () => { setForm(EMPTY_FORM); setEditEmp(null); setFormError(''); setShowForm(true); };

    const openEdit = (emp, e) => {
        e?.stopPropagation();
        setForm({
            name: emp.name, email: emp.email, phone: emp.phone,
            role: emp.role, dept: emp.dept, location: emp.location,
            joinDate: emp.joinDate, status: emp.status, avatar: emp.avatar,
            shiftType: emp.shiftType, shiftStart: emp.shiftStart, shiftEnd: emp.shiftEnd,
        });
        setEditEmp(emp); setFormError(''); setShowForm(true); setViewEmp(null);
    };

    const closeForm = () => { setShowForm(false); setEditEmp(null); setForm(EMPTY_FORM); setFormError(''); };

    const submitForm = (ev) => {
        ev.preventDefault();
        if (!form.name.trim())  return setFormError('Employee name is required.');
        if (!form.email.trim()) return setFormError('Email address is required.');
        if (!form.phone.trim()) return setFormError('Phone number is required.');
        setFormError('');

        const avatar = getInitials(form.name);
        if (editEmp) {
            setEmployees(prev => prev.map(e => e.id === editEmp.id ? { ...e, ...form, avatar } : e));
        } else {
            setEmployees(prev => [{
                id: Date.now(), ...form, avatar,
                logsCount: 0, tasksCount: 0,
            }, ...prev]);
            resetPage();
        }
        closeForm();
    };

    const deleteEmployee = (id) => { setEmployees(prev => prev.filter(e => e.id !== id)); setDeleteConfirm(null); setViewEmp(null); };

    const toggleStatus = (id, e) => {
        e?.stopPropagation();
        setEmployees(prev => prev.map(emp => emp.id === id ? { ...emp, status: emp.status === 'active' ? 'inactive' : 'active' } : emp));
        if (viewEmp?.id === id) setViewEmp(v => ({ ...v, status: v.status === 'active' ? 'inactive' : 'active' }));
    };

    const clearFilters = () => { setSearch(''); setFilterDept('all'); setFilterStatus('all'); resetPage(); };
    const hasFilters   = search || filterDept !== 'all' || filterStatus !== 'all';

    // ── Input class ───────────────────────────────────────────────────────────
    const inp = "w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-800";

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
                <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 gap-4 flex-shrink-0 sticky top-0 z-10">
                    <button onClick={() => setCollapsed(c => !c)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <FiMenu className="w-4 h-4 text-gray-600" />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-lg font-bold text-gray-800">Employees</h1>
                        <p className="text-xs text-gray-400">Manage your team members and their profiles</p>
                    </div>
                    {/* <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <FiBell className="w-4 h-4 text-gray-600" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
                    </button> */}
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
                                {/* <button className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                                    <FiDownload className="w-4 h-4" /> Export
                                </button> */}
                                <button onClick={() => setEmployees(INITIAL_EMPLOYEES)} className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                                    <FiRefreshCw className="w-4 h-4" /> Reset
                                </button>
                            </div>
                        </div>

                        {/* Stat cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                                { label: 'Total Employees', value: total,    bg: 'bg-white/20',       click: () => { setFilterStatus('all'); resetPage(); } },
                                { label: 'Departments',     value: depts.length, bg: 'bg-white/15',   click: () => {} },
                                { label: 'Active',          value: active,   bg: 'bg-green-500/30',   click: () => { setFilterStatus('active'); resetPage(); } },
                                { label: 'Inactive',        value: inactive, bg: 'bg-red-500/30',     click: () => { setFilterStatus('inactive'); resetPage(); } },
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
                                    {['all', 'active', 'inactive'].map(s => (
                                        <button key={s} onClick={() => { setFilterStatus(s); resetPage(); }}
                                            className={`px-3 py-1.5 text-xs font-semibold rounded-md capitalize transition-all ${filterStatus === s ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                                            {s === 'all' ? `All (${total})` : s === 'active' ? `Active (${active})` : `Inactive (${inactive})`}
                                        </button>
                                    ))}
                                </div>

                                {/* View toggle */}
                                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg ml-auto flex-shrink-0">
                                    <button onClick={() => setViewMode('table')} className={`p-1.5 rounded-md transition-all ${viewMode === 'table' ? 'bg-white shadow-sm text-teal-700' : 'text-gray-400 hover:text-gray-600'}`}><FiList className="w-3.5 h-3.5" /></button>
                                    <button onClick={() => setViewMode('card')}  className={`p-1.5 rounded-md transition-all ${viewMode === 'card'  ? 'bg-white shadow-sm text-teal-700' : 'text-gray-400 hover:text-gray-600'}`}><FiGrid className="w-3.5 h-3.5" /></button>
                                </div>
                            </div>
                        </div>

                        {/* Result + clear */}
                        <div className="flex items-center justify-between px-1">
                            <p className="text-xs text-gray-400">{filtered.length} employee{filtered.length !== 1 ? 's' : ''} found</p>
                            {hasFilters && <button onClick={clearFilters} className="text-xs text-teal-600 hover:text-teal-800 font-medium">Clear filters ×</button>}
                        </div>

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
                                                            <button onClick={(e) => toggleStatus(emp.id, e)} title={emp.status === 'active' ? 'Deactivate' : 'Activate'} className={`p-1.5 rounded-lg transition-colors ${emp.status === 'active' ? 'text-orange-500 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'}`}>
                                                                {emp.status === 'active' ? <FiLock className="w-3.5 h-3.5" /> : <FiUnlock className="w-3.5 h-3.5" />}
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
                                                    <button onClick={(e) => toggleStatus(emp.id, e)} className={`flex items-center gap-1 text-xs font-medium transition-colors ${emp.status === 'active' ? 'text-orange-500 hover:text-orange-700' : 'text-green-600 hover:text-green-800'}`}>
                                                        {emp.status === 'active' ? <><FiLock className="w-3 h-3" /> Deactivate</> : <><FiUnlock className="w-3 h-3" /> Activate</>}
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
                                    <input type="text" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
                                        placeholder="e.g., Rahul Sharma" className={inp} />
                                </Field>
                                <Field label="Email Address" required>
                                    <input type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))}
                                        placeholder="rahul@worktrack.in" className={inp} />
                                </Field>
                            </div>

                            {/* Phone + Location */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field label="Phone Number" required>
                                    <input type="tel" value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))}
                                        placeholder="+91 98200 00000" className={inp} />
                                </Field>
                                <Field label="Location">
                                    <input type="text" value={form.location} onChange={e => setForm(f => ({...f, location: e.target.value}))}
                                        placeholder="e.g., Mumbai" className={inp} />
                                </Field>
                            </div>

                            {/* Role + Dept */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field label="Role / Designation" required>
                                    <select value={form.role} onChange={e => setForm(f => ({...f, role: e.target.value}))} className={inp + ' appearance-none cursor-pointer'}>
                                        {ROLE_OPTIONS.map(r => <option key={r}>{r}</option>)}
                                    </select>
                                </Field>
                                <Field label="Department" required>
                                    <select value={form.dept} onChange={e => setForm(f => ({...f, dept: e.target.value}))} className={inp + ' appearance-none cursor-pointer'}>
                                        {DEPT_OPTIONS.map(d => <option key={d}>{d}</option>)}
                                    </select>
                                </Field>
                            </div>

                            {/* Shift Type + Join Date */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field label="Shift Type" required>
                                    <select value={form.shiftType} onChange={e => setForm(f => ({...f, shiftType: e.target.value}))} className={inp + ' appearance-none cursor-pointer'}>
                                        {SHIFT_TYPES.map(s => <option key={s}>{s}</option>)}
                                    </select>
                                </Field>
                                <Field label="Joining Date" required>
                                    <input type="date" value={form.joinDate} onChange={e => setForm(f => ({...f, joinDate: e.target.value}))} className={inp} />
                                </Field>
                            </div>

                            {/* Shift Timings */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field label="Shift Start Time" required>
                                    <input type="time" value={form.shiftStart} onChange={e => setForm(f => ({...f, shiftStart: e.target.value}))} className={inp} />
                                </Field>
                                <Field label="Shift End Time" required>
                                    <input type="time" value={form.shiftEnd} onChange={e => setForm(f => ({...f, shiftEnd: e.target.value}))} className={inp} />
                                </Field>
                            </div>

                            {/* Status */}
                            <Field label="Status">
                                <div className="flex gap-3 pt-1">
                                    {STATUS_OPTIONS.map(s => (
                                        <button key={s} type="button" onClick={() => setForm(f => ({...f, status: s}))}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg border transition-all capitalize ${form.status === s ? STATUS_CFG[s].pill : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}>
                                            <span className={`w-2 h-2 rounded-full ${STATUS_CFG[s].dot}`} />{STATUS_CFG[s].label}
                                        </button>
                                    ))}
                                </div>
                            </Field>

                            {/* Preview card */}
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                <div className="flex items-center gap-4 mb-3">
                                    <div className={`w-12 h-12 rounded-2xl ${avatarColor(form.dept)} flex items-center justify-center text-white text-sm font-bold shadow-md flex-shrink-0`}>
                                        {form.name ? getInitials(form.name) : '??'}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-gray-800">{form.name || 'Employee Name'}</p>
                                        <p className="text-xs text-gray-500">{form.role} · {form.dept}</p>
                                        <p className="text-xs text-gray-400">{form.email || 'email@worktrack.in'}</p>
                                    </div>
                                </div>
                                <div className="bg-white rounded-lg p-2.5 border border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${SHIFT_COLORS[form.shiftType]}`}>
                                            {form.shiftType} Shift
                                        </span>
                                        <p className="text-xs text-gray-600 flex items-center gap-1">
                                            <FiClock className="w-3 h-3" />
                                            {formatTime(form.shiftStart)} - {formatTime(form.shiftEnd)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={closeForm} className="flex-1 px-5 py-2.5 border-2 border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 text-sm transition-all">
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-semibold py-2.5 px-5 rounded-lg text-sm transition-all shadow-md flex items-center justify-center gap-2">
                                    <FiCheck className="w-4 h-4" />{editEmp ? 'Update Employee' : 'Add Employee'}
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
                                    { label: 'Work Logs',  value: viewEmp.logsCount,  color: 'text-teal-700',  bg: 'bg-teal-50',  border: 'border-teal-100'  },
                                    { label: 'Tasks',      value: viewEmp.tasksCount, color: 'text-blue-700',  bg: 'bg-blue-50',  border: 'border-blue-100'  },
                                    { label: 'Dept Rank',  value: '#' + (employees.filter(e => e.dept === viewEmp.dept).sort((a, b) => b.logsCount - a.logsCount).findIndex(e => e.id === viewEmp.id) + 1),
                                      color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-100' },
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
                                    { icon: FiMail,     val: viewEmp.email    },
                                    { icon: FiPhone,    val: viewEmp.phone    },
                                    { icon: FiMapPin,   val: viewEmp.location },
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
                            <button onClick={(e) => toggleStatus(viewEmp.id, e)} className={`flex-1 font-semibold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 transition-all ${viewEmp.status === 'active' ? 'bg-orange-100 hover:bg-orange-200 text-orange-700 border border-orange-200' : 'bg-green-100 hover:bg-green-200 text-green-700 border border-green-200'}`}>
                                {viewEmp.status === 'active' ? <><FiLock className="w-4 h-4" /> Deactivate</> : <><FiUnlock className="w-4 h-4" /> Activate</>}
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
                            <button onClick={() => deleteEmployee(deleteConfirm.id)} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-lg text-sm shadow-md transition-all">Remove</button>
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