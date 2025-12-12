import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';
import clsx from 'clsx';

const SearchableSelect = ({ options, value, onChange, placeholder, icon: Icon, loading }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef(null);

    // Filter options based on search
    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(search.toLowerCase()) ||
        opt.value.toString().toLowerCase().includes(search.toLowerCase())
    );

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div className="relative group" ref={containerRef}>
            {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#001A70] dark:group-focus-within:text-blue-400 transition-colors z-10" />}

            <div
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-gray-50 dark:bg-[#0F1720] border border-gray-200 dark:border-gray-700 rounded-xl py-4 pl-12 pr-10 text-lg font-mono text-gray-900 dark:text-white focus:outline-none cursor-pointer flex items-center justify-between shadow-sm hover:border-[#001A70] dark:hover:border-blue-500 transition-colors"
            >
                <span className={clsx("truncate", !selectedOption ? "text-gray-400" : "")}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown size={20} className={clsx("text-gray-400 transition-transform shrink-0 ml-2", isOpen && "rotate-180")} />
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#16202A] border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl z-[60] max-h-60 overflow-hidden flex flex-col"
                    >
                        <div className="p-2 border-b border-gray-100 dark:border-gray-700">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Filtrer..."
                                className="w-full p-2 bg-gray-50 dark:bg-[#0F202A] rounded-lg text-sm outline-none border border-transparent focus:border-[#001A70] text-gray-900 dark:text-white"
                                autoFocus
                                onClick={e => e.stopPropagation()}
                            />
                        </div>
                        <div className="overflow-y-auto flex-1 p-1 custom-scrollbar">
                            {loading ? (
                                <div className="p-4 text-center text-gray-400 text-sm">Chargement...</div>
                            ) : filteredOptions.length > 0 ? (
                                filteredOptions.map((opt) => (
                                    <div
                                        key={opt.value}
                                        onClick={() => {
                                            onChange(opt.value);
                                            setIsOpen(false);
                                            setSearch('');
                                        }}
                                        className={clsx(
                                            "p-3 rounded-lg cursor-pointer flex items-center justify-between text-sm transition-colors",
                                            value === opt.value
                                                ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                                                : "hover:bg-gray-50 dark:hover:bg-[#1E293B] text-gray-700 dark:text-gray-300"
                                        )}
                                    >
                                        <span className="font-mono truncate mr-2">{opt.label}</span>
                                        {value === opt.value && <Check size={16} className="shrink-0" />}
                                    </div>
                                ))
                            ) : (
                                <div className="p-4 text-center text-gray-400 text-sm">Aucun résultat</div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SearchableSelect;
