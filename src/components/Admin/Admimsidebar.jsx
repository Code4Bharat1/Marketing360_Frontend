'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    FiBarChart2, FiFileText, FiUsers, FiActivity,
    FiSettings, FiLogOut, FiCheckSquare
} from 'react-icons/fi';
import { BiPackage } from 'react-icons/bi';

const navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: FiBarChart2, badge: null },
    { key: 'work', label: 'Work Logs', icon: FiFileText, badge: 3 },
    { key: 'assign-tasks', label: 'Assign Tasks', icon: FiCheckSquare, badge: null },
    { key: 'employees', label: 'Employees', icon: FiUsers, badge: null },
    // { key: 'reports', label: 'Reports', icon: FiActivity, badge: null },
    // { key: 'settings', label: 'Settings', icon: FiSettings, badge: null },
];

export default function AdminSidebar({
    activeNav = 'dashboard',
    onNavigate,
    collapsed = false,
    onToggle
}) {
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const handleLogout = () => {
        setShowLogoutModal(false);
        // 👉 Yahan apna actual logout logic add karo
        // example:
        router.push('/');
        console.log('Logged out');
    };

    return (
        <>
            <aside
                className={`
                    ${collapsed ? 'w-16' : 'w-60'}
                    flex-shrink-0 bg-white border-r border-gray-200
                    flex flex-col transition-all duration-300 z-20
                    h-screen sticky top-0
                `}
            >
                {/* ── Logo ── */}
                <div className="h-16 flex items-center px-4 border-b border-gray-200 gap-3 overflow-hidden flex-shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-md">
                        <BiPackage className="w-4 h-4 text-white" />
                    </div>
                    {!collapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-800 truncate">WorkTrack</p>
                            <p className="text-xs text-gray-400">Admin Panel</p>
                        </div>
                    )}
                </div>

                {/* ── Nav ── */}
                <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
                    {navItems.map(({ key, label, icon: Icon, badge }) => {
                        const isActive = activeNav === key;

                        return (
                            <Link
                                key={key}
                                href={`/admin/${key}`}
                                onClick={() => onNavigate?.(key)}
                                className={`
                                    relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                                    transition-all duration-150 text-sm font-medium
                                    ${isActive
                                        ? 'bg-teal-50 text-teal-700 border border-teal-100 shadow-sm'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                                    }
                                `}
                            >
                                <Icon className={`w-4 h-4 ${isActive ? 'text-teal-600' : ''}`} />

                                {!collapsed && (
                                    <>
                                        <span className="flex-1 truncate">{label}</span>
                                        {badge !== null && (
                                            <span
                                                className={`
                                                    text-xs font-bold px-1.5 py-0.5 rounded-full
                                                    ${isActive
                                                        ? 'bg-teal-100 text-teal-700'
                                                        : 'bg-yellow-100 text-yellow-700'
                                                    }
                                                `}
                                            >
                                                {badge}
                                            </span>
                                        )}
                                    </>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* ── User / Logout ── */}
                <div className="p-3 border-t border-gray-200">
                    {!collapsed ? (
                        <div
                            className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-gray-50 cursor-pointer group"
                            onClick={() => setShowLogoutModal(true)}
                        >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white text-xs font-bold">
                                A
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-gray-800 truncate">
                                    Admin User
                                </p>
                                <p className="text-xs text-gray-400 truncate">
                                    admin@worktrack.in
                                </p>
                            </div>
                            <FiLogOut className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors" />
                        </div>
                    ) : (
                        <div
                            className="flex justify-center cursor-pointer"
                            onClick={() => setShowLogoutModal(true)}
                        >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white text-xs font-bold">
                                A
                            </div>
                        </div>
                    )}
                </div>
            </aside>

            {/* ── Logout Confirmation Modal ── */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-xl w-full max-w-sm p-5 shadow-lg">
                        <h3 className="text-sm font-semibold text-gray-800">
                            Confirm Logout
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                            Are you sure you want to logout?
                        </p>

                        <div className="flex justify-end gap-2 mt-5">
                            <button
                                onClick={() => setShowLogoutModal(false)}
                                className="px-4 py-1.5 text-xs rounded-lg border text-gray-600 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-1.5 text-xs rounded-lg bg-red-500 text-white hover:bg-red-600"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
