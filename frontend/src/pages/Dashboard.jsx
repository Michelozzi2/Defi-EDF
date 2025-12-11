import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, Search, Package, Database,
    AlertTriangle, CheckCircle, Clock, BarChart3,
    TrendingUp, Filter, Wrench, ArrowUpRight, ArrowDownRight,
    Search as SearchIcon, X, RefreshCcw, Truck
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import api from '../services/api';
import clsx from 'clsx';
import { useTheme } from '../context/ThemeContext';

export default function Dashboard() {
    const { theme } = useTheme();
    const [stats, setStats] = useState(null);
    const [loadingStats, setLoadingStats] = useState(true);

    // Inventory Search State
    const [results, setResults] = useState([]);
    const [search, setSearch] = useState('');
    const [filterEtat, setFilterEtat] = useState('');
    const [filterAffectation, setFilterAffectation] = useState('');
    const [searching, setSearching] = useState(false);
    const [totalCount, setTotalCount] = useState(0);

    // Detail Modal State
    const [selectedItem, setSelectedItem] = useState(null);

    useEffect(() => {
        fetchStats();
    }, []);

    // Effect for Search - debounce included
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchInventory();
        }, 500);
        return () => clearTimeout(timer);
    }, [search, filterEtat, filterAffectation]);

    const fetchStats = async () => {
        try {
            const res = await api.get('/dashboard/stocks/');
            setStats(res.data);
            setLoadingStats(false);
        } catch (error) {
            console.error("Error fetching stats:", error);
            setLoadingStats(false);
        }
    };

    const fetchInventory = async () => {
        setSearching(true);
        setResults([]);

        try {
            const params = {
                search: search,
                etat: filterEtat,
                affectation: filterAffectation
            };

            // Simple fetch without pagination
            const res = await api.get('/concentrateurs/', { params });
            const data = res.data.results || res.data;
            setResults(data);
            setTotalCount(res.data.count || data.length);
        } catch (error) {
            console.error("Error fetching inventory:", error);
        } finally {
            setSearching(false);
        }
    };

    const StatCard = ({ title, value, icon: Icon, colorClass, delay }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
            className="bg-white dark:bg-[#16202A] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800"
        >
            <div className="flex items-center justify-between mb-4">
                <div className={clsx("p-3 rounded-xl bg-opacity-10", colorClass)}>
                    <Icon size={24} className={colorClass.replace('bg-', 'text-')} />
                </div>
                <span className="text-3xl font-bold text-gray-900 dark:text-white">{value}</span>
            </div>
            <h3 className="text-gray-500 dark:text-gray-400 font-medium">{title}</h3>
        </motion.div>
    );

    if (loadingStats) return (
        <div className="min-h-[400px] flex items-center justify-center text-gray-500 dark:text-gray-400">
            <RefreshCcw className="animate-spin mr-2" /> Chargement du tableau de bord...
        </div>
    );

    const total = stats?.total || 0;
    const enStock = stats?.by_etat?.['en_stock'] || 0;
    const enLivraison = stats?.by_etat?.['en_livraison'] || 0;
    const aTester = stats?.by_etat?.['a_tester'] || 0;

    // Prepare chart data with EDF Colors
    // EDF Palette: Blue #001A70, Green #509E2F, Orange #FE5815, Red #EF4444, Violet #8B5CF6
    const etatData = stats?.by_etat ? Object.entries(stats.by_etat).map(([key, value]) => ({
        name: key.replace(/_/g, ' ').toUpperCase(),
        value: value,
        color: key === 'en_stock' ? '#509E2F' :  // Vert EDF
            key === 'HS' ? '#EF4444' :        // Rouge
                key === 'en_livraison' ? '#FE5815' : // Orange EDF
                    key === 'en_attente_reconditionnement' ? '#8B5CF6' : // Violet
                        '#001A70'                         // Bleu EDF (default/autres)
    })) : [];

    const affectationData = stats?.by_affectation ? Object.entries(stats.by_affectation).map(([key, value]) => ({
        name: key,
        value: value
    })) : [];

    const COLORS = ['#001A70', '#509E2F', '#FE5815', '#EF4444', '#8884d8'];

    return (
        <div className="space-y-8 pb-24">
            <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#001A70] dark:text-white mb-2">Tableau de Bord Global</h1>
                    <p className="text-gray-500 dark:text-gray-400">Vue d'ensemble du parc CPL</p>
                </div>
                <button onClick={fetchStats} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors self-start md:self-auto">
                    <RefreshCcw size={20} className="text-gray-500" />
                </button>
            </header>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Concentrateurs" value={total} icon={BarChart3} colorClass="bg-blue-600" delay={0.1} />
                <StatCard title="En Stock" value={enStock} icon={Package} colorClass="bg-[#509E2F]" delay={0.2} />
                <StatCard title="En Livraison" value={enLivraison} icon={Truck} colorClass="bg-[#FE5815]" delay={0.3} />
                <StatCard title="À Tester" value={aTester} icon={AlertTriangle} colorClass="bg-red-500" delay={0.4} />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-[#16202A] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 h-72 flex flex-col">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Répartition par État</h3>
                    <div className="flex-1 min-h-0 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            {etatData.length > 0 ? (
                                <BarChart data={etatData}>
                                    <XAxis dataKey="name" stroke={theme === 'dark' ? '#9ca3af' : '#4b5563'} fontSize={10} tickLine={false} axisLine={false} />
                                    <YAxis stroke={theme === 'dark' ? '#9ca3af' : '#4b5563'} fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                        itemStyle={{ color: theme === 'dark' ? '#fff' : '#000' }}
                                        cursor={{ fill: 'transparent' }}
                                    />
                                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                        {etatData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-400">Aucune donnée disponible</div>
                            )}
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#16202A] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 h-72 flex flex-col">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Répartition par Affectation</h3>
                    <div className="flex-1 min-h-0 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            {affectationData.length > 0 ? (
                                <PieChart>
                                    <Pie
                                        data={affectationData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {affectationData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                        itemStyle={{ color: theme === 'dark' ? '#fff' : '#000' }}
                                    />
                                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                </PieChart>
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-400">Aucune donnée disponible</div>
                            )}
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Isolated Search Module - Takes remaining space */}
            <div className="flex-1 min-h-0 flex flex-col">
                {/* Visual Distinction Wrapper */}
                <div className="h-full bg-gradient-to-br from-blue-50/50 to-white dark:from-blue-900/10 dark:to-[#16202A] rounded-2xl p-1 shadow-lg border-2 border-blue-100 dark:border-blue-900/30">
                    <div className="h-full bg-white dark:bg-[#16202A] rounded-xl p-4 flex flex-col gap-3">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-700 pb-4">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Search size={24} className="text-[#FE5815]" />
                                Explorateur d'Inventaire
                            </h2>
                            <span className="text-xs font-semibold uppercase tracking-wider text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                                Recherche Indépendante
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#001A70] dark:group-focus-within:text-blue-400 transition-colors" size={18} />
                                <input
                                    type="text"
                                    placeholder="Rechercher (N° Série / Carton)..."
                                    className="w-full p-3 pl-10 rounded-xl bg-gray-50 dark:bg-[#0F1720] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#001A70] dark:focus:ring-blue-500 transition-all outline-none"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>

                            <select
                                className="w-full p-3 rounded-xl bg-gray-50 dark:bg-[#0F1720] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#001A70] dark:focus:ring-blue-500 outline-none appearance-none cursor-pointer"
                                value={filterEtat}
                                onChange={(e) => setFilterEtat(e.target.value)}
                            >
                                <option value="">Tous les états</option>
                                <option value="en_livraison">En Livraison</option>
                                <option value="en_stock">En Stock</option>
                                <option value="pose">Posé</option>
                                <option value="a_tester">À Tester</option>
                                <option value="HS">HS</option>
                            </select>

                            <select
                                className="w-full p-3 rounded-xl bg-gray-50 dark:bg-[#0F1720] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#001A70] dark:focus:ring-blue-500 outline-none appearance-none cursor-pointer"
                                value={filterAffectation}
                                onChange={(e) => setFilterAffectation(e.target.value)}
                            >
                                <option value="">Toutes affectations</option>
                                <option value="Magasin">Magasin</option>
                                <option value="BO Nord">BO Nord</option>
                                <option value="BO Centre">BO Centre</option>
                                <option value="BO Sud">BO Sud</option>
                                <option value="Labo">Labo</option>
                            </select>
                        </div>

                        {/* Results count */}
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                {results.length} résultats
                            </span>
                        </div>

                        <div className="overflow-auto rounded-xl border border-gray-100 dark:border-gray-700 flex-1">
                            <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                                <thead className="bg-gray-50 dark:bg-[#0F1720] text-gray-900 dark:text-white font-semibold sticky top-0">
                                    <tr>
                                        <th className="p-3">N° Série</th>
                                        <th className="p-3">Carton</th>
                                        <th className="p-3">État</th>
                                        <th className="p-3">Affectation</th>
                                        <th className="p-3">Opérateur</th>
                                        <th className="p-3">Position</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {results.map((c) => (
                                        <tr
                                            key={c.id}
                                            onClick={() => setSelectedItem(c)}
                                            className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors cursor-pointer group"
                                        >
                                            <td className="p-3 font-mono font-medium text-blue-600 dark:text-blue-400 group-hover:text-[#FE5815] transition-colors">{c.n_serie}</td>
                                            <td className="p-3 font-mono text-xs">{c.carton || '-'}</td>
                                            <td className="p-3">
                                                <span className={clsx(
                                                    "px-2 py-0.5 rounded-full text-xs font-semibold",
                                                    c.etat === 'en_stock' ? "bg-green-100 text-[#509E2F] dark:bg-green-900/40 dark:text-green-300" :
                                                        c.etat === 'HS' ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" :
                                                            c.etat === 'en_livraison' ? "bg-orange-100 text-[#FE5815] dark:bg-orange-900/40 dark:text-orange-300" :
                                                                c.etat === 'en_attente_reconditionnement' ? "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300" :
                                                                    "bg-blue-100 text-[#001A70] dark:bg-blue-900/40 dark:text-blue-300"
                                                )}>
                                                    {c.etat}
                                                </span>
                                            </td>
                                            <td className="p-3">{c.affectation}</td>
                                            <td className="p-3">{c.operateur || '-'}</td>
                                            <td className="p-3 text-xs font-mono">{c.poste_code || '-'}</td>
                                        </tr>
                                    ))}
                                    {results.length === 0 && !searching && (
                                        <tr>
                                            <td colSpan="6" className="p-6 text-center text-gray-400">Aucun résultat trouvé.</td>
                                        </tr>
                                    )}
                                    {searching && (
                                        <tr>
                                            <td colSpan="6" className="p-6 text-center text-gray-400">Recherche en cours...</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Details Modal */}
            <AnimatePresence>
                {selectedItem && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                        {/* Backdrop with Blur */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/40 backdrop-blur-md"
                            onClick={() => setSelectedItem(null)}
                        />
                        {/* Modal Content */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white dark:bg-[#16202A] rounded-2xl p-0 max-w-lg w-full shadow-2xl border border-gray-100 dark:border-gray-800 relative overflow-hidden z-10"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0F1720]/50 flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <Package className="text-[#001A70] dark:text-blue-400" size={24} />
                                        Concentrateur
                                    </h3>
                                    <p className="text-sm text-gray-500 font-mono mt-1">{selectedItem.n_serie}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedItem(null)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-500"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-gray-50 dark:bg-[#0F1720] rounded-xl">
                                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">État Actuel</span>
                                        <span className={clsx(
                                            "font-semibold",
                                            selectedItem.etat === 'en_stock' ? "text-[#509E2F]" :
                                                selectedItem.etat === 'HS' ? "text-red-600" :
                                                    selectedItem.etat === 'en_livraison' ? "text-[#FE5815]" :
                                                        "text-[#001A70] dark:text-blue-400"
                                        )}>
                                            {selectedItem.etat}
                                        </span>
                                    </div>
                                    <div className="p-4 bg-gray-50 dark:bg-[#0F1720] rounded-xl">
                                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Opérateur</span>
                                        <span className="font-medium text-gray-900 dark:text-white">{selectedItem.operateur}</span>
                                    </div>
                                    <div className="p-4 bg-gray-50 dark:bg-[#0F1720] rounded-xl">
                                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Affectation</span>
                                        <span className="font-medium text-gray-900 dark:text-white">{selectedItem.affectation || '-'}</span>
                                    </div>
                                    <div className="p-4 bg-gray-50 dark:bg-[#0F1720] rounded-xl">
                                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Carton</span>
                                        <span className="font-mono text-gray-900 dark:text-white">{selectedItem.carton || '-'}</span>
                                    </div>
                                </div>

                                {/* Timeline / History Stub */}
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                        <Clock size={16} />
                                        Historique Récent
                                    </h4>
                                    <div className="border-l-2 border-gray-100 dark:border-gray-800 pl-4 space-y-4">
                                        <div className="relative">
                                            <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-blue-500 border-2 border-white dark:border-[#16202A]"></div>
                                            <p className="text-sm text-gray-900 dark:text-white font-medium">Dernière modification</p>
                                            <p className="text-xs text-gray-500">{new Date(selectedItem.date_dernier_etat).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0F1720]/50 flex justify-end">
                                <button
                                    onClick={() => setSelectedItem(null)}
                                    className="px-4 py-2 bg-white dark:bg-[#16202A] border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1E293B] transition-colors"
                                >
                                    Fermer
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
