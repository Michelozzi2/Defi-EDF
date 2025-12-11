import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, FileText, Package, Microscope, Settings, LogOut, ArrowRight, Sun, Moon, ShoppingCart, Wrench } from 'lucide-react';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';
import clsx from 'clsx';

export default function WorkspaceSelector() {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/auth/me/')
            .then(res => {
                setUser(res.data);
                setLoading(false);
            })
            .catch(() => {
                navigate('/login');
            });
    }, [navigate]);

    const handleLogout = async () => {
        await api.post('/auth/logout/');
        navigate('/login');
    };

    if (loading) return <div className="min-h-screen bg-white flex items-center justify-center text-[#001A70]">Chargement...</div>;

    const workspaces = [
        {
            id: 'dashboard',
            title: 'Tableau de Bord',
            desc: 'KPIs et vue d\'ensemble du cycle de vie',
            icon: LayoutGrid,
            color: 'bg-[#FE5815]', // Orange EDF
            path: '/dashboard',
            allowed: true
        },
        {
            id: 'commande',
            title: 'Commandes',
            desc: 'Gestion des commandes et stocks',
            icon: ShoppingCart, // Changed to match Layout
            color: 'bg-[#223555]',
            path: '/commande',
            allowed: user.profil === 'admin' || (user.profil && user.profil.includes('bo')),
            external: false
        },
        {
            id: 'operations',
            title: 'Opérations',
            desc: 'Pose, Dépose et Maintenance',
            icon: Wrench, // Changed to match Layout
            color: 'bg-blue-600',
            path: '/operations',
            allowed: user.profil === 'admin' || (user.profil && user.profil.includes('bo')),
            external: false
        },
        {
            id: 'magasin',
            title: 'Logistique Magasin',
            desc: 'Réception et gestion de stock',
            icon: Package,
            color: 'bg-[#509E2F]', // Vert EDF
            path: '/reception',
            allowed: user.profil === 'admin' || user.profil === 'magasin'
        },
        {
            id: 'labo',
            title: 'Laboratoire',
            desc: 'Analyse et diagnostics',
            icon: Microscope,
            color: 'bg-[#5CB6DE]',
            path: '/labo',
            allowed: user.profil === 'admin' || user.profil === 'labo'
        },
        {
            id: 'admin',
            title: 'Administration',
            desc: 'Configuration système',
            icon: Settings,
            color: 'bg-gray-800',
            path: 'http://localhost:8000/admin/',
            external: true,
            allowed: user.profil === 'admin' || user.is_staff
        }
    ];

    const availableWorkspaces = workspaces.filter(ws => ws.allowed);

    return (
        <div className={clsx(
            "min-h-screen font-sans p-6 relative transition-colors duration-300",
            theme === 'dark' ? "bg-[#0F1720] text-white" : "bg-slate-50 text-[#001A70]"
        )}>
            {/* Background Accent */}
            <div className={clsx(
                "absolute top-0 right-0 w-full h-64 -z-10 skew-y-2 origin-top-left transition-colors duration-300",
                theme === 'dark' ? "bg-[#001A70]/50" : "bg-[#001A70]"
            )}></div>

            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 pt-8 max-w-6xl mx-auto">
                <div>
                    <h1 className={clsx("text-3xl font-bold mb-1 transition-colors", theme === 'dark' ? "text-white" : "text-[#001A70]")}>Espaces de Travail</h1>
                    <p className={clsx("text-lg", theme === 'dark' ? "text-gray-300" : "text-gray-600")}>
                        Connecté en tant que <span className="font-semibold text-[#FE5815]">{user.username}</span>
                    </p>
                </div>
                <div className="flex items-center gap-4 mt-4 md:mt-0">
                    <button
                        onClick={toggleTheme}
                        className={clsx(
                            "p-3 rounded-full transition-colors border",
                            theme === 'dark'
                                ? "bg-white/10 hover:bg-white/20 text-white border-white/10"
                                : "bg-gray-100 hover:bg-gray-200 text-[#001A70] border-gray-300"
                        )}
                    >
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white text-[#FE5815] rounded-full font-bold shadow-lg hover:shadow-xl transition-all active:scale-95"
                    >
                        <LogOut size={18} />
                        Déconnexion
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {availableWorkspaces.map((ws) => (
                    <motion.button
                        key={ws.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -5, shadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                            if (ws.external) window.location.href = ws.path;
                            else navigate(ws.path);
                        }}
                        className={clsx(
                            "group p-8 rounded-3xl text-left transition-all relative overflow-hidden shadow-sm bg-white dark:bg-[#16202A] border border-transparent dark:border-gray-800 hover:border-gray-100 dark:hover:border-gray-700",
                            ws.id === 'dashboard' ? "lg:col-span-2 bg-gradient-to-br from-[#001A70] to-blue-900 text-white" : ""
                        )}
                    >
                        {/* Decorative Circle */}
                        <div className={clsx(
                            "absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-10 transition-transform group-hover:scale-110",
                            ws.color
                        )}></div>

                        <div className={clsx(
                            "w-14 h-14 rounded-2xl mb-6 flex items-center justify-center shadow-lg transition-transform group-hover:rotate-6",
                            ws.id === 'dashboard' ? "bg-white/10 text-white" : `${ws.color} text-white`
                        )}>
                            <ws.icon size={28} />
                        </div>

                        <h3 className={clsx("text-xl font-bold mb-2 transition-colors", ws.id === 'dashboard' ? "text-white" : "text-[#001A70] dark:text-white")}>{ws.title}</h3>
                        <p className={clsx("text-sm transition-colors", ws.id === 'dashboard' ? "text-blue-200" : "text-gray-500 dark:text-gray-400")}>{ws.desc}</p>

                        <div className={clsx(
                            "absolute bottom-8 right-8 transition-all duration-300 opacity-0 transform translate-x-4",
                            "group-hover:opacity-100 group-hover:translate-x-0"
                        )}>
                            <ArrowRight size={24} className={ws.id === 'dashboard' ? "text-white" : "text-[#FE5815]"} />
                        </div>
                    </motion.button>
                ))}
            </div>

            <div className="mt-20 text-center text-gray-400 text-sm">
                &copy; 2024 EDF - Application Interne
            </div>
        </div>
    );
}
