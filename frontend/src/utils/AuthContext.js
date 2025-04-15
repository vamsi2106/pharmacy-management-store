import React, { createContext, useState, useEffect } from 'react';
import jwt_decode from 'jwt-decode';
import authService from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check if there's a token in localStorage on initial load
    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token) {
            try {
                // Check if token is expired
                const decodedToken = jwt_decode(token);
                const currentTime = Date.now() / 1000;

                if (decodedToken.exp < currentTime) {
                    // Token is expired
                    logout();
                } else {
                    // Token is valid, set current user
                    // First try to use the stored user data if available
                    if (storedUser) {
                        try {
                            const userData = JSON.parse(storedUser);
                            setCurrentUser(userData);
                            console.log('User restored from localStorage:', userData);
                        } catch (parseErr) {
                            console.error("Error parsing stored user data", parseErr);
                            // Fallback to token data
                            setUserFromToken(decodedToken);
                        }
                    } else {
                        // No stored user data, use token data
                        setUserFromToken(decodedToken);
                    }
                }
            } catch (err) {
                console.error("Invalid token", err);
                logout();
            }
        }
        setLoading(false);
    }, []);

    // Helper function to set user from token data
    const setUserFromToken = (decodedToken) => {
        const userData = {
            id: decodedToken.id,
            name: decodedToken.name,
            email: decodedToken.sub,
            role: decodedToken.role
        };
        setCurrentUser(userData);
        // Also store in localStorage for persistence
        localStorage.setItem('user', JSON.stringify(userData));
        console.log('User set from token:', userData);
    };

    const login = async (email, password) => {
        try {
            setError(null);
            const response = await authService.login(email, password);

            // Save token to local storage
            localStorage.setItem('token', response.token);

            // Create user object
            const userData = {
                id: response.id,
                name: response.name,
                email: response.email,
                role: response.role,
                // Add any other user properties you need
                contactNumber: response.contactNumber,
                address: response.address
            };

            // Save full user data to localStorage
            localStorage.setItem('user', JSON.stringify(userData));

            // Set current user
            setCurrentUser(userData);
            console.log('User logged in:', userData);

            return response;
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to login');
            throw err;
        }
    };

    const register = async (userData) => {
        try {
            setError(null);
            const response = await authService.register(userData);
            return response;
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to register');
            throw err;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setCurrentUser(null);
        console.log('User logged out');
    };

    const isAuthenticated = () => {
        return currentUser !== null;
    };

    const isAdmin = () => {
        return currentUser?.role === 'ADMIN' || currentUser?.role === 'PHARMACIST';
    };

    return (
        <AuthContext.Provider
            value={{
                currentUser,
                loading,
                error,
                login,
                register,
                logout,
                isAuthenticated,
                isAdmin
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}; 