import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ allowedRoles }) {
    const { user, loading, hasPermission } = useUser();
    const { addToast } = useToast();

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0F1720] flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-500" size={48} />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Check permissions
    if (allowedRoles) {
        const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
        const isAllowed = roles.some(role => hasPermission(role));

        if (!isAllowed) {
            // Need to wrap in useEffect to avoid state update during render
            // But doing it here returns a component, so we can't easily hook Effect if we return immediately.
            // Actually, we can just return a wrapper component that does the toast on mount.
            return <AccessDeniedRedirect />;
        }
    }

    return <Outlet />;
}

const AccessDeniedRedirect = () => {
    const { addToast } = useToast();

    useEffect(() => {
        addToast("Accès refusé : Vous n'avez pas les droits nécessaires.", 'error');
    }, []);

    return <Navigate to="/workspaces" replace />;
};
