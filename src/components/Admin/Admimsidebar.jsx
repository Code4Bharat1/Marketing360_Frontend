'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
    FiBarChart2, FiFileText, FiUsers, FiActivity,
    FiSettings, FiLogOut, FiCheckSquare
} from 'react-icons/fi';
import { BiPackage } from 'react-icons/bi';
import { IoStatsChartOutline, IoTrophyOutline } from 'react-icons/io5';

const navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: FiBarChart2, href: '/admin/dashboard', badge: null },
    { key: 'work', label: 'Work Logs', icon: FiFileText, href: '/admin/work', badge: null },
    { key: 'assign-tasks', label: 'Assign Tasks', icon: FiCheckSquare, href: '/admin/assign-tasks', badge: null },
    { key: 'employees', label: 'Employees', icon: FiUsers, href: '/admin/employees', badge: null },
    { key: 'performance', label: 'Performance', icon: IoStatsChartOutline, href: '/admin/performance',badge: null  },
//   { key: 'rankings', label: 'Rankings', icon: IoTrophyOutline, href: '/admin/rankings',badge: null  }
    // { key: 'reports',   label: 'Reports',     icon: FiActivity,    href: '/admin/reports',      badge: null },
    // { key: 'settings',  label: 'Settings',    icon: FiSettings,    href: '/admin/settings',     badge: null },
];

export default function AdminSidebar({ collapsed = false, onToggle }) {
    const pathname = usePathname();
    const router = useRouter();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [userData, setUserData] = useState({ name: 'A', email: 'admin@example.com' });

    // ✅ Access localStorage only on client side
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                const username = localStorage.getItem("user");
                if (username) {
                    const user = JSON.parse(username);
                    setUserData({
                        name: user.name || 'Admin',
                        email: user.email || 'admin@example.com'
                    });
                }
            } catch (error) {
                console.error('Error parsing user data:', error);
                // Keep default values if parsing fails
            }
        }
    }, []);

    // ✅ Active check: exact match OR nested route
    const isActive = (href) =>
        pathname === href || pathname.startsWith(href + '/');

    const handleLogout = () => {
        setShowLogoutModal(false);
        
        // Clear localStorage
        if (typeof window !== 'undefined') {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        }
        
        router.push('/');
    };

    // Get initials from name
    const getInitials = (name) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
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
                    <Link href="/admin/dashboard" className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-md flex-shrink-0 hover:opacity-90 transition-opacity">
                        <BiPackage className="w-4 h-4 text-white" />
                    </Link>
                    {!collapsed && (
                        <Link href="/admin/dashboard" className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-800 truncate">Marketing360</p>
                            <p className="text-xs text-gray-400">Admin Panel</p>
                        </Link>
                    )}
                </div>

                {/* ── Nav ── */}
                <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto overflow-x-hidden">
                    {navItems.map(({ key, label, icon: Icon, href, badge }) => {
                        const active = isActive(href);

                        return (
                            <Link
                                key={key}
                                href={href}
                                title={collapsed ? label : undefined}
                                className={`
                                    relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                                    transition-all duration-150 text-sm font-medium
                                    ${active
                                        ? 'bg-teal-50 text-teal-700 border border-teal-100 shadow-sm'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800 border border-transparent'
                                    }
                                `}
                            >
                                <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-teal-600' : ''}`} />

                                {!collapsed && (
                                    <>
                                        <span className="flex-1 truncate text-left">{label}</span>
                                        {badge !== null && (
                                            <span className={`
                                                text-xs font-bold px-1.5 py-0.5 rounded-full ml-auto
                                                ${active
                                                    ? 'bg-teal-100 text-teal-700'
                                                    : 'bg-yellow-100 text-yellow-700'
                                                }
                                            `}>
                                                {badge}
                                            </span>
                                        )}
                                    </>
                                )}

                                {/* Collapsed badge dot */}
                                {collapsed && badge !== null && (
                                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-yellow-400 rounded-full border border-white" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* ── User / Logout ── */}
                <div className="p-3 border-t border-gray-200 flex-shrink-0">
                    {!collapsed ? (
                        <div
                            onClick={() => setShowLogoutModal(true)}
                            className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors group"
                        >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                {getInitials(userData.name)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-gray-800 truncate">{userData.name}</p>
                                <p className="text-xs text-gray-400 truncate">{userData.email}</p>
                            </div>
                            <FiLogOut className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors flex-shrink-0" />
                        </div>
                    ) : (
                        <div
                            onClick={() => setShowLogoutModal(true)}
                            className="flex justify-center cursor-pointer"
                            title={userData.name}
                        >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white text-xs font-bold">
                                {getInitials(userData.name)}
                            </div>
                        </div>
                    )}
                </div>
            </aside>

            {/* ── Logout Confirmation Modal ── */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
                        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                            <FiLogOut className="w-5 h-5 text-red-500" />
                        </div>
                        <h3 className="text-base font-bold text-gray-800 text-center">Confirm Logout</h3>
                        <p className="text-xs text-gray-500 mt-1 text-center">Are you sure you want to logout?</p>
                        <div className="flex gap-3 mt-5">
                            <button
                                onClick={() => setShowLogoutModal(false)}
                                className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg border-2 border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors shadow-md"
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