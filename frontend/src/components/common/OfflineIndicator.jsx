import React, { useState } from 'react';
import { useOffline } from '../../context/OfflineContext';
import { WifiOff, Wifi, RefreshCcw, Database, AlertCircle, CheckCircle, X, Trash2, Play, ChevronRight, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

export default function OfflineIndicator() {
    const { isOnline, queue, syncQueue, toggleOfflineSimulation, isSimulatedOffline, syncReport, clearReport, syncOne, removeFromQueue } = useOffline();
    const [expanded, setExpanded] = useState(false);
    const [expandedItems, setExpandedItems] = useState(new Set());

    // Auto-expand if queue has items and we are offline OR if we have a report
    React.useEffect(() => {
        if ((!isOnline && queue.length > 0) || syncReport) {
            setExpanded(true);
        }
    }, [isOnline, queue.length, syncReport]);

    // If online, empty queue, no report, and not simulated -> Hidden (except dev toggle)
    if (isOnline && queue.length === 0 && !isSimulatedOffline && !syncReport) {
        return (
            <div className="fixed bottom-4 right-4 z-50">
                <button
                    onClick={toggleOfflineSimulation}
                    className="p-2 bg-gray-800 text-white rounded-full opacity-30 hover:opacity-100 transition-opacity text-xs"
                    title="Simuler coupure réseau"
                >
                    <WifiOff size={16} />
                </button>
            </div>
        );
    }

    const hasErrors = syncReport?.errors?.length > 0;

    return (
        <div className={clsx(
            "text-white relative z-50 transition-colors",
            hasErrors ? "bg-red-600" : (syncReport ? "bg-green-600" : "bg-edf-orange")
        )}>
            <div
                className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between text-sm font-medium cursor-pointer"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-2">
                    {syncReport ? (
                        <div className="flex items-center gap-2">
                            {hasErrors ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
                            <span className="font-bold">Rapport de Synchronisation</span>
                            {hasErrors && <span className="text-xs bg-white/20 px-2 py-0.5 rounded">{syncReport.errors.length} Erreur(s)</span>}
                        </div>
                    ) : isOnline ? (
                        <div className="flex items-center gap-2">
                            <span
                                onClick={(e) => { e.stopPropagation(); toggleOfflineSimulation(); }}
                                className="cursor-pointer hover:underline flex items-center gap-1"
                            >
                                <RefreshCcw size={18} className="animate-spin" />
                                <span>Connexion rétablie - Synchronisation nécessaire</span>
                            </span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <WifiOff size={18} />
                            <span className="font-bold">Mode Hors Connexion {isSimulatedOffline ? '(Simulation)' : ''}</span>
                            {isSimulatedOffline && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); toggleOfflineSimulation(); }}
                                    className="ml-2 px-2 py-0.5 bg-white/20 rounded text-xs hover:bg-white/30"
                                >
                                    Rétablir
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    {!syncReport && queue.length > 0 && (
                        <span className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded text-xs">
                            <Database size={14} />
                            {queue.length} en attente
                        </span>
                    )}
                    {expanded ? <X size={18} /> : <Database size={18} />}
                </div>
            </div>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-black/10 backdrop-blur-sm border-t border-white/10"
                    >
                        <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">

                            {/* Sync Report Display */}
                            {syncReport && (

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                                        <div>
                                            <h4 className="font-bold flex items-center gap-2">
                                                {hasErrors ? 'Des erreurs sont survenues' : 'Synchronisation terminée'}
                                            </h4>
                                            <p className="text-xs opacity-70 mt-1">
                                                Veuillez rafraîchir la page pour mettre à jour les listes.
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            {queue.length === 0 && (
                                                <button
                                                    onClick={() => window.location.reload()}
                                                    className="px-3 py-1 bg-blue-500 hover:bg-blue-600 rounded text-xs font-bold transition-colors flex items-center gap-1"
                                                >
                                                    <RefreshCcw size={12} />
                                                    Rafraîchir
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Report List */}
                                    <div className="space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
                                        {/* Errors */}
                                        {syncReport.errors.map((item, idx) => (
                                            <div
                                                key={`err-${idx}`}
                                                className="bg-red-900/40 border border-red-500/30 rounded overflow-hidden cursor-pointer"
                                                onClick={() => setExpandedItems(prev => {
                                                    const newSet = new Set(prev);
                                                    if (newSet.has(item.id)) newSet.delete(item.id);
                                                    else newSet.add(item.id);
                                                    return newSet;
                                                })}
                                            >
                                                <div className="p-3 flex justify-between items-start">
                                                    <div className="flex items-center gap-2">
                                                        <AlertCircle size={16} className="text-red-300 mt-0.5 shrink-0" />
                                                        <div>
                                                            <span className="font-bold text-sm block">{item.type}</span>
                                                            <span className="text-xs opacity-80">{item.message}</span>
                                                        </div>
                                                    </div>
                                                    <ChevronRight size={16} className={clsx("transition-transform", expandedItems.has(item.id) ? "rotate-90" : "")} />
                                                </div>
                                                {expandedItems.has(item.id) && (
                                                    <div className="px-3 pb-3 pt-0 text-xs font-mono opacity-80 break-all bg-black/20 p-2 mx-3 mb-3 rounded">
                                                        {JSON.stringify(item.payload, null, 2)}
                                                    </div>
                                                )}
                                            </div>
                                        ))}

                                        {/* Successes */}
                                        {syncReport.success.map((item, idx) => (
                                            <div
                                                key={`succ-${idx}`}
                                                className="bg-green-900/40 border border-green-500/30 rounded overflow-hidden cursor-pointer"
                                                onClick={() => setExpandedItems(prev => {
                                                    const newSet = new Set(prev);
                                                    if (newSet.has(item.id)) newSet.delete(item.id);
                                                    else newSet.add(item.id);
                                                    return newSet;
                                                })}
                                            >
                                                <div className="p-3 flex justify-between items-center">
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle size={16} className="text-green-300 shrink-0" />
                                                        <div>
                                                            <span className="font-bold text-sm block">{item.type}</span>
                                                            <span className="text-xs opacity-80">{item.message}</span>
                                                        </div>
                                                    </div>
                                                    <ChevronRight size={16} className={clsx("transition-transform", expandedItems.has(item.id) ? "rotate-90" : "")} />
                                                </div>
                                                {expandedItems.has(item.id) && (
                                                    <div className="px-3 pb-3 pt-0 text-xs font-mono opacity-80 break-all bg-black/20 p-2 mx-3 mb-3 rounded">
                                                        {JSON.stringify(item.payload, null, 2)}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Standard Queue Display */}
                            {queue.length > 0 && (
                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between items-center">
                                        <h4 className="font-bold text-sm opacity-90">Opérations en attente</h4>
                                        {isOnline && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); syncQueue(); }}
                                                className="px-3 py-1 bg-white text-edf-orange rounded text-xs font-bold hover:bg-gray-100 transition-colors flex items-center gap-1"
                                            >
                                                <RefreshCcw size={14} />
                                                Tout Synchroniser
                                            </button>
                                        )}
                                    </div>
                                    <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                                        {queue.map((item) => (
                                            <div key={item.id} className={clsx(
                                                "p-3 rounded flex justify-between items-center group transition-colors",
                                                item.lastError ? "bg-red-500/20 border border-red-500/50" : "bg-white/10"
                                            )}>
                                                <div className="overflow-hidden">
                                                    <span className="font-bold block">{item.type}</span>
                                                    <span className="text-xs opacity-75 font-mono block truncate">
                                                        {new Date(item.timestamp).toLocaleTimeString()} • {JSON.stringify(item.payload)}
                                                    </span>
                                                    {item.lastError && (
                                                        <div className="mt-1 text-xs text-red-300 font-bold flex items-center gap-1 bg-red-900/40 p-1 rounded w-fit">
                                                            <AlertCircle size={10} />
                                                            {item.lastError}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0 ml-2">
                                                    {isOnline && (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); syncOne(item.id); }}
                                                            className="p-1.5 bg-white/20 hover:bg-green-500 rounded transition-colors text-white"
                                                            title="Synchroniser cet élément"
                                                        >
                                                            <Play size={14} className="fill-current" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); removeFromQueue(item.id); }}
                                                        className="p-1.5 bg-white/20 hover:bg-red-500 rounded transition-colors text-white"
                                                        title="Supprimer cet élément"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {!syncReport && queue.length === 0 && (
                                <p className="text-center opacity-70 py-4 text-sm">Aucune action en attente.</p>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
