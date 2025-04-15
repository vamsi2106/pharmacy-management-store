/**
 * Authentication utilities for the Pharmacy Management System
 */

const AUTH_TOKEN_KEY = 'pharmacy_auth_token';
const USER_DATA_KEY = 'pharmacy_user_data';

const AuthService = {
    /**
     * Login user and store token
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise} - Response with token or error
     */
    login: async (email, password) => {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Login failed');
            }

            const data = await response.json();
            // Store token and user data
            localStorage.setItem(AUTH_TOKEN_KEY, data.token);
            localStorage.setItem(USER_DATA_KEY, JSON.stringify({
                id: data.id,
                name: data.name,
                email: data.email,
                role: data.role
            }));

            return data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    /**
     * Register a new user
     * @param {Object} userData - User registration data
     * @returns {Promise} - Response with success or error
     */
    register: async (userData) => {
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Registration failed');
            }

            return await response.json();
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    },

    /**
     * Logout user and clear storage
     */
    logout: () => {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(USER_DATA_KEY);
        window.location.href = '/';
    },

    /**
     * Get the authentication token
     * @returns {string|null} - Auth token or null if not authenticated
     */
    getToken: () => {
        return localStorage.getItem(AUTH_TOKEN_KEY);
    },

    /**
     * Get current user data
     * @returns {Object|null} - User data or null if not authenticated
     */
    getCurrentUser: () => {
        const userData = localStorage.getItem(USER_DATA_KEY);
        return userData ? JSON.parse(userData) : null;
    },

    /**
     * Check if user is authenticated
     * @returns {boolean} - True if authenticated
     */
    isAuthenticated: () => {
        return !!AuthService.getToken();
    },

    /**
     * Check if current user has a specific role
     * @param {string} role - Role to check
     * @returns {boolean} - True if user has the role
     */
    hasRole: (role) => {
        const user = AuthService.getCurrentUser();
        return user && user.role === role;
    },

    /**
     * Get authorization header for API requests
     * @returns {Object} - Headers with Authorization token
     */
    getAuthHeader: () => {
        const token = AuthService.getToken();
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }
};

// Export for use in other components
window.AuthService = AuthService; 