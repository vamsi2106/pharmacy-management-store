import api from '../utils/apiInterceptor';
import { AUTH_ENDPOINTS } from '../config/apiConfig';

/**
 * Login with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} Authentication response with token and user data
 */
const login = async (email, password) => {
    try {
        const response = await api.post(AUTH_ENDPOINTS.LOGIN, {
            email,
            password
        });
        return response.data;
    } catch (error) {
        console.error('Login failed:', error);
        throw error;
    }
};

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} Newly created user
 */
const register = async (userData) => {
    try {
        const response = await api.post(AUTH_ENDPOINTS.REGISTER, userData);
        return response.data;
    } catch (error) {
        console.error('Registration failed:', error);
        throw error;
    }
};

/**
 * Logout the current user
 * @returns {Promise<void>}
 */
const logout = async () => {
    try {
        await api.post(AUTH_ENDPOINTS.LOGOUT);
        // Clear any local authentication data
        localStorage.removeItem('token');
    } catch (error) {
        console.error('Logout failed:', error);
        // Still remove the token even if the API call fails
        localStorage.removeItem('token');
        throw error;
    }
};

const authService = {
    login,
    register,
    logout
};

export default authService; 