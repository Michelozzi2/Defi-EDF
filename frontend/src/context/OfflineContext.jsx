import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from './ToastContext';
import api from '../services/api';

const OfflineContext = createContext();

export const useOffline = () => useContext(OfflineContext);

export const OfflineProvider = ({ children }) => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const { addToast } = useToast(); // Corrected from showToast
    const [isSimulatedOffline, setIsSimulatedOffline] = useState(false); // Demo Mode

    const [queue, setQueue] = useState(() => {
        try {
            const storedQueue = localStorage.getItem('edf_offline_queue');
            return storedQueue ? JSON.parse(storedQueue) : [];
        } catch (error) {
            console.error("Failed to parse queue from local storage", error);
            return [];
        }
    });

    // Monitor network status
    useEffect(() => {
        const handleOnline = () => {
            if (!isSimulatedOffline) {
                setIsOnline(true);
                // Prompt user to sync manually instead of auto-syncing
                addToast('Connexion rétablie. Vous pouvez lancer la synchronisation.', 'info');
                // syncQueue(); // Disabled per user request
            }
        };
        const handleOffline = () => {
            setIsOnline(false);
            addToast('Vous êtes hors ligne. Mode dégradé activé.', 'warning');
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [addToast, queue, isSimulatedOffline]);

    const [syncReport, setSyncReport] = useState(null); // { success: [], errors: [] }

    // Demo/Dev helper
    const toggleOfflineSimulation = () => {
        if (isSimulatedOffline) {
            setIsSimulatedOffline(false);
            if (navigator.onLine) {
                setIsOnline(true);
                addToast('Connexion rétablie (Simulation terminée). Prêt à synchroniser.', 'info');
                // Auto-sync disabled
            }
        } else {
            setIsSimulatedOffline(true);
            setIsOnline(false);
            addToast('Mode Hors Ligne Simulé Activé', 'warning');
        }
    };

    const syncOne = async (id) => {
        const action = queue.find(item => item.id === id);
        if (!action) return;

        addToast(`Tentative de synchronisation...`, 'info');

        try {
            await api.post(action.url, action.payload);

            // Success: Remove from queue AND Add to Sync Report
            removeFromQueue(id);
            addToast("Synchronisé avec succès !", 'success');

            setSyncReport(prev => ({
                success: [...(prev?.success || []), { ...action, message: "Synchronisé manuellement." }],
                errors: prev?.errors || []
            }));

        } catch (error) {
            console.error("Single sync error", error);
            const errorMessage = error.response?.data?.error || error.message || "Erreur inconnue";
            const status = error.response?.status;

            // Update item with error details so user can see it
            setQueue(prev => prev.map(item =>
                item.id === id
                    ? { ...item, lastError: `Erreur ${status || ''}: ${errorMessage}`, lastAttempt: Date.now() }
                    : item
            ));

            addToast(`Échec synchronisation : ${errorMessage}`, 'error');
        }
    };

    const syncQueue = async () => {
        const currentQueue = queue;
        if (currentQueue.length === 0) return;

        addToast(`Tentative de synchronisation de ${currentQueue.length} action(s)...`, 'info');

        const report = { success: [], errors: [] };
        const stillInQueue = [];

        try {
            for (const action of currentQueue) {
                try {
                    console.log(`Sync action: ${action.type}`, action);
                    await api.post(action.url, action.payload);

                    // Success
                    report.success.push({
                        ...action,
                        message: "Synchronisé avec succès."
                    });
                } catch (error) {
                    console.error("Sync error for", action, error);

                    // Analyze error
                    const errorMessage = error.response?.data?.error || error.message || "Erreur inconnue";
                    const status = error.response?.status;

                    // If it's a server error (4xx, 5xx), we mark it as failed and remove from queue
                    // If it's a network error (no response), we keep it in queue
                    if (status) { // Response received but error
                        report.errors.push({
                            ...action,
                            message: `Erreur ${status}: ${errorMessage}`
                        });
                    } else {
                        // Network error likely (no response), keep in queue
                        stillInQueue.push(action);
                        report.errors.push({
                            ...action,
                            message: "Erreur réseau - Mis en attente"
                        });
                    }
                }
            }

            setQueue(stillInQueue);
            setSyncReport(report);

            if (report.success.length > 0 || report.errors.length > 0) {
                if (report.errors.length > 0) {
                    addToast(`Synchronisation terminée avec des erreurs.`, 'warning');
                } else {
                    addToast(`Synchronisation terminée avec succès.`, 'success');
                }
            }
        } catch (globalError) {
            console.error("Critical error in syncQueue", globalError);
            addToast("Erreur critique lors de la synchronisation", 'error');
        }
    };

    const clearReport = () => setSyncReport(null);

    // Save queue to local storage whenever it changes
    useEffect(() => {
        localStorage.setItem('edf_offline_queue', JSON.stringify(queue));
    }, [queue]);

    // Clear report on navigation (optional, or let user close it)
    // We can expose clearReport to the UI.

    const addToQueue = (action) => {
        const newAction = {
            id: uuidv4(),
            timestamp: Date.now(),
            retryCount: 0,
            ...action
        };
        setQueue(prev => [...prev, newAction]);
    };

    const clearQueue = () => {
        setQueue([]);
        localStorage.removeItem('edf_offline_queue');
    };

    const removeFromQueue = (id) => {
        setQueue(prev => prev.filter(item => item.id !== id));
    };

    const getQueue = () => queue;

    const value = {
        isOnline,
        queue,
        addToQueue,
        removeFromQueue,
        clearQueue,
        syncQueue,
        syncOne, // Exported
        toggleOfflineSimulation,
        isSimulatedOffline,
        syncReport,
        clearReport
    };

    return (
        <OfflineContext.Provider value={value}>
            {children}
        </OfflineContext.Provider>
    );
};

