import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { useOffline } from '../context/OfflineContext';
import { ShoppingCart, Plus, Minus, Send, AlertCircle, Loader2, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

export default function Commande() {
    const [operateur, setOperateur] = useState('');
    const [nbCartons, setNbCartons] = useState(1);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);
    const [message, setMessage] = useState('');
    const [stats, setStats] = useState({ stock: 0, impact: 0 });

    useEffect(() => {
        if (operateur) {
            const fetchStats = async () => {
                try {
                    // Fetch concentrateurs in stock at Magasin for the selected operator
                    const res = await api.get('/concentrateurs/', {
                        params: { operateur, etat: 'en_stock', affectation: 'Magasin' }
                    });
                    // Use count from paginated response for total, not just page length
                    const total = res.data.count !== undefined ? res.data.count : (res.data.results || res.data).length;
                    // 4 concentrateurs per carton
                    const maxCartons = Math.floor(total / 4);
                    setStats({ stock: maxCartons, count: total, maxCartons });
                } catch (e) {
                    console.error(e);
                    setStats({ stock: '-', count: '-', maxCartons: 0 });
                }
            };
            fetchStats();
            // Reset nbCartons when operator changes
            setNbCartons(1);
        }
    }, [operateur]);

    const { isOnline, addToQueue } = useOffline();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!operateur.trim() || nbCartons < 1) return;

        setLoading(true);
        setStatus(null);

        // Offline Handling
        if (!isOnline) {
            addToQueue({
                type: 'Commande Cartons',
                url: '/actions/commande/',
                payload: {
                    operateur: operateur,
                    nb_cartons: nbCartons
                }
            });
            setStatus('success');
            setMessage(`Commande sauvegardée localement. Sera envoyée à la reconnexion.`);
            setNbCartons(1);
            setOperateur('');
            setStats({ stock: 0, impact: 0, maxCartons: 0 });
            setLoading(false);
            return;
        }

        try {
            await api.post('/actions/commande/', {
                operateur: operateur,
                nb_cartons: nbCartons
            });
            setStatus('success');
            setMessage(`Commande de ${nbCartons} cartons pour ${operateur} effectuée avec succès !`);
            setNbCartons(1);
            setOperateur('');
            setStats({ stock: 0, impact: 0, maxCartons: 0 });
        } catch (err) {
            console.error(err);
            setStatus('error');
            setMessage(err.response?.data?.error || "Une erreur est survenue lors de la commande.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <div className="mb-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 dark:bg-orange-900/30 text-[#FE5815] dark:text-[#FE5815] rounded-2xl mb-4">
                    <ShoppingCart size={32} />
                </div>
                <h1 className="text-3xl font-bold text-[#001A70] dark:text-white">Commande Cartons</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Commander des nouveaux cartons pour un opérateur.</p>
            </div>

            <div className="bg-white dark:bg-[#16202A] rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-800 relative overflow-hidden">
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-orange-50 dark:bg-orange-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-70 animate-blob"></div>

                <form onSubmit={handleSubmit} className="relative z-10 space-y-8">
                    {/* Operator Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Opérateur Destinataire</label>
                        <select
                            value={operateur}
                            onChange={(e) => setOperateur(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-[#0F1720] border border-gray-200 dark:border-gray-700 rounded-xl py-4 px-4 text-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FE5815] transition-all appearance-none cursor-pointer"
                        >
                            <option value="">Sélectionner un opérateur...</option>
                            <option value="Bouygues">Bouygues</option>
                            <option value="SFR">SFR</option>
                            <option value="Orange">Orange</option>
                        </select>
                    </div>

                    {/* Stats & Form (Only if operator selected) */}
                    <AnimatePresence>
                        {operateur && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-8"
                            >
                                {/* Stats Panel */}
                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4 grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-xs text-blue-600 dark:text-blue-400 uppercase font-bold tracking-wider">En Stock (Magasin)</span>
                                        <p className="text-2xl font-bold text-[#001A70] dark:text-white">
                                            {stats.stock !== '-' ? `${stats.stock} cartons` : '--'}
                                            {stats.count !== '-' && <span className="text-sm font-normal text-gray-500 dark:text-gray-400 block">({stats.count} unités)</span>}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-blue-600 dark:text-blue-400 uppercase font-bold tracking-wider">Impact Commande</span>
                                        <p className="text-2xl font-bold text-[#FE5815]">
                                            {nbCartons * 4} <span className="text-sm font-normal text-orange-600 dark:text-orange-400">concentrateurs</span>
                                        </p>
                                    </div>
                                </div>

                                {/* Quantity Selector */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
                                        Nombre de Cartons à Commander
                                        <span className="text-gray-400 font-normal ml-2">(max: {stats.maxCartons || 0})</span>
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setNbCartons(Math.max(1, nbCartons - 1))}
                                            disabled={nbCartons <= 1}
                                            className={clsx(
                                                "p-4 rounded-xl transition-colors",
                                                nbCartons <= 1
                                                    ? "bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed"
                                                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                                            )}
                                        >
                                            <Minus size={24} />
                                        </button>
                                        <div className="flex-1 bg-gray-50 dark:bg-[#0F1720] border border-gray-200 dark:border-gray-700 rounded-xl py-2 flex items-center justify-center gap-3">
                                            <Package className="text-gray-400 dark:text-gray-500" />
                                            <input
                                                type="number"
                                                min="1"
                                                max={stats.maxCartons || 1}
                                                value={nbCartons}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value) || 1;
                                                    setNbCartons(Math.min(Math.max(1, val), stats.maxCartons || 1));
                                                }}
                                                className="w-20 text-2xl font-bold text-[#001A70] dark:text-white bg-transparent text-center focus:outline-none"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setNbCartons(Math.min((stats.maxCartons || 1), nbCartons + 1))}
                                            disabled={nbCartons >= (stats.maxCartons || 0)}
                                            className={clsx(
                                                "p-4 rounded-xl transition-colors",
                                                nbCartons >= (stats.maxCartons || 0)
                                                    ? "bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed"
                                                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                                            )}
                                        >
                                            <Plus size={24} />
                                        </button>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={clsx(
                                        "w-full py-4 rounded-xl font-bold text-white text-lg shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-3",
                                        loading
                                            ? "bg-gray-400 cursor-not-allowed"
                                            : "bg-[#FE5815] hover:bg-[#e04505] shadow-orange-500/20"
                                    )}
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : <Send size={24} />}
                                    Valider la commande
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Status Message */}
                    <AnimatePresence>
                        {status && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className={clsx(
                                    "mt-6 p-4 rounded-xl flex items-center gap-3",
                                    status === 'success' ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
                                )}
                            >
                                {status === 'success' ? <Package size={20} /> : <AlertCircle size={20} />}
                                <p className="font-medium">{message}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                </form>
            </div>
        </div>
    );
}
