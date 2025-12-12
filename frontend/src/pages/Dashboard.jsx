import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
    BarChart3, Package, Truck, AlertTriangle, RefreshCcw
} from 'lucide-react';
import api from '../services/api';

// Components
import StatCard from '../components/dashboard/StatCard';
import InventoryCharts from '../components/dashboard/InventoryCharts';
import InventoryTable from '../components/dashboard/InventoryTable';
import DetailModal from '../components/dashboard/DetailModal';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import DashboardAlerts from '../components/dashboard/DashboardAlerts';
import CoverageMap from '../components/dashboard/CoverageMap';
import PerformanceCharts from '../components/dashboard/PerformanceCharts';

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loadingStats, setLoadingStats] = useState(true);

    // Inventory Search State
    const [results, setResults] = useState([]);
    const [search, setSearch] = useState('');
    const [filterEtat, setFilterEtat] = useState('');
    const [filterAffectation, setFilterAffectation] = useState('');
    const [searching, setSearching] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);

    // Detail Modal State
    const [selectedItem, setSelectedItem] = useState(null);
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    useEffect(() => {
        fetchStats();
    }, []);

    // Effect for Search - debounce included
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchInventory(1, true); // Reset to page 1 on filter change
        }, 500);
        return () => clearTimeout(timer);
    }, [search, filterEtat, filterAffectation]);

    // Effect for fetching history when item is selected
    // Effect for fetching history and details when item is selected
    useEffect(() => {
        if (selectedItem) {
            // If the item comes from ActivityFeed, it might only have n_serie. Fetch full details.
            if (!selectedItem.etat && !selectedItem.fetching) {
                api.get(`/concentrateurs/${selectedItem.n_serie}/`)
                    .then(res => setSelectedItem({ ...res.data, fetching: false }))
                    .catch(err => console.error("Error fetching details", err));
            }

            fetchHistory(selectedItem.n_serie);
        } else {
            setHistory([]);
        }
    }, [selectedItem?.n_serie]);

    const fetchStats = async () => {
        try {
            const res = await api.get('/dashboard/stocks/');
            setStats(res.data);
            setLoadingStats(false);
        } catch (error) {
            console.error("Error fetching stats:", error);
            setLoadingStats(false);
        }
    };

    const fetchInventory = async (pageNum = 1, isReset = false) => {
        setSearching(true);
        if (isReset) {
            setPage(1);
            setResults([]);
        }

        try {
            const params = {
                search: search,
                etat: filterEtat,
                affectation: filterAffectation,
                page: pageNum
            };

            const res = await api.get('/concentrateurs/', { params });
            const newData = res.data.results || [];

            if (isReset) {
                setResults(newData);
            } else {
                setResults(prev => [...prev, ...newData]);
            }

            setTotalCount(res.data.count || 0);
            setHasMore(!!res.data.next);
        } catch (error) {
            console.error("Error fetching inventory:", error);
        } finally {
            setSearching(false);
        }
    };

    const handleLoadMore = () => {
        if (!searching && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchInventory(nextPage, false);
        }
    };

    const fetchHistory = async (n_serie) => {
        setLoadingHistory(true);
        try {
            const res = await api.get(`/concentrateurs/${n_serie}/historique/`);
            setHistory(res.data);
        } catch (error) {
            console.error("Error fetching history:", error);
        } finally {
            setLoadingHistory(false);
        }
    };

    if (loadingStats) return (
        <div className="min-h-[400px] flex items-center justify-center text-gray-500 dark:text-gray-400">
            <RefreshCcw className="animate-spin mr-2" /> Chargement du tableau de bord...
        </div>
    );

    const total = stats?.total || 0;
    const enStock = stats?.by_etat?.['en_stock'] || 0;
    const enLivraison = stats?.by_etat?.['en_livraison'] || 0;
    const aTester = stats?.by_etat?.['a_tester'] || 0;

    return (
        <div className="space-y-8 pb-24">
            <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-edf-blue dark:text-white mb-2">Tableau de Bord Global</h1>
                    <p className="text-gray-500 dark:text-gray-400">Vue d'ensemble du parc CPL</p>
                </div>
                <button onClick={fetchStats} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors self-start md:self-auto">
                    <RefreshCcw size={20} className="text-gray-500" />
                </button>
            </header>

            {/* Alerts Section (Optional) */}
            <DashboardAlerts alerts={stats?.alerts} />

            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <StatCard title="Total Concentrateurs" value={total} icon={BarChart3} colorClass="bg-blue-600" delay={0.1} />
                <StatCard title="En Stock" value={enStock} icon={Package} colorClass="bg-edf-green" delay={0.2} />
                <StatCard title="En Livraison" value={enLivraison} icon={Truck} colorClass="bg-edf-orange" delay={0.3} />
                <StatCard title="À Tester" value={aTester} icon={AlertTriangle} colorClass="bg-red-500" delay={0.4} />
            </div>

            {/* Main Content Grid: Charts + Activity */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Row 1: Key Charts & Map */}
                <div className="xl:col-span-2 space-y-6">
                    <InventoryCharts stats={stats} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[400px] h-auto md:h-[400px]">
                        <CoverageMap stats={stats} onSelect={setSelectedItem} />
                        <PerformanceCharts kpis={stats?.kpis} />
                    </div>
                </div>

                {/* Activity Feed - Takes 1/3 width, aligns with left column */}
                <div className="h-full flex flex-col">
                    <ActivityFeed activity={stats?.recent_activity} onSelect={setSelectedItem} />
                </div>
            </div>

            {/* Isolated Search Module - Takes remaining space */}
            <div className="mt-8">
                <InventoryTable
                    results={results}
                    searching={searching}
                    onSelect={setSelectedItem}
                    search={search}
                    setSearch={setSearch}
                    filterEtat={filterEtat}
                    setFilterEtat={setFilterEtat}
                    filterAffectation={filterAffectation}
                    setFilterAffectation={setFilterAffectation}
                    totalCount={totalCount}
                    onLoadMore={handleLoadMore}
                    hasMore={hasMore}
                />
            </div>

            {/* Details Modal */}
            <AnimatePresence>
                {selectedItem && (
                    <DetailModal
                        selectedItem={selectedItem}
                        onClose={() => setSelectedItem(null)}
                        history={history}
                        loadingHistory={loadingHistory}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
