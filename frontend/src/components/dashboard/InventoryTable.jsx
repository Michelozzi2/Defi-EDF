import React, { useRef, useEffect } from 'react';
import { Search, Loader } from 'lucide-react';
import clsx from 'clsx';

export default function InventoryTable({
    results,
    searching,
    onSelect,
    search,
    setSearch,
    filterEtat,
    setFilterEtat,
    filterAffectation,
    setFilterAffectation,
    totalCount,
    onLoadMore,
    hasMore
}) {
    const scrollRef = useRef(null);

    // Infinite Scroll Handler
    useEffect(() => {
        const handleScroll = () => {
            if (scrollRef.current) {
                const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
                // Trigger load more when within 50px of bottom
                if (scrollTop + clientHeight >= scrollHeight - 50 && hasMore) {
                    onLoadMore();
                }
            }
        };

        const currentRef = scrollRef.current;
        if (currentRef) {
            currentRef.addEventListener('scroll', handleScroll);
        }

        return () => {
            if (currentRef) {
                currentRef.removeEventListener('scroll', handleScroll);
            }
        };
    }, [hasMore, onLoadMore]);

    return (
        <div className="flex-1 min-h-0 flex flex-col">
            {/* Visual Distinction Wrapper */}
            <div className="h-full bg-gradient-to-br from-blue-50/50 to-white dark:from-blue-900/10 dark:to-[#16202A] rounded-2xl p-1 shadow-lg border-2 border-blue-100 dark:border-blue-900/30">
                <div className="h-full bg-white dark:bg-[#16202A] rounded-xl p-4 flex flex-col gap-3">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-700 pb-4">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Search size={24} className="text-edf-orange" />
                            Explorateur d'Inventaire
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-edf-blue dark:group-focus-within:text-blue-400 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Rechercher (N° Série / Carton)..."
                                className="w-full p-3 pl-10 rounded-xl bg-gray-50 dark:bg-[#0F1720] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-edf-blue dark:focus:ring-blue-500 transition-all outline-none"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <select
                            className="w-full p-3 rounded-xl bg-gray-50 dark:bg-[#0F1720] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-edf-blue dark:focus:ring-blue-500 outline-none appearance-none cursor-pointer"
                            value={filterEtat}
                            onChange={(e) => setFilterEtat(e.target.value)}
                        >
                            <option value="">Tous les états</option>
                            <option value="en_livraison">En Livraison</option>
                            <option value="en_stock">En Stock</option>
                            <option value="pose">Posé</option>
                            <option value="a_tester">À Tester</option>
                            <option value="HS">HS</option>
                        </select>

                        <select
                            className="w-full p-3 rounded-xl bg-gray-50 dark:bg-[#0F1720] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-edf-blue dark:focus:ring-blue-500 outline-none appearance-none cursor-pointer"
                            value={filterAffectation}
                            onChange={(e) => setFilterAffectation(e.target.value)}
                        >
                            <option value="">Toutes affectations</option>
                            <option value="Magasin">Magasin</option>
                            <option value="BO Nord">BO Nord</option>
                            <option value="BO Centre">BO Centre</option>
                            <option value="BO Sud">BO Sud</option>
                            <option value="Labo">Labo</option>
                        </select>
                    </div>

                    {/* Results count */}
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            {results.length} résultats sur {totalCount}
                        </span>
                    </div>

                    <div
                        ref={scrollRef}
                        className="overflow-auto rounded-xl border border-gray-100 dark:border-gray-700 max-h-[500px] flex-1 custom-scrollbar"
                    >
                        <table className="w-full min-w-[700px] text-left text-sm text-gray-600 dark:text-gray-300">
                            <thead className="bg-gray-50 dark:bg-[#0F1720] text-gray-900 dark:text-white font-semibold sticky top-0">
                                <tr>
                                    <th className="p-3">N° Série</th>
                                    <th className="p-3">Carton</th>
                                    <th className="p-3">État</th>
                                    <th className="p-3">Affectation</th>
                                    <th className="p-3">Opérateur</th>
                                    <th className="p-3">Position</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {results.map((c) => (
                                    <tr
                                        key={c.id}
                                        onClick={() => onSelect(c)}
                                        className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors cursor-pointer group"
                                    >
                                        <td className="p-3 font-mono font-medium text-blue-600 dark:text-blue-400 group-hover:text-edf-orange transition-colors">{c.n_serie}</td>
                                        <td className="p-3 font-mono text-xs">{c.carton || '-'}</td>
                                        <td className="p-3">
                                            <span className={clsx(
                                                "px-2 py-0.5 rounded-full text-xs font-semibold",
                                                c.etat === 'en_stock' ? "bg-green-100 text-edf-green dark:bg-green-900/40 dark:text-green-300" :
                                                    c.etat === 'HS' ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" :
                                                        c.etat === 'en_livraison' ? "bg-orange-100 text-edf-orange dark:bg-orange-900/40 dark:text-orange-300" :
                                                            c.etat === 'en_attente_reconditionnement' ? "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300" :
                                                                "bg-blue-100 text-edf-blue dark:bg-blue-900/40 dark:text-blue-300"
                                            )}>
                                                {c.etat}
                                            </span>
                                        </td>
                                        <td className="p-3">{c.affectation}</td>
                                        <td className="p-3">{c.operateur || '-'}</td>
                                        <td className="p-3 text-xs font-mono">{c.poste_code || '-'}</td>
                                    </tr>
                                ))}
                                {results.length > 0 && searching && (
                                    <tr>
                                        <td colSpan="6" className="p-4 text-center text-gray-400">
                                            <div className="flex items-center justify-center gap-2">
                                                <Loader className="animate-spin" size={16} />
                                                Chargement...
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                {results.length === 0 && !searching && (
                                    <tr>
                                        <td colSpan="6" className="p-6 text-center text-gray-400">Aucun résultat trouvé.</td>
                                    </tr>
                                )}
                                {results.length === 0 && searching && (
                                    <tr>
                                        <td colSpan="6" className="p-6 text-center text-gray-400">Recherche en cours...</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
