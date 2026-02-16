import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Initialize admin and check for logged in user
        authService.initializeAdmin();
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
        setLoading(false);
    }, []);

    const login = (email, password) => {
        const loggedInUser = authService.login(email, password);
        setUser(loggedInUser);
        return loggedInUser;
    };

    const register = (userData) => {
        const newUser = authService.register(userData);
        return newUser;
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    const updateUser = (updates) => {
        if (user) {
            const updatedUser = authService.updateUser(user.id, updates);
            setUser(updatedUser);
            return updatedUser;
        }
    };

    const value = {
        user,
        login,
        register,
        logout,
        updateUser,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin'
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};