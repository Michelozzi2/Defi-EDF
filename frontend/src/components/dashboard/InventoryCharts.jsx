import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { useTheme } from '../../context/ThemeContext';

const COLORS = ['#001A70', '#509E2F', '#FE5815', '#EF4444', '#8B5CF6'];

export default function InventoryCharts({ stats }) {
    const { theme } = useTheme();

    // Prepare chart data with EDF Colors
    const etatData = stats?.by_etat ? Object.entries(stats.by_etat).map(([key, value]) => ({
        name: (key === 'en_attente_reconditionnement' || key === 'en_attente_recond') ? 'ATT RECOND' : key.replace(/_/g, ' ').toUpperCase(),
        value: value,
        color: key === 'en_stock' ? '#509E2F' :  // Vert EDF
            key === 'HS' ? '#EF4444' :        // Rouge
                key === 'en_livraison' ? '#FE5815' : // Orange EDF
                    (key === 'en_attente_reconditionnement' || key === 'en_attente_recond') ? '#8B5CF6' : // Violet
                        '#001A70'                         // Bleu EDF (default/autres)
    })) : [];

    const affectationData = stats?.by_affectation ? Object.entries(stats.by_affectation).map(([key, value]) => ({
        name: key,
        value: value
    })) : [];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-[#16202A] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 h-[500px] flex flex-col">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Répartition par État</h3>
                <div className="flex-1 min-h-0 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        {etatData.length > 0 ? (
                            <BarChart data={etatData}>
                                <XAxis dataKey="name" stroke={theme === 'dark' ? '#9ca3af' : '#4b5563'} fontSize={10} tickLine={false} axisLine={false} interval={0} />
                                <YAxis stroke={theme === 'dark' ? '#9ca3af' : '#4b5563'} fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    itemStyle={{ color: theme === 'dark' ? '#fff' : '#000' }}
                                    cursor={{ fill: 'transparent' }}
                                />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                    {etatData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400">Aucune donnée disponible</div>
                        )}
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white dark:bg-[#16202A] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 h-[500px] flex flex-col">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Répartition par Affectation</h3>
                <div className="flex-1 min-h-0 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        {affectationData.length > 0 ? (
                            <PieChart>
                                <Pie
                                    data={affectationData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {affectationData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    itemStyle={{ color: theme === 'dark' ? '#fff' : '#000' }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            </PieChart>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400">Aucune donnée disponible</div>
                        )}
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
