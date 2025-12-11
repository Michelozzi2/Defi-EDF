import React, { useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { ShoppingCart, Plus, Minus, Send, AlertCircle, Loader2, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

export default function Commande() {
    const [operateur, setOperateur] = useState('');
    const [nbCartons, setNbCartons] = useState(1);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!operateur.trim() || nbCartons < 1) return;

        setLoading(true);
        setStatus(null);

        try {
            await api.post('/actions/commande/', {
                operateur: operateur,
                nb_cartons: nbCartons
            });
            setStatus('success');
            setMessage(`Commande de ${nbCartons} cartons pour ${operateur} effectuée avec succès !`);
            setNbCartons(1);
            setOperateur('');
        } catch (err) {
            console.error(err);
            setStatus('error');
            setMessage(err.response?.data?.error || "Une erreur est survenue lors de la commande.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="max-w-2xl mx-auto">
                <div className="mb-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 text-[#FE5815] rounded-2xl mb-4">
                        <ShoppingCart size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-[#001A70]">Commande Cartons</h1>
                    <p className="text-gray-500 mt-2">Commander des nouveaux cartons pour un opérateur.</p>
                </div>

                <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 relative overflow-hidden">
                    <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-orange-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>

                    <form onSubmit={handleSubmit} className="relative z-10 space-y-8">
                        {/* Operator Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 ml-1">Opérateur Destinataire</label>
                            <input
                                type="text"
                                value={operateur}
                                onChange={(e) => setOperateur(e.target.value)}
                                placeholder="Nom de l'opérateur (ex: Eiffage)"
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-4 px-4 text-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE5815] transition-all"
                            />
                        </div>

                        {/* Quantity Selector */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 ml-1">Nombre de Cartons</label>
                            <div className="flex items-center gap-4">
                                <button
                                    type="button"
                                    onClick={() => setNbCartons(Math.max(1, nbCartons - 1))}
                                    className="p-4 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                                >
                                    <Minus size={24} />
                                </button>
                                <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl py-4 flex items-center justify-center gap-3">
                                    <Package className="text-gray-400" />
                                    <span className="text-2xl font-bold text-[#001A70]">{nbCartons}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setNbCartons(nbCartons + 1)}
                                    className="p-4 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                                >
                                    <Plus size={24} />
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={clsx(
                                "w-full py-5 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-3",
                                loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#FE5815] hover:bg-[#e04505] shadow-orange-900/20"
                            )}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" /> Envoi...
                                </>
                            ) : (
                                <>
                                    <Send size={20} /> Valider la Commande
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
                                {status === 'success' ? <Package className="shrink-0" /> : <AlertCircle className="shrink-0" />}
                                <div>
                                    <h4 className="font-bold">{status === 'success' ? "Succès" : "Erreur"}</h4>
                                    <p className="text-sm opacity-90">{message}</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </Layout>
    );
}
