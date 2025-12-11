import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { motion } from 'framer-motion';
import { Box, CheckCircle, AlertTriangle, Layers, ArrowUpRight } from 'lucide-react';
import clsx from 'clsx';

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // In production, this would call api.get('/dashboard/stocks/')
                // For now, let's mock it if the server isn't running perfectly or session is missing
                try {
                    const response = await api.get('/dashboard/stocks/');
                    setStats(response.data);
                } catch (err) {
                    console.warn("API call failed, using mock data for demo", err);
                    // Mock data
                    setStats({
                        total: 1024,
                        by_etat: {
                            'EN_SERVICE': 850,
                            'EN_STOCK': 120,
                            'EN_PANNE': 54
                        },
                        by_affectation: {
                            'CLIENT': 800,
                            'MAGASIN': 150,
                            'LABO': 74
                        }
                    });
                }
            } catch (error) {
                console.error("Failed to load dashboard", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const statCards = [
        {
            title: 'Concen. Total',
            value: stats?.total,
            icon: Layers,
            color: 'bg-blue-500',
            textColor: 'text-blue-500'
        },
        {
            title: 'En Service',
            value: stats?.by_etat?.['EN_SERVICE'] || 0,
            icon: CheckCircle,
            color: 'bg-green-500',
            textColor: 'text-green-500'
        },
        {
            title: 'En Stock',
            value: stats?.by_etat?.['EN_STOCK'] || 0,
            icon: Box,
            color: 'bg-orange-500',
            textColor: 'text-orange-500'
        },
        {
            title: 'Maintenance',
            value: stats?.by_etat?.['EN_PANNE'] || 0,
            icon: AlertTriangle,
            color: 'bg-red-500',
            textColor: 'text-red-500'
        },
    ];

    return (
        <Layout>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-[#001A70]">Tableau de Bord</h1>
                <p className="text-gray-500 mt-1">Vue d'ensemble du parc de concentrateurs</p>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-40 bg-gray-100 animate-pulse rounded-2xl" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statCards.map((card, idx) => (
                        <motion.div
                            key={card.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={clsx("p-3 rounded-xl bg-opacity-10", card.color.replace('bg-', 'bg-opacity-10 bg-'))}>
                                    <card.icon className={clsx("w-6 h-6", card.textColor)} />
                                </div>
                                <span className="flex items-center text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                    +2.5% <ArrowUpRight size={12} className="ml-1" />
                                </span>
                            </div>
                            <div>
                                <h3 className="text-gray-500 font-medium text-sm">{card.title}</h3>
                                <p className="text-3xl font-bold text-slate-800 mt-1">{card.value}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Recent Activity Section Mockup */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
                >
                    <h3 className="font-bold text-[#001A70] mb-4">Affectations par Zone</h3>
                    <div className="space-y-4">
                        {stats && Object.entries(stats.by_affectation || {}).map(([key, val], idx) => (
                            <div key={key} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${['bg-blue-500', 'bg-orange-500', 'bg-purple-500'][idx % 3]}`} />
                                    <span className="text-gray-600 font-medium">{key}</span>
                                </div>
                                <span className="font-bold text-gray-800">{val}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
                >
                    <h3 className="font-bold text-[#001A70] mb-4">Dernières Actions</h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map((_, i) => (
                            <div key={i} className="flex items-center gap-4 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs">
                                    USER
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-800">Réception Carton #12345</p>
                                    <p className="text-xs text-gray-400">Il y a 2 heures</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </Layout>
    );
}
