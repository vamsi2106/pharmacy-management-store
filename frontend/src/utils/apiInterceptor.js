import axios from 'axios';
import { getAuthHeader, refreshToken, removeToken } from './auth';

// Create axios instance with default config
const api = axios.create({
    timeout: 30000, // 30 second timeout
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        // Add auth headers to every request
        const authHeaders = getAuthHeader();

        if (authHeaders.Authorization) {
            console.log(`Request to ${config.url} with auth token`);
        }

        config.headers = {
            ...config.headers,
            ...authHeaders
        };
        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => {
        // Any status code within the range of 2xx
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Handle 401 Unauthorized errors
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Attempt to refresh the token
                await refreshToken();

                // Update the authorization header with the new token
                const authHeaders = getAuthHeader();
                originalRequest.headers = {
                    ...originalRequest.headers,
                    ...authHeaders
                };

                // Retry the original request
                return api(originalRequest);
            } catch (refreshError) {
                // If refresh token fails, logout user
                removeToken();

                // Redirect to login page if we're in a browser environment
                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }

                return Promise.reject(refreshError);
            }
        }

        // Handle validation errors (400 Bad Request)
        if (error.response && error.response.status === 400) {
            const data = error.response.data;

            // Check if it's a validation error with field errors
            if (data && data.errors) {
                // Create a human-readable error message from the validation errors
                const validationMessage = Object.entries(data.errors)
                    .map(([field, message]) => `${field}: ${message}`)
                    .join(', ');

                error.message = `Validation error: ${validationMessage}`;
            }
        }

        // Format error message for other errors
        if (error.response && error.response.data && error.response.data.message) {
            error.message = error.response.data.message;
        }

        return Promise.reject(error);
    }
);

export default api; 