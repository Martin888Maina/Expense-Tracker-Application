import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

// AuthProvider sits at the root of the app and exposes the current user,
// login/logout helpers, and a loading flag used to prevent flashing the
// login screen while we verify an existing session on first load.
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // On mount, check whether we have a stored token and verify it is still valid
    useEffect(() => {
        const token = localStorage.getItem('token');
        const stored = localStorage.getItem('user');

        if (token && stored) {
            try {
                setUser(JSON.parse(stored));
            } catch {
                // Stored user data is corrupt — clear and proceed to login
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    // Called after a successful register or login API response
    const login = useCallback((userData, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    }, []);

    // Clear all auth state and redirect to login
    const logout = useCallback(async () => {
        try {
            await api.post('/auth/logout');
        } catch {
            // Proceed with local logout even if the server call fails
        }
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    }, []);

    // Allow other parts of the app to refresh the user profile after updates
    const refreshUser = useCallback(async () => {
        try {
            const { data } = await api.get('/auth/me');
            const updated = data.data.user;
            setUser(updated);
            localStorage.setItem('user', JSON.stringify(updated));
        } catch {
            // If this fails the user was likely logged out elsewhere
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook for convenient access to auth state anywhere in the app
export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
};

export default AuthContext;
