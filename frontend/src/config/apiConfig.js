/**
 * Central API Configuration
 * This file provides a single source of truth for API configuration settings
 * throughout the application.
 */

// Base API URL - will use environment variable if set, or fallback to localhost
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// Authentication endpoints
export const AUTH_ENDPOINTS = {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    REFRESH: `${API_BASE_URL}/auth/refresh`,
    LOGOUT: `${API_BASE_URL}/auth/logout`
};

// User endpoints
export const USER_ENDPOINTS = {
    CURRENT: `${API_BASE_URL}/users/me`,
    ALL: `${API_BASE_URL}/users`,
    BY_ID: (id) => `${API_BASE_URL}/users/${id}`
};

// Product endpoints
export const PRODUCT_ENDPOINTS = {
    ALL: `${API_BASE_URL}/products`,
    BY_ID: (id) => `${API_BASE_URL}/products/${id}`,
    BY_CATEGORY: (category) => `${API_BASE_URL}/products/category/${category}`,
    SEARCH: `${API_BASE_URL}/products/search`
};

// Cart endpoints
export const CART_ENDPOINTS = {
    CART: `${API_BASE_URL}/cart`,
    ITEMS: `${API_BASE_URL}/cart/items`,
    ITEM: (id) => `${API_BASE_URL}/cart/items/${id}`
};

// Order endpoints
export const ORDER_ENDPOINTS = {
    ALL: `${API_BASE_URL}/orders`,
    BY_ID: (id) => `${API_BASE_URL}/orders/${id}`,
    MY_ORDERS: `${API_BASE_URL}/orders/my-orders`
};

// Prescription endpoints
export const PRESCRIPTION_ENDPOINTS = {
    ALL: `${API_BASE_URL}/prescriptions`,
    ALL_ADMIN: `${API_BASE_URL}/prescriptions/all`,
    BY_ID: (id) => `${API_BASE_URL}/prescriptions/${id}`,
    UPLOAD: `${API_BASE_URL}/prescriptions/upload`,
    DOWNLOAD: (id) => `${API_BASE_URL}/prescriptions/${id}/download`,
    VERIFY: (id) => `${API_BASE_URL}/prescriptions/${id}/verify`
};

// Payment endpoints
export const PAYMENT_ENDPOINTS = {
    ALL: `${API_BASE_URL}/payments`,
    PROCESS: `${API_BASE_URL}/payments/process`,
    BY_ID: (id) => `${API_BASE_URL}/payments/${id}`,
    BY_ORDER: (orderId) => `${API_BASE_URL}/payments/order/${orderId}`,
    UPDATE_STATUS: (id) => `${API_BASE_URL}/payments/${id}/status`
};

// Dashboard endpoints (for admin/pharmacist)
export const DASHBOARD_ENDPOINTS = {
    PENDING_PRESCRIPTIONS: `${API_BASE_URL}/dashboard/prescriptions/pending`,
    VERIFIED_PRESCRIPTIONS: `${API_BASE_URL}/dashboard/prescriptions/verified`,
    PENDING_ORDERS: `${API_BASE_URL}/dashboard/orders/pending`
};

// Common HTTP request options
export const requestOptions = {
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true
}; 