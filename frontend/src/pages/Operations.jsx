import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { Wrench, ArrowDownCircle, ArrowUpCircle, Send, AlertCircle, Loader2, MapPin, CircuitBoard, Plus, RefreshCw, ChevronDown, Check, Scan } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { useTheme } from '../context/ThemeContext';
import { useOffline } from '../context/OfflineContext';
import QRScanner from '../components/common/QRScanner';

// Local SearchableSelect removed, imported from common
import SearchableSelect from '../components/common/SearchableSelect';

export default function Operations() {
    const [activeTab, setActiveTab] = useState('pose');
    const { theme } = useTheme();
    const { isOnline, addToQueue } = useOffline();

    // Form State
    const [nSerie, setNSerie] = useState('');
    const [posteId, setPosteId] = useState('');

    // Data State
    const [stock, setStock] = useState([]);
    const [postes, setPostes] = useState([]); // List of available postes
    const [user, setUser] = useState(null);

    // Search State for Stock
    const [stockSearch, setStockSearch] = useState('');
    const [showScanner, setShowScanner] = useState(false);

    // Filtered stock based on search
    const filteredStock = stock.filter(item =>
        item.n_serie.toLowerCase().includes(stockSearch.toLowerCase())
    );

    // UI State
    const [loading, setLoading] = useState(false);
    const [loadingStock, setLoadingStock] = useState(false);
    const [loadingPostes, setLoadingPostes] = useState(false);
    const [status, setStatus] = useState(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const userRes = await api.get('/auth/me/');
            setUser(userRes.data);
            fetchStock(userRes.data);
            fetchPostes(userRes.data);
        } catch (err) {
            console.error("Erreur chargement utilisateur", err);
        }
    };

    const fetchStock = async (userData) => {
        setLoadingStock(true);
        try {
            const params = {
                etat: 'en_stock',
                affectation: userData?.base_operationnelle || ''
            };
            const res = await api.get('/concentrateurs/', { params });
            setStock(res.data.results || res.data);
        } catch (err) {
            console.error("Erreur chargement stock", err);
        } finally {
            setLoadingStock(false);
        }
    };

    // Auto-fill Logic for Depose
    useEffect(() => {
        if (activeTab === 'depose' && posteId) {
            findConcentratorOnPoste(posteId);
        }
    }, [posteId, activeTab]);

    const findConcentratorOnPoste = async (pid) => {
        try {
            // Use backend filter: etat=pose and poste_pose=pid
            const res = await api.get('/concentrateurs/', {
                params: {
                    etat: 'pose',
                    poste_pose: pid
                }
            });
            const found = res.data.results || res.data;
            if (found.length > 0) {
                setNSerie(found[0].n_serie);
            } else {
                setNSerie(''); // Clear if no concentrator found
            }
        } catch (e) {
            console.error("Error finding concentrator on poste", e);
            setNSerie('');
        }
    };

    const fetchPostes = async (userData) => {
        setLoadingPostes(true);
        try {
            // Assume we have an endpoint filtered by user's permission in backend or we filter here
            // Often /api/v1/postes/ 
            const res = await api.get('/postes/'); // Need to check if this endpoint exists and filter
            // Transform for select
            const postOptions = (res.data.results || res.data).map(p => ({
                value: p.id,
                label: `${p.code} - ${p.nom} (${p.base_operationnelle})`
            }));
            setPostes(postOptions);
        } catch (err) {
            console.error("Erreur chargement postes", err);
        } finally {
            setLoadingPostes(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!nSerie.trim() || !posteId) return;

        setLoading(true);
        setStatus(null);

        const endpoint = activeTab === 'pose' ? '/actions/pose/' : '/actions/depose/';
        const payload = { n_serie: nSerie, poste_id: posteId };

        if (!isOnline) {
            try {
                addToQueue({
                    type: activeTab === 'pose' ? 'Pose' : 'Dépose',
                    url: endpoint,
                    payload: payload
                });

                // Simulation of success for UX
                setStatus('success');
                setMessage(
                    <span>
                        Action enregistrée localement.
                        <strong> Attention :</strong> Les validations (doublons, stock) ne seront effectuées qu'au retour de la connexion.
                    </span>
                );
                setNSerie('');
                setPosteId('');
            } catch (error) {
                console.error("Error adding to queue", error);
                setStatus('error');
                setMessage("Erreur lors de la sauvegarde locale.");
            } finally {
                setLoading(false);
            }
            return;
        }

        try {
            await api.post(endpoint, payload);
            setStatus('success');
            setMessage(activeTab === 'pose' ? "Pose validée avec succès." : "Dépose validée avec succès.");
            setNSerie('');
            setPosteId('');
            // Refresh stock after operation only if online
            if (isOnline) fetchStock(user);
        } catch (err) {
            console.error(err);
            setStatus('error');
            setMessage(err.response?.data?.error || "Une erreur est survenue lors de l'opération.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 p-4">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#001A70] dark:text-white flex items-center gap-3">
                        <Wrench className="text-[#FE5815]" size={32} />
                        Opérations Terrain
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Gestion des poses et déposes de concentrateurs.</p>
                </div>
            </header>

            <div className={clsx("grid grid-cols-1 gap-8", activeTab === 'pose' ? "lg:grid-cols-3" : "lg:grid-cols-1 max-w-2xl mx-auto")}>
                {/* Stock List Panel - Only in Pose Mode */}
                {activeTab === 'pose' && (
                    <div className="lg:col-span-1 bg-white dark:bg-[#16202A] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 flex flex-col h-[450px] lg:h-[600px] order-2 lg:order-1">
                        <div className="flex items-center justify-between mb-4 border-b border-gray-100 dark:border-gray-700 pb-3">
                            <h3 className="font-bold text-[#001A70] dark:text-white flex items-center gap-2">
                                <CircuitBoard size={20} className="text-[#509E2F]" />
                                En Stock {user?.base_operationnelle ? `(${user.base_operationnelle})` : ''}
                            </h3>
                            <button onClick={() => fetchStock(user)} className="text-gray-400 hover:text-[#001A70] dark:hover:text-white transition-colors">
                                <RefreshCw size={18} />
                            </button>
                        </div>

                        {/* Search Input for Stock */}
                        <div className="relative mb-4">
                            <CircuitBoard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                value={stockSearch}
                                onChange={(e) => setStockSearch(e.target.value)}
                                placeholder="Rechercher un N° série..."
                                className="w-full bg-gray-50 dark:bg-[#0F1720] border border-gray-200 dark:border-gray-700 rounded-xl py-2 pl-10 pr-4 text-sm font-mono text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#001A70] focus:border-transparent transition-all placeholder-gray-400"
                            />
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                            {filteredStock.map(item => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={item.id}
                                    className="p-3 bg-gray-50 dark:bg-[#0F1720] rounded-xl border border-gray-200 dark:border-gray-700 hover:border-[#001A70] dark:hover:border-blue-500 transition-colors flex justify-between items-center group"
                                >
                                    <div>
                                        <p className="font-mono font-bold text-[#001A70] dark:text-blue-300">{item.n_serie}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{item.carton ? `Carton: ${item.carton}` : 'Sans carton'}</p>
                                    </div>
                                    <button
                                        onClick={() => setNSerie(item.n_serie)}
                                        className="p-2 bg-[#E8F0FE] dark:bg-blue-900/40 text-[#1C73E8] dark:text-blue-300 rounded-lg opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity"
                                        title="Utiliser ce N° Série"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Operation Form */}
                <div className="lg:col-span-2 bg-white dark:bg-[#16202A] rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 relative overflow-visible flex flex-col order-1 lg:order-2">
                    {/* Tabs (Pose/Depose) */}
                    <div className="flex border-b border-gray-100 dark:border-gray-800">
                        {/* ... Tabs (same as before) ... */}
                        <button
                            onClick={() => { setActiveTab('pose'); setStatus(null); }}
                            className={clsx(
                                "flex-1 py-6 font-bold flex items-center justify-center gap-2 transition-colors relative text-lg",
                                activeTab === 'pose' ? "text-[#001A70] dark:text-white" : "text-gray-400 hover:text-gray-600 bg-gray-50 dark:bg-[#0F1720]"
                            )}
                        >
                            <ArrowDownCircle size={24} className={activeTab === 'pose' ? "text-[#001A70] dark:text-blue-400" : ""} />
                            Pose
                            {activeTab === 'pose' && (
                                <motion.div layoutId="tab-operator" className="absolute bottom-0 left-0 right-0 h-1 bg-[#001A70] dark:bg-blue-500" />
                            )}
                        </button>
                        <button
                            onClick={() => { setActiveTab('depose'); setStatus(null); }}
                            className={clsx(
                                "flex-1 py-6 font-bold flex items-center justify-center gap-2 transition-colors relative text-lg",
                                activeTab === 'depose' ? "text-[#FE5815] dark:text-[#FE5815]" : "text-gray-400 hover:text-gray-600 bg-gray-50 dark:bg-[#0F1720]"
                            )}
                        >
                            <ArrowUpCircle size={24} className={activeTab === 'depose' ? "text-[#FE5815]" : ""} />
                            Dépose
                            {activeTab === 'depose' && (
                                <motion.div layoutId="tab-operator" className="absolute bottom-0 left-0 right-0 h-1 bg-[#FE5815]" />
                            )}
                        </button>
                    </div>

                    <div className="p-8 flex-1 flex flex-col justify-center max-w-lg mx-auto w-full">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Mode: POSE - Show Serial Number First */}
                            {activeTab === 'pose' && (
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-[#001A70] dark:text-blue-200 ml-1 uppercase tracking-wide">Numéro de Série</label>
                                    <div className="relative group">
                                        <button
                                            type="button"
                                            onClick={() => setShowScanner(true)}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#001A70]/70 hover:text-[#001A70] dark:text-blue-400/70 dark:hover:text-blue-400 transition-colors"
                                        >
                                            <Scan size={20} />
                                        </button>
                                        <input
                                            type="text"
                                            value={nSerie}
                                            onChange={(e) => setNSerie(e.target.value)}
                                            placeholder="Scanner ou saisir N°..."
                                            className="w-full bg-gray-50 dark:bg-[#0F1720] border border-gray-200 dark:border-gray-700 rounded-xl py-4 pl-12 pr-4 text-lg font-mono text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#001A70] dark:focus:ring-blue-500 transition-all shadow-sm"
                                        />
                                    </div>
                                    <AnimatePresence>
                                        {showScanner && (
                                            <QRScanner
                                                onScanSuccess={(decodedText) => {
                                                    setNSerie(decodedText);
                                                    setShowScanner(false);
                                                }}
                                                onClose={() => setShowScanner(false)}
                                            />
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}

                            {/* Poste Selection (Visible for both, but first in Depose mode effectively because NSerie is hidden) */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-[#001A70] dark:text-blue-200 ml-1 uppercase tracking-wide">
                                    {activeTab === 'depose' ? "Sélectionner le Poste à Déposer" : "ID du Poste"}
                                </label>
                                <SearchableSelect
                                    options={postes}
                                    value={posteId}
                                    onChange={setPosteId}
                                    placeholder="Sélectionner un poste..."
                                    icon={MapPin}
                                    loading={loadingPostes}
                                />

                                {/* DEPOSE: Auto Link Feedback */}
                                {activeTab === 'depose' && posteId && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={clsx(
                                            "mt-3 p-4 rounded-xl text-sm border flex items-center gap-3 shadow-sm",
                                            nSerie ? "bg-blue-50 text-blue-800 border-blue-200" : "bg-orange-50 text-orange-800 border-orange-200"
                                        )}
                                    >
                                        {nSerie ? (
                                            <>
                                                <div className="p-2 bg-blue-200 rounded-full text-blue-700">
                                                    <Check size={18} />
                                                </div>
                                                <div>
                                                    <span className="block font-bold text-blue-900">Concentrateur Détecté</span>
                                                    <span className="font-mono text-lg">{nSerie}</span>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="p-2 bg-orange-200 rounded-full text-orange-700">
                                                    <AlertCircle size={18} />
                                                </div>
                                                <div>
                                                    <span className="block font-bold text-orange-900">Aucun concentrateur</span>
                                                    <span className="opacity-80">Aucun équipement 'posé' trouvé sur ce poste.</span>
                                                </div>
                                            </>
                                        )}
                                    </motion.div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={clsx(
                                    "w-full py-5 rounded-xl font-bold text-white text-lg shadow-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-3",
                                    loading
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : activeTab === 'pose'
                                            ? "bg-[#001A70] hover:bg-[#00218f] dark:bg-blue-600 dark:hover:bg-blue-700 shadow-blue-900/20"
                                            : "bg-[#FE5815] hover:bg-[#e04505] shadow-orange-900/20"
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
                                        "mt-8 p-4 rounded-xl flex items-start gap-4 shadow-md",
                                        status === 'success'
                                            ? "bg-green-50 text-green-800 border-l-4 border-green-500 dark:bg-green-900/20 dark:text-green-300"
                                            : "bg-red-50 text-red-800 border-l-4 border-red-500 dark:bg-red-900/20 dark:text-red-300"
                                    )}
                                >
                                    <div className={clsx("p-2 rounded-full", status === 'success' ? "bg-green-200 dark:bg-green-800" : "bg-red-200 dark:bg-red-800")}>
                                        {status === 'success' ? <Wrench size={20} /> : <AlertCircle size={20} />}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg">{status === 'success' ? "Succès" : "Erreur"}</h4>
                                        <p className="opacity-90">{message}</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
