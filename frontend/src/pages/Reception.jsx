import React, { useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Scan, PackageCheck, Send, AlertCircle, Loader2 } from 'lucide-react';
import clsx from 'clsx';

export default function Reception() {
    const [numCarton, setNumCarton] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null); // 'success' | 'error' | null
    const [message, setMessage] = useState('');

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
            <div className="max-w-2xl mx-auto">
                <div className="mb-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-[#001A70] rounded-2xl mb-4">
                        <PackageCheck size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-[#001A70]">Réception Magasin</h1>
                    <p className="text-gray-500 mt-2">Scanner ou saisir le numéro du carton entrant.</p>
                </div>

                <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 relative overflow-hidden">
                    {/* Decorative Blob */}
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>

                    <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 ml-1">Numéro de Carton</label>
                            <div className="relative group">
                                <Scan className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#FE5815] transition-colors" />
                                <input
                                    type="text"
                                    value={numCarton}
                                    onChange={(e) => setNumCarton(e.target.value)}
                                    placeholder="Ex: CRT-2023-001"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-5 pl-12 pr-4 text-lg font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE5815] focus:border-transparent transition-all placeholder-gray-300"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={clsx(
                                "w-full py-5 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-3",
                                loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#001A70] hover:bg-[#00218f] shadow-blue-900/20"
                            )}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" /> Traitement...
                                </>
                            ) : (
                                <>
                                    <Send size={20} /> Valider la Réception
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
                                {status === 'success' ? <PackageCheck className="shrink-0" /> : <AlertCircle className="shrink-0" />}
                                <div>
                                    <h4 className="font-bold">{status === 'success' ? "Succès" : "Erreur"}</h4>
                                    <p className="text-sm opacity-90">{message}</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-400">
                        Cette action mettra à jour le stock et l'historique des concentrateurs.
                    </p>
                </div>
            </div>
        </Layout>
    );
}
