import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Timer, TrendingDown, Gauge } from 'lucide-react';
import clsx from 'clsx';
import { useTheme } from '../../context/ThemeContext';

export default function PerformanceCharts({ kpis }) {
    const { theme } = useTheme();
    const { avg_cycle_time, days_remaining, velocity } = kpis || {};

    // Mock Prediction Data based on velocity
    const generatePredictionData = () => {
        const data = [];
        const start = 100;
        for (let i = 0; i < 7; i++) {
            data.push({ name: `J+${i}`, stock: Math.max(0, start - (velocity * i)) });
        }
        return data;
    };

    const predictionData = generatePredictionData();

    return (
        <div className="space-y-6 h-full">
            {/* Cycle Time Card */}
            <div className="bg-white dark:bg-[#16202A] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Temps Moyen d'Installation</h3>
                        <p className="text-xs text-gray-400 mt-1">Réception → Pose</p>
                    </div>
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                        <Timer size={20} />
                    </div>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">{avg_cycle_time}</span>
                    <span className="text-sm text-gray-500">jours</span>
                </div>

                {/* Progress Bar visual */}
                <div className="mt-4 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className={clsx("h-full rounded-full", avg_cycle_time < 15 ? "bg-green-500" : avg_cycle_time < 30 ? "bg-orange-500" : "bg-red-500")}
                        style={{ width: `${Math.min(100, (avg_cycle_time / 45) * 100)}%` }}
                    ></div>
                </div>
                <p className="text-xs text-gray-400 mt-2 text-right">Objectif: &lt; 15 jours</p>
            </div>

            {/* Stock Prediction Card */}
            <div className="bg-white dark:bg-[#16202A] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Prédiction rupture</h3>
                        <p className="text-xs text-gray-400 mt-1">Vélocité: {velocity} sorties/jour</p>
                    </div>
                    <div className={clsx("p-2 rounded-lg", days_remaining < 10 ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600")}>
                        <TrendingDown size={20} />
                    </div>
                </div>

                <div className="mb-6">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                        {days_remaining > 365 ? '> 1 an' : `${days_remaining} jours`}
                    </span>
                    <p className="text-sm text-gray-500">restants avant rupture magasin</p>
                </div>

                <div className="flex-1 min-h-[120px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={predictionData}>
                            <defs>
                                <linearGradient id="colorStock" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#FE5815" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#FE5815" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <Tooltip
                                contentStyle={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#fff', borderRadius: '8px', border: 'none' }}
                                itemStyle={{ color: '#FE5815' }}
                            />
                            <Area type="monotone" dataKey="stock" stroke="#FE5815" fillOpacity={1} fill="url(#colorStock)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
