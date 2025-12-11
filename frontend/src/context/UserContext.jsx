import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate, useLocation } from 'react-router-dom';

const UserContext = createContext();

export function UserProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    const fetchUser = async () => {
        try {
            const res = await api.get('/auth/me/');
            setUser(res.data);
            return res.data;
        } catch (error) {
            console.error("Failed to fetch user", error);
            setUser(null);
            // Only redirect if we are not already on login
            if (location.pathname !== '/login') {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user && location.pathname !== '/login') {
            fetchUser();
        } else {
            setLoading(false);
        }
    }, [location.pathname]);

    // Permission Helpers
    const hasPermission = (requiredRole) => {
        if (!user) return false;
        if (user.profil === 'admin') return true;

        if (Array.isArray(requiredRole)) {
            return requiredRole.some(role => user.profil.includes(role));
        }
        return user.profil === requiredRole || user.profil.includes(requiredRole);
    };

    // Clear user on logout
    const clearUser = () => {
        setUser(null);
        setLoading(false);
    };

    const value = {
        user,
        loading,
        fetchUser,
        hasPermission,
        clearUser
    };

    return (
        <UserContext.Provider value={value}>
            {!loading && children}
        </UserContext.Provider>
    );
}

export function useUser() {
    return useContext(UserContext);
}
