import React, { createContext, useState, useContext, useEffect } from 'react';
import { db } from '../services/db';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check local storage for session persistence
        const storedUser = localStorage.getItem('bill_app_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (username, pin) => {
        try {
            // Find user by username
            const result = await db.users.find({
                selector: { username: username }
            });

            if (result.docs.length === 0) {
                throw new Error('User not found');
            }

            const userDoc = result.docs[0];
            if (userDoc.pin !== pin) {
                throw new Error('Invalid PIN');
            }

            // Success
            const userData = {
                id: userDoc._id,
                name: userDoc.name,
                role: userDoc.role
            };

            setUser(userData);
            localStorage.setItem('bill_app_user', JSON.stringify(userData));

            // Log login
            await db.audit.post({
                action: 'LOGIN',
                userId: userDoc._id,
                timestamp: new Date().toISOString()
            });

            return true;
        } catch (error) {
            console.error('Login failed', error);
            throw error;
        }
    };

    const logout = async () => {
        if (user) {
            await db.audit.post({
                action: 'LOGOUT',
                userId: user.id,
                timestamp: new Date().toISOString()
            });
        }
        setUser(null);
        localStorage.removeItem('bill_app_user');
    };

    const hasRole = (allowedRoles) => {
        if (!user) return false;
        return allowedRoles.includes(user.role);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, hasRole, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
