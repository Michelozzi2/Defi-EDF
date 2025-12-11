import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Wrench,
    LogOut,
    Activity,
    Menu,
    X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import api from '../services/api';

export default function Sidebar({ isOpen, setIsOpen }) {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await api.get('/logout/'); // Or post, depends on django auth views usually it's a view
        } catch (e) {
            console.error("Logout failed", e);
        } finally {
            // Force redirect
            window.location.href = '/login'; // Full reload to clear states
        }
    };

    const navItems = [
        { name: 'Tableau de bord', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Réception (Magasin)', path: '/reception', icon: Package },
        { name: 'Commande (BO)', path: '/commande', icon: ShoppingCart },
        { name: 'Opérations (Terrain)', path: '/operations', icon: Wrench },
    ];

    return (
        <>
            {/* Mobile Backdrop */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar Container */}
            <motion.aside
                className={clsx(
                    "fixed top-0 left-0 z-50 h-screen w-72 bg-[#001A70] text-white flex flex-col shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="p-6 flex items-center gap-3 border-b border-white/10">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
                        <Activity className="w-6 h-6 text-[#001A70]" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">Defi EDF</span>
                    <button onClick={() => setIsOpen(false)} className="lg:hidden ml-auto">
                        <X className="w-6 h-6 text-blue-200" />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsOpen(false)}
                            className={({ isActive }) => clsx(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                                isActive
                                    ? "bg-[#FE5815] text-white shadow-lg shadow-orange-900/20 font-medium"
                                    : "text-blue-100 hover:bg-white/10 hover:text-white"
                            )}
                        >
                            <item.icon size={20} className={clsx("transition-transform group-hover:scale-110")} />
                            {item.name}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/10">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-300 hover:bg-white/5 hover:text-red-200 rounded-xl transition-colors"
                    >
                        <LogOut size={20} />
                        Déconnexion
                    </button>
                </div>
            </motion.aside>
        </>
    );
}
