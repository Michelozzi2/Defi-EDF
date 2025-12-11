import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Package, ShoppingCart, Wrench, Moon, Sun,
    LayoutGrid, LogOut, FlaskConical, ChevronUp, X
} from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

export default function Layout({ children }) {
    const location = useLocation();
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const [dockExpanded, setDockExpanded] = useState(false);

    const navItems = [
        { name: 'Tableau de Bord', path: '/dashboard', icon: LayoutDashboard, color: 'bg-[#FE5815]' },
        { name: 'Réception', path: '/reception', icon: Package, color: 'bg-[#509E2F]' },
        { name: 'Commande', path: '/commande', icon: ShoppingCart, color: 'bg-[#223555]' },
        { name: 'Opérations', path: '/operations', icon: Wrench, color: 'bg-blue-600' },
        { name: 'Laboratoire', path: '/labo', icon: FlaskConical, color: 'bg-[#5CB6DE]' },
    ];

    const handleLogout = async () => {
        await api.post('/auth/logout/');
        navigate('/login');
    };

    const currentPage = navItems.find(item => location.pathname === item.path);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0F1720] text-gray-900 dark:text-gray-100 transition-colors">
            {/* Main Content - Full Width */}
            <main className="min-h-screen pb-24">
                <div className="max-w-7xl mx-auto p-4 lg:p-8">
                    {children}
                </div>
            </main>

            {/* Floating Dock - Modern macOS-style */}
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
                <motion.div
                    layout
                    className={clsx(
                        "backdrop-blur-xl border shadow-2xl rounded-2xl overflow-hidden",
                        theme === 'dark'
                            ? "bg-[#16202A]/90 border-gray-700/50"
                            : "bg-white/90 border-gray-200/50"
                    )}
                >
                    {/* Expanded Panel */}
                    <AnimatePresence>
                        {dockExpanded && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="border-b border-gray-200 dark:border-gray-700/50"
                            >
                                <div className="p-4 grid grid-cols-3 md:grid-cols-5 gap-3">
                                    {navItems.map((item) => {
                                        const isActive = location.pathname === item.path;
                                        return (
                                            <Link
                                                key={item.path}
                                                to={item.path}
                                                onClick={() => setDockExpanded(false)}
                                                className={clsx(
                                                    "flex flex-col items-center gap-2 p-3 rounded-xl transition-all",
                                                    isActive
                                                        ? `${item.color} text-white shadow-lg`
                                                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                                                )}
                                            >
                                                <item.icon size={24} />
                                                <span className="text-xs font-medium whitespace-nowrap">{item.name}</span>
                                            </Link>
                                        );
                                    })}
                                </div>

                                {/* Quick Actions */}
                                <div className="px-4 pb-4 flex items-center justify-between gap-4">
                                    <Link
                                        to="/workspaces"
                                        onClick={() => setDockExpanded(false)}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
                                    >
                                        <LayoutGrid size={18} />
                                        Espaces
                                    </Link>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={toggleTheme}
                                            className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                                        </button>
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors text-sm font-medium"
                                        >
                                            <LogOut size={18} />
                                            Déconnexion
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Dock Bar */}
                    <div className="flex items-center gap-1 p-2">
                        {/* Quick Nav Icons */}
                        {navItems.slice(0, 4).map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={clsx(
                                        "relative p-3 rounded-xl transition-all group",
                                        isActive
                                            ? `${item.color} text-white shadow-lg`
                                            : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
                                    )}
                                >
                                    <item.icon size={22} />
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                        {item.name}
                                    </div>
                                    {isActive && (
                                        <motion.div
                                            layoutId="dock-indicator"
                                            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white"
                                        />
                                    )}
                                </Link>
                            );
                        })}

                        {/* Divider */}
                        <div className="w-px h-8 bg-gray-200 dark:bg-gray-700 mx-1"></div>

                        {/* Expand Button */}
                        <button
                            onClick={() => setDockExpanded(!dockExpanded)}
                            className={clsx(
                                "p-3 rounded-xl transition-all",
                                dockExpanded
                                    ? "bg-[#001A70] text-white"
                                    : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
                            )}
                        >
                            <motion.div
                                animate={{ rotate: dockExpanded ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                {dockExpanded ? <X size={22} /> : <ChevronUp size={22} />}
                            </motion.div>
                        </button>

                        {/* Theme Toggle - Desktop Only */}
                        <button
                            onClick={toggleTheme}
                            className="hidden md:block p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
                        >
                            {theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
