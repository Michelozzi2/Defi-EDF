import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu, LayoutDashboard, Package, ShoppingCart, Wrench } from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

export default function Layout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Réception', path: '/reception', icon: Package },
        { name: 'Com.', path: '/commande', icon: ShoppingCart },
        { name: 'Opé.', path: '/operations', icon: Wrench },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
            {/* Desktop Sidebar */}
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            <div className="flex-1 flex flex-col min-w-0 lg:pl-72 transition-all duration-300 mb-20 lg:mb-0">
                {/* Mobile Header */}
                <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                            <Menu size={24} />
                        </button>
                        <span className="font-bold text-[#001A70] text-lg">Defi EDF</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[#001A70] font-bold text-xs">
                        M
                    </div>
                </header>

                <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>

                {/* Mobile Bottom Navigation */}
                <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 pb-safe">
                    <div className="flex justify-around items-center h-16">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className="flex flex-col items-center justify-center w-full h-full relative"
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="mobile-nav-indicator"
                                            className="absolute top-0 w-12 h-1 bg-[#FE5815] rounded-b-full"
                                        />
                                    )}
                                    <item.icon
                                        size={24}
                                        className={clsx(
                                            "transition-colors mb-1",
                                            isActive ? "text-[#FE5815]" : "text-gray-400"
                                        )}
                                    />
                                    <span className={clsx(
                                        "text-[10px] font-medium transition-colors",
                                        isActive ? "text-[#FE5815]" : "text-gray-500"
                                    )}>
                                        {item.name}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </nav>
            </div>
        </div>
    );
}
