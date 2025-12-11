import React, { useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { Wrench, ArrowDownCircle, ArrowUpCircle, Send, AlertCircle, Loader2, MapPin, CircuitBoard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

export default function Operations() {
    const [activeTab, setActiveTab] = useState('pose'); // 'pose' | 'depose'

    // Form State
    const [nSerie, setNSerie] = useState('');
    const [posteId, setPosteId] = useState('');

    // UI State
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!nSerie.trim() || !posteId.trim()) return;

        setLoading(true);
        setStatus(null);

        const endpoint = activeTab === 'pose' ? '/actions/pose/' : '/actions/depose/';

        try {
            await api.post(endpoint, {
                n_serie: nSerie,
                poste_id: posteId
            });
            setStatus('success');
            setMessage(activeTab === 'pose' ? "Pose effectuée avec succès !" : "Dépose effectuée avec succès !");
            setNSerie('');
            setPosteId('');
        } catch (err) {
            console.error(err);
            setStatus('error');
            setMessage(err.response?.data?.error || "Une erreur est survenue lors de l'opération.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="max-w-2xl mx-auto">
                <div className="mb-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-[#509E2F] rounded-2xl mb-4">
                        <Wrench size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-[#001A70]">Opérations Terrain</h1>
                    <p className="text-gray-500 mt-2">Gérer la pose et la dépose des concentrateurs.</p>
                </div>

                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 relative overflow-hidden">

                    {/* Tabs */}
                    <div className="flex border-b border-gray-100">
                        <button
                            onClick={() => { setActiveTab('pose'); setStatus(null); }}
                            className={clsx(
                                "flex-1 py-6 font-bold flex items-center justify-center gap-2 transition-colors relative",
                                activeTab === 'pose' ? "text-[#001A70]" : "text-gray-400 hover:text-gray-600"
                            )}
                        >
                            <ArrowDownCircle size={20} /> Pose
                            {activeTab === 'pose' && (
                                <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-1 bg-[#001A70]" />
                            )}
                        </button>
                        <button
                            onClick={() => { setActiveTab('depose'); setStatus(null); }}
                            className={clsx(
                                "flex-1 py-6 font-bold flex items-center justify-center gap-2 transition-colors relative",
                                activeTab === 'depose' ? "text-[#FE5815]" : "text-gray-400 hover:text-gray-600"
                            )}
                        >
                            <ArrowUpCircle size={20} /> Dépose
                            {activeTab === 'depose' && (
                                <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-1 bg-[#FE5815]" />
                            )}
                        </button>
                    </div>

                    <div className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 ml-1">Numéro de Série (Concentrateur)</label>
                                <div className="relative group">
                                    <CircuitBoard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#001A70] transition-colors" />
                                    <input
                                        type="text"
                                        value={nSerie}
                                        onChange={(e) => setNSerie(e.target.value)}
                                        placeholder="Ex: C-1000"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-4 pl-12 pr-4 text-lg font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#001A70] transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 ml-1">ID du Poste / Linky</label>
                                <div className="relative group">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#001A70] transition-colors" />
                                    <input
                                        type="text"
                                        value={posteId}
                                        onChange={(e) => setPosteId(e.target.value)}
                                        placeholder="Ex: P-999"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-4 pl-12 pr-4 text-lg font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#001A70] transition-all"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={clsx(
                                    "w-full py-5 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-3",
                                    loading
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : activeTab === 'pose' ? "bg-[#001A70] hover:bg-[#00218f] shadow-blue-900/20" : "bg-[#FE5815] hover:bg-[#e04505] shadow-orange-900/20"
                                )}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin" /> Traitement...
                                    </>
                                ) : (
                                    <>
                                        <Send size={20} /> {activeTab === 'pose' ? "Valider la Pose" : "Valider la Dépose"}
                                    </>
                                )}
                            </button>
                        </form>

                        <AnimatePresence>
                            {status && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, height: 0 }}
                                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                                    exit={{ opacity: 0, y: 10, height: 0 }}
                                    className={clsx(
                                        "mt-6 p-4 rounded-xl flex items-start gap-3",
                                        status === 'success' ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
                                    )}
                                >
                                    {status === 'success' ? <Wrench className="shrink-0" /> : <AlertCircle className="shrink-0" />}
                                    <div>
                                        <h4 className="font-bold">{status === 'success' ? "Succès" : "Erreur"}</h4>
                                        <p className="text-sm opacity-90">{message}</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
