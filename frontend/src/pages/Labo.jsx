import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { useOffline } from '../context/OfflineContext';
import { Microscope, CheckCircle, XCircle, Search, RefreshCw, ClipboardCheck, ArrowRight, Gauge, Scan } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import QRScanner from '../components/common/QRScanner';

export default function Labo() {
    const formRef = useRef(null);
    // Data State
    const [tests, setTests] = useState([]);
    const [loadingTests, setLoadingTests] = useState(false);

    // Form State
    const [selectedNSerie, setSelectedNSerie] = useState('');
    const [resultatOk, setResultatOk] = useState(true);

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [showScanner, setShowScanner] = useState(false);

    // UI State
    const [submitting, setSubmitting] = useState(false);
    const [status, setStatus] = useState(null);
    const [message, setMessage] = useState('');

    // Filtered tests based on search
    const filteredTests = tests.filter(item =>
        item.n_serie.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        fetchTests();
    }, []);

    const fetchTests = async () => {
        setLoadingTests(true);
        try {
            const params = {
                etat: 'a_tester'
            };
            const res = await api.get('/concentrateurs/', { params });
            setTests(res.data.results || res.data);
        } catch (err) {
            console.error("Erreur chargement tests", err);
        } finally {
            setLoadingTests(false);
        }
    };

    const handleSelect = (nSerie) => {
        setSelectedNSerie(nSerie);

        setStatus(null);
        // Auto-scroll to form on mobile
        if (window.innerWidth < 1024) {
            setTimeout(() => {
                formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    };

    // Handle direct input of n_serie (when user types and presses Enter)
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            setSelectedNSerie(searchQuery.trim());
            setStatus(null);
        }
    };

    const { isOnline, addToQueue } = useOffline();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedNSerie) return;

        setSubmitting(true);
        setStatus(null);

        // Offline Handling
        if (!isOnline) {
            addToQueue({
                type: 'Test Laboratoire',
                url: '/actions/test/',
                payload: {
                    n_serie: selectedNSerie,
                    resultat_ok: resultatOk
                }
            });
            setStatus('success');
            setMessage(`Test enregistré hors connexion pour ${selectedNSerie}. Sera synchronisé ultérieurement.`);
            setSelectedNSerie('');
            setSearchQuery('');
            setSubmitting(false);
            return;
        }

        try {
            await api.post('/actions/test/', {
                n_serie: selectedNSerie,
                resultat_ok: resultatOk
            });
            setStatus('success');
            setMessage(`Test enregistré pour ${selectedNSerie} : ${resultatOk ? 'FONCTIONNEL' : 'HORS SERVICE'}`);
            setSelectedNSerie('');
            setSearchQuery('');
            fetchTests(); // Refresh list
        } catch (err) {
            console.error(err);
            setStatus('error');
            setMessage(err.response?.data?.error || "Erreur lors de l'enregistrement du test.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 p-4">
            <header>
                <h1 className="text-3xl font-bold text-[#001A70] dark:text-white flex items-center gap-3">
                    <Microscope size={32} className="text-[#509E2F]" />
                    Laboratoire de Test
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Diagnostique et validation des équipements retournés.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* List of To-Test */}
                <div className="bg-white dark:bg-[#16202A] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 flex flex-col h-[400px] lg:h-[500px]">
                    <div className="flex items-center justify-between mb-4 border-b border-gray-100 dark:border-gray-700 pb-4">
                        <h2 className="text-xl font-bold text-[#001A70] dark:text-white flex items-center gap-2">
                            <Gauge size={20} className="text-[#FE5815]" />
                            File d'attente (À Tester)
                        </h2>
                        <button onClick={fetchTests} className="text-gray-400 hover:text-blue-500 transition-colors">
                            <RefreshCw size={20} />
                        </button>
                    </div>

                    {/* Search Input for Concentrators */}
                    <form onSubmit={handleSearchSubmit} className="mb-4">
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setShowScanner(true)}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#FE5815] transition-colors"
                            >
                                <Scan size={18} />
                            </button>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Rechercher / Scanner..."
                                className="w-full bg-gray-50 dark:bg-[#0F1720] border border-gray-200 dark:border-gray-700 rounded-xl py-3 pl-10 pr-4 text-sm font-mono text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#509E2F] focus:border-transparent transition-all placeholder-gray-400"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hidden sm:block">
                                Entrée = sélectionner
                            </span>
                        </div>
                    </form>

                    <AnimatePresence>
                        {showScanner && (
                            <QRScanner
                                onScanSuccess={(decodedText) => {
                                    setSearchQuery(decodedText);
                                    setSelectedNSerie(decodedText);
                                    setShowScanner(false);
                                }}
                                onClose={() => setShowScanner(false)}
                            />
                        )}
                    </AnimatePresence>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                        {loadingTests ? (
                            <div className="text-center py-10 text-gray-400">Chargement...</div>
                        ) : filteredTests.length > 0 ? (
                            filteredTests.map((item) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    key={item.id}
                                    onClick={() => handleSelect(item.n_serie)}
                                    className={clsx(
                                        "p-4 rounded-xl border cursor-pointer transition-all flex justify-between items-center group",
                                        selectedNSerie === item.n_serie
                                            ? "bg-[#E8F0FE] border-[#1C73E8] dark:bg-blue-900/30 dark:border-blue-500 shadow-md"
                                            : "bg-gray-50 border-gray-100 hover:border-blue-300 dark:bg-[#0F1720] dark:border-gray-700 hover:bg-white dark:hover:bg-[#1C2530]"
                                    )}
                                >
                                    <div>
                                        <p className="font-mono font-bold text-[#001A70] dark:text-blue-300 text-lg">{item.n_serie}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                                {item.operateur || 'Opérateur inconnu'}
                                            </span>
                                            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                                                {item.affectation || 'Inconnu'}
                                            </span>
                                        </div>
                                    </div>
                                    <ArrowRight size={20} className={clsx("transition-transform text-[#1C73E8]", selectedNSerie === item.n_serie ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 group-hover:translate-x-0 group-hover:opacity-50")} />
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-12 text-gray-400 flex flex-col items-center">
                                <ClipboardCheck size={48} className="mb-4 opacity-20" />
                                <p>{searchQuery ? 'Aucun résultat trouvé.' : 'File d\'attente vide.'}</p>
                                <p className="text-sm">{searchQuery ? 'Essayez un autre numéro ou appuyez sur Entrée.' : 'Aucun concentrateur à tester pour le moment.'}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Test Action Form */}
                <div ref={formRef} className="bg-white dark:bg-[#16202A] rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 flex flex-col justify-center relative overflow-hidden scroll-mt-24">
                    <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-[#001A70] to-[#1C73E8]"></div>

                    <h2 className="text-2xl font-bold text-[#001A70] dark:text-white mb-8 pl-4">Saisie du Diagnostic</h2>

                    {selectedNSerie ? (
                        <form onSubmit={handleSubmit} className="space-y-8 pl-4">
                            <div className="bg-gray-50 dark:bg-[#0F1720] p-6 rounded-2xl border border-gray-100 dark:border-gray-700 text-center relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-2 opacity-10">
                                    <Microscope size={64} className="text-[#001A70] dark:text-white" />
                                </div>
                                <span className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-widest font-bold">Équipement en cours</span>
                                <p className="text-4xl font-mono font-bold text-[#001A70] dark:text-blue-400 mt-2 tracking-tight">{selectedNSerie}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <button
                                    type="button"
                                    onClick={() => setResultatOk(true)}
                                    className={clsx(
                                        "p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-4 group",
                                        resultatOk
                                            ? "border-[#509E2F] bg-[#F0FDF4] text-[#14532D] dark:bg-green-900/20 dark:text-green-400 shadow-md ring-2 ring-green-500/20"
                                            : "border-gray-100 bg-white text-gray-400 hover:border-green-200 dark:bg-[#0F1720] dark:border-gray-700"
                                    )}
                                >
                                    <CheckCircle size={40} className={clsx("transition-transform group-hover:scale-110", resultatOk ? "text-[#509E2F]" : "text-gray-300")} />
                                    <span className="font-bold text-xs md:text-lg">FONCTIONNEL</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setResultatOk(false)}
                                    className={clsx(
                                        "p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-4 group",
                                        !resultatOk
                                            ? "border-[#EF4444] bg-[#FEF2F2] text-[#991B1B] dark:bg-red-900/20 dark:text-red-400 shadow-md ring-2 ring-red-500/20"
                                            : "border-gray-100 bg-white text-gray-400 hover:border-red-200 dark:bg-[#0F1720] dark:border-gray-700"
                                    )}
                                >
                                    <XCircle size={40} className={clsx("transition-transform group-hover:scale-110", !resultatOk ? "text-[#EF4444]" : "text-gray-300")} />
                                    <span className="font-bold text-xs md:text-lg">HORS SERVICE</span>
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-5 bg-[#001A70] hover:bg-[#00218f] dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-lg font-bold rounded-xl shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98]"
                            >
                                {submitting ? "Traitement..." : "Valider le diagnostic"}
                            </button>
                        </form>
                    ) : (
                        <div className="text-center text-gray-400 py-16 border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-2xl bg-gray-50/50 dark:bg-[#0F1720]/50 ml-4">
                            <Search size={48} className="mx-auto mb-4 opacity-20" />
                            <p className="font-medium">Aucun équipement sélectionné</p>
                            <p className="text-sm mt-1">Cliquez sur un élément de la liste pour commencer.</p>
                        </div>
                    )}

                    <AnimatePresence>
                        {status && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, height: 0 }}
                                animate={{ opacity: 1, y: 0, height: 'auto' }}
                                exit={{ opacity: 0, y: 10, height: 0 }}
                                className={clsx(
                                    "mt-6 p-4 rounded-xl text-center font-bold text-lg border ml-4",
                                    status === 'success'
                                        ? "bg-[#F0FDF4] text-[#166534] border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
                                        : "bg-[#FEF2F2] text-[#991B1B] border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
                                )}
                            >
                                {message}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
