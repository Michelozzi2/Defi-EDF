import React from 'react';
import { motion } from 'framer-motion';
import { Package, X, Clock, RefreshCcw, ArrowDownRight } from 'lucide-react';
import clsx from 'clsx';

export default function DetailModal({ selectedItem, onClose, history, loadingHistory }) {
    if (!selectedItem) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop with Blur */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/40 backdrop-blur-md"
                onClick={onClose}
            />
            {/* Modal Content */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white dark:bg-[#16202A] rounded-2xl p-0 max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-100 dark:border-gray-800 relative overflow-hidden z-10"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0F1720]/50 flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Package className="text-edf-blue dark:text-blue-400" size={24} />
                            Concentrateur
                        </h3>
                        <p className="text-sm text-gray-500 font-mono mt-1">{selectedItem.n_serie}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-500"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-8 overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-4 bg-gray-50 dark:bg-[#0F1720] rounded-xl">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">État Actuel</span>
                            <span className={clsx(
                                "font-semibold",
                                selectedItem.etat === 'en_stock' ? "text-edf-green" :
                                    selectedItem.etat === 'HS' ? "text-red-600" :
                                        selectedItem.etat === 'en_livraison' ? "text-edf-orange" :
                                            "text-edf-blue dark:text-blue-400"
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

                    {/* Timeline / History */}
                    <div>
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Clock size={20} />
                            Historique Complet
                        </h4>

                        {loadingHistory ? (
                            <div className="flex justify-center p-8">
                                <RefreshCcw className="animate-spin text-gray-400" size={24} />
                            </div>
                        ) : (
                            <div className="relative pl-4 space-y-8 before:content-[''] before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100 dark:before:bg-gray-800">
                                {history.map((h, index) => (
                                    <div key={h.id || index} className="relative pl-6">
                                        {/* Dot */}
                                        <div className={clsx(
                                            "absolute left-0 top-1.5 w-4 h-4 rounded-full border-4 border-white dark:border-[#16202A] z-10",
                                            index === 0 ? "bg-blue-600 ring-4 ring-blue-100 dark:ring-blue-900/30" : "bg-gray-300 dark:bg-gray-600"
                                        )}></div>

                                        <div className="bg-gray-50 dark:bg-[#0F1720] rounded-xl p-4 border border-gray-100 dark:border-gray-800">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <span className="font-bold text-gray-900 dark:text-white block">
                                                        {h.action_display}
                                                    </span>
                                                    <span className="text-sm text-gray-500 flex items-center gap-1">
                                                        par <span className="font-medium text-gray-700 dark:text-gray-300">{h.user_name || 'Système'}</span>
                                                    </span>
                                                </div>
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className="text-xs font-mono text-gray-400 bg-white dark:bg-[#16202A] px-2 py-1 rounded border border-gray-100 dark:border-gray-800 whitespace-nowrap">
                                                        {new Date(h.timestamp).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Diff view */}
                                            <div className="grid grid-cols-1 gap-3 mb-4">
                                                {h.nouvel_etat && (
                                                    <div className="text-sm">
                                                        <span className="text-gray-400 text-xs uppercase tracking-wider block mb-0.5">État</span>
                                                        <div className="flex items-center gap-2">
                                                            {h.ancien_etat && (
                                                                <span className="text-gray-400 line-through decoration-gray-400/50">{h.ancien_etat === 'en_attente_reconditionnement' ? 'ATTENTE RECOND' : h.ancien_etat}</span>
                                                            )}
                                                            {h.ancien_etat && < ArrowDownRight size={14} className="text-gray-300" />}
                                                            <span className={clsx("font-medium",
                                                                h.nouvel_etat === 'en_stock' ? "text-green-600" :
                                                                    h.nouvel_etat === 'HS' ? "text-red-600" :
                                                                        "text-edf-blue dark:text-blue-400"
                                                            )}>{h.nouvel_etat}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Bottom Right Affectation */}
                                            {h.nouvelle_affectation && (
                                                <div className="absolute bottom-4 right-4 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-800/50">
                                                    <span className="text-xs font-bold text-edf-blue dark:text-blue-300 uppercase tracking-wide">
                                                        {h.nouvelle_affectation}
                                                    </span>
                                                </div>
                                            )}

                                            {h.commentaire && (
                                                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 italic flex gap-2">
                                                        <span className="text-gray-300">"</span>
                                                        {h.commentaire}
                                                        <span className="text-gray-300">"</span>
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {history.length === 0 && (
                                    <div className="pl-6 text-gray-400 italic">Aucun historique disponible.</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0F1720]/50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-white dark:bg-[#16202A] border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1E293B] transition-colors"
                    >
                        Fermer
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
