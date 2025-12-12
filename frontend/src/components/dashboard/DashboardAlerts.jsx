import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';

export default function DashboardAlerts({ alerts }) {
    if (!alerts || alerts.length === 0) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {alerts.map((alert, index) => (
                <div
                    key={index}
                    className={`p-4 rounded-xl border-l-4 shadow-sm flex items-start gap-4 ${alert.type === 'warning'
                            ? 'bg-red-50 border-red-500 text-red-700 dark:bg-red-900/10 dark:text-red-400'
                            : 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/10 dark:text-blue-400'
                        }`}
                >
                    <div className={`p-2 rounded-lg ${alert.type === 'warning' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-blue-100 dark:bg-blue-900/30'
                        }`}>
                        {alert.type === 'warning' ? <AlertTriangle size={20} /> : <Info size={20} />}
                    </div>
                    <div>
                        <h4 className="font-bold text-sm uppercase tracking-wide opacity-80 mb-1">{alert.title}</h4>
                        <p className="text-sm font-medium">{alert.message}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
