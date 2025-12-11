import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

export default function StatCard({ title, value, icon: Icon, colorClass, delay }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
            className="bg-white dark:bg-[#16202A] p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800"
        >
            <div className="flex items-center justify-between mb-4">
                <div className={clsx("p-3 rounded-xl bg-opacity-10", colorClass)}>
                    <Icon size={24} className={colorClass.replace('bg-', 'text-')} />
                </div>
                <span className="text-4xl font-bold text-gray-900 dark:text-white">{value}</span>
            </div>
            <h3 className="text-gray-500 dark:text-gray-400 font-medium">{title}</h3>
        </motion.div>
    );
}
