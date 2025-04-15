/**
 * Get the authentication token from localStorage
 */
export const getToken = () => {
    return localStorage.getItem('token');
};

/**
 * Set the authentication token in localStorage
 * @param {string} token - JWT token
 */
export const setToken = (token) => {
    localStorage.setItem('token', token);
};

/**
 * Remove the authentication token from localStorage
 */
export const removeToken = () => {
    localStorage.removeItem('token');
};

/**
 * Check if the user is authenticated
 * @returns {boolean} True if user has a token
 */
export const isAuthenticated = () => {
    const token = getToken();
    if (!token) return false;

    // Additional check: is token expired?
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000 > Date.now(); // exp is in seconds, Date.now() is in milliseconds
    } catch (error) {
        console.error('Error validating token:', error);
        return false;
    }
};

/**
 * Get authorization header with Bearer token
 * Use this function in all API requests that require authentication
 * @returns {Object} Headers object with Authorization
 */
export const getAuthHeader = () => {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Parse the JWT token to get user data
 * @returns {Object|null} User data from token or null if invalid
 */
export const getUserFromToken = () => {
    const token = getToken();
    if (!token) return null;

    try {
        // Get the payload part of the JWT token
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );

        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error parsing token:', error);
        return null;
    }
}

/**
 * Refresh the authentication token
 * @async
 * @returns {Promise<string>} New JWT token
 * @throws {Error} If token refresh fails
 */
export const refreshToken = async () => {
    try {
        const response = await fetch('/api/auth/refresh', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            }
        });

        if (!response.ok) {
            throw new Error('Token refresh failed');
        }

        const data = await response.json();
        setToken(data.token);
        return data.token;
    } catch (error) {
        console.error('Error refreshing token:', error);
        // If refresh fails, logout the user
        removeToken();
        throw error;
    }
};

/**
 * Check if token is expired
 * @returns {boolean} True if token is expired or invalid
 */
export const isTokenExpired = () => {
    const token = getToken();
    if (!token) return true;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expired = payload.exp * 1000 < Date.now();

        if (expired) {
            console.warn('Token is expired');
        }

        return expired;
    } catch (error) {
        console.error('Error checking token expiration:', error);
        return true; // Consider invalid token as expired
    }
};

/**
 * Get complete user data from localStorage
 * @returns {Object|null} User data or null if not found
 */
export const getStoredUser = () => {
    try {
        const userStr = localStorage.getItem('user');
        if (!userStr) return null;

        return JSON.parse(userStr);
    } catch (error) {
        console.error('Error getting stored user:', error);
        return null;
    }
}; 