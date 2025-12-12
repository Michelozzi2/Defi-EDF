import React from 'react';
import { User, Clock, ArrowRight } from 'lucide-react';

const formatAction = (action) => {
    switch (action) {
        case 'reception': return 'Réception Magasin';
        case 'commande_bo': return 'Commande vers BO';
        case 'pose': return 'Pose sur site';
        case 'depose': return 'Dépose du site';
        case 'test_ok': return 'Test OK';
        case 'test_hs': return 'Test HS';
        case 'reconditionnement': return 'Reconditionnement';
        default: return action;
    }
};

const getActionColor = (action) => {
    switch (action) {
        case 'reception': return 'bg-blue-500 text-white';
        case 'pose': return 'bg-green-500 text-white';
        case 'depose': return 'bg-orange-500 text-white';
        case 'test_hs': return 'bg-red-500 text-white';
        default: return 'bg-gray-500 text-white';
    }
};

export default function ActivityFeed({ activity, onSelect }) {
    if (!activity || activity.length === 0) {
        return (
            <div className="bg-white dark:bg-[#16202A] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 h-full">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Activité Récente</h3>
                <p className="text-gray-400 text-sm">Aucune activité récente.</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-[#16202A] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 h-full overflow-hidden flex flex-col flex-1 min-h-0">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Activité Récente</h3>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: rgba(156, 163, 175, 0.3);
                    border-radius: 20px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background-color: rgba(156, 163, 175, 0.5);
                }
            `}</style>

            <div className="flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar">
                {activity.map((item) => (
                    <div
                        key={item.id}
                        className="relative pl-8 pb-2 group/item cursor-pointer"
                        onClick={() => onSelect && onSelect({ n_serie: item.concentrateur })}
                    >
                        {/* Connecting Line */}
                        <div className="absolute left-[11px] top-6 bottom-[-24px] w-[2px] bg-gray-100 dark:bg-gray-800 last:hidden group-hover/item:bg-gray-200 dark:group-hover/item:bg-gray-700 transition-colors"></div>

                        {/* Dot */}
                        <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-4 border-white dark:border-[#16202A] ${getActionColor(item.action)} shadow-sm flex items-center justify-center group-hover/item:scale-110 transition-transform`}>
                            <div className="w-2 h-2 rounded-full bg-white opacity-40"></div>
                        </div>

                        <div className="flex flex-col gap-1.5 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-700">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-gray-800 dark:text-gray-100 group-hover:text-edf-blue transition-colors">
                                    {formatAction(item.action)}
                                </span>
                                <span className="text-[11px] font-medium text-gray-400 bg-gray-50 dark:bg-gray-800/50 px-2 py-1 rounded-md border border-gray-100 dark:border-gray-800">
                                    {new Date(item.timestamp).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} • {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>

                            <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center flex-wrap gap-2">
                                <span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                                    {item.concentrateur}
                                </span>
                                {item.nouvel_etat && (
                                    <>
                                        <ArrowRight size={12} className="text-gray-300" />
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${['test_hs', 'HS'].includes(item.nouvel_etat) ? 'bg-red-50 text-red-600 border-red-100' :
                                            ['en_stock'].includes(item.nouvel_etat) ? 'bg-green-50 text-green-600 border-green-100' :
                                                'bg-blue-50 text-blue-600 border-blue-100'
                                            }`}>
                                            {item.nouvel_etat.replace(/_/g, ' ')}
                                        </span>
                                    </>
                                )}
                            </div>

                            <div className="flex items-center gap-2 mt-1">
                                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800/50">
                                    <User size={10} className="text-gray-400" />
                                    <span className="text-[11px] font-medium text-gray-500 max-w-[120px] truncate">{item.user || 'Système'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
