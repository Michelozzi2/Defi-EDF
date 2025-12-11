import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Scan, PackageCheck, Send, AlertCircle, Loader2, Truck, Package, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

export default function Reception() {
    const [numCarton, setNumCarton] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null); // 'success' | 'error' | null
    const [message, setMessage] = useState('');

    // Incoming Cartons List
    const [incomingCartons, setIncomingCartons] = useState([]);
    const [loadingCartons, setLoadingCartons] = useState(true);

    useEffect(() => {
        fetchIncomingCartons();
    }, []);

    const fetchIncomingCartons = async () => {
        try {
            // Fetch cartons with concentrateurs in 'en_livraison' state
            const res = await api.get('/cartons/en_livraison/');
            setIncomingCartons(res.data || []);
        } catch (error) {
            console.error("Error fetching cartons:", error);
        } finally {
            setLoadingCartons(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!numCarton.trim()) return;

        setLoading(true);
        setStatus(null);

        try {
            await api.post('/actions/reception/', { num_carton: numCarton });
            setStatus('success');
            setMessage(`Carton ${numCarton} réceptionné avec succès !`);
            setNumCarton('');
            // Refresh list (maybe remove the received one or update status)
            fetchIncomingCartons();
        } catch (err) {
            console.error(err);
            setStatus('error');
            setMessage(err.response?.data?.error || "Une erreur est survenue lors de la réception.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="h-[calc(100vh-6rem)] max-w-7xl mx-auto p-4 flex flex-col gap-6 overflow-hidden">
                {/* Header - Compact */}
                <div className="shrink-0 flex items-center gap-4 mb-2">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-[#001A70] dark:text-blue-300 rounded-xl">
                        <PackageCheck size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-[#001A70] dark:text-white">Réception Magasin</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Scanner les cartons entrants.</p>
                    </div>
                </div>

                <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">

                    {/* Incoming List - Left/Top - Takes space */}
                    <div className="flex-1 bg-white dark:bg-[#16202A] rounded-3xl shadow-lg border border-gray-100 dark:border-gray-800 flex flex-col min-h-0">
                        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-[#0F1720]/50 rounded-t-3xl">
                            <h3 className="font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                                <Truck size={20} className="text-[#509E2F]" />
                                En Livraison / Arrivages
                            </h3>
                            <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full font-mono">
                                {incomingCartons.length} en attente
                            </span>
                        </div>

                        <div className="flex-1 overflow-y-auto p-2 space-y-2">
                            <AnimatePresence>
                                {incomingCartons.map((carton) => (
                                    <motion.div
                                        key={carton.id || carton.num_carton}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        onClick={() => setNumCarton(carton.num_carton)}
                                        className="p-3 bg-white dark:bg-[#1A2634] border border-gray-100 dark:border-gray-700 rounded-xl hover:shadow-md hover:border-[#FE5815] transition-all cursor-pointer group flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-400 group-hover:text-[#FE5815] transition-colors">
                                                <Package size={18} />
                                            </div>
                                            <div>
                                                <span className="block font-mono font-bold text-gray-800 dark:text-gray-200 group-hover:text-[#FE5815]">
                                                    {carton.num_carton}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {carton.date_expedition ? new Date(carton.date_expedition).toLocaleDateString() : 'En transit'}
                                                </span>
                                            </div>
                                        </div>
                                        <ChevronRight size={16} className="text-gray-300 group-hover:text-[#FE5815]" />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {incomingCartons.length === 0 && (
                                <div className="text-center py-10 text-gray-400 italic">
                                    Aucun carton en livraison.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Scanner Form - Right/Bottom - Compact */}
                    <div className="shrink-0 w-full lg:w-96">
                        <div className="bg-white dark:bg-[#16202A] rounded-3xl shadow-xl p-6 border border-gray-100 dark:border-gray-800 relative overflow-hidden h-full flex flex-col justify-center">
                            {/* Decorative Blob */}
                            <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-50 dark:bg-blue-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-70 animate-blob"></div>

                            <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
                                <div>
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1 uppercase tracking-wide">Numéro de Carton</label>
                                    <div className="relative group mt-2">
                                        <Scan className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#FE5815] transition-colors" size={24} />
                                        <input
                                            type="text"
                                            value={numCarton}
                                            onChange={(e) => setNumCarton(e.target.value)}
                                            placeholder="Ex: CRT-2023-001"
                                            className="w-full bg-gray-50 dark:bg-[#0F1720] border border-gray-200 dark:border-gray-700 rounded-xl py-4 pl-12 pr-4 text-xl font-mono text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FE5815] focus:border-transparent transition-all placeholder-gray-300"
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={clsx(
                                        "w-full py-4 rounded-xl font-bold text-white text-lg shadow-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-3",
                                        loading
                                            ? "bg-gray-400 cursor-not-allowed"
                                            : "bg-gradient-to-r from-[#509E2F] to-[#60A93F] hover:from-[#408E1F] hover:to-[#509E2F] shadow-[#509E2F]/20"
                                    )}
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : <PackageCheck size={24} />}
                                    Réceptionner
                                </button>
                            </form>

                            {/* Status Message */}
                            <AnimatePresence>
                                {status && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className={clsx(
                                            "mt-6 p-4 rounded-xl flex items-center gap-3",
                                            status === 'success' ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                                        )}
                                    >
                                        {status === 'success' ? <PackageCheck size={20} /> : <AlertCircle size={20} />}
                                        <p className="font-medium">{message}</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
