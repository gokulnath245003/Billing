import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/constants';
import { Menu, X, Receipt, ShoppingCart, BarChart3, LogOut, Package } from 'lucide-react';
import clsx from 'clsx';

const Layout = () => {
    const { user, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();

    const navigation = [
        { name: 'Billing', href: '/', icon: Receipt, roles: [ROLES.OWNER, ROLES.WORKER] },
        { name: 'Inventory', href: '/inventory', icon: Package, roles: [ROLES.OWNER, ROLES.WORKER] }, // Worker can view stock? Plan says "Add items" is owner+worker? Or owner only? Plan implies owner+worker for edit form. Let's assume view/edit is shared but delete is guarded.
        { name: 'Dashboard', href: '/dashboard', icon: BarChart3, roles: [ROLES.OWNER] },
        { name: 'Sales/History', href: '/sales', icon: ShoppingCart, roles: [ROLES.OWNER, ROLES.WORKER] },
    ];

    const filteredNav = navigation.filter(item => item.roles.includes(user?.role));

    const isActive = (path) => location.pathname === path;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white shadow-sm z-10">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center font-bold text-xl text-blue-600">
                        <Receipt className="mr-2 h-6 w-6" />
                        BillApp
                    </div>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex space-x-4">
                        {filteredNav.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={clsx(
                                    "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                    isActive(item.href)
                                        ? "bg-blue-100 text-blue-700"
                                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                )}
                            >
                                <item.icon className="h-4 w-4 mr-2" />
                                {item.name}
                            </Link>
                        ))}
                        <button
                            onClick={logout}
                            className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50"
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                        </button>
                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>

                {/* Mobile Nav */}
                {isMenuOpen && (
                    <div className="md:hidden border-t border-gray-200">
                        <div className="px-2 pt-2 pb-3 space-y-1">
                            {filteredNav.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={clsx(
                                        "flex items-center px-3 py-4 rounded-md text-base font-medium",
                                        isActive(item.href)
                                            ? "bg-blue-100 text-blue-700"
                                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                    )}
                                >
                                    <item.icon className="h-5 w-5 mr-3" />
                                    {item.name}
                                </Link>
                            ))}
                            <button
                                onClick={logout}
                                className="w-full flex items-center px-3 py-4 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                            >
                                <LogOut className="h-5 w-5 mr-3" />
                                Logout
                            </button>
                        </div>
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-7xl mx-auto w-full p-4 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
