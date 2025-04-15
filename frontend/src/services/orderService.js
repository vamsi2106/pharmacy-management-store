import api from '../utils/apiInterceptor';
import { ORDER_ENDPOINTS } from '../config/apiConfig';

const orderService = {
    /**
     * Create a new order from the user's cart
     * @param {Object} orderRequest - Order data including shipping address and items
     * @returns {Promise<Object>} Created order
     */
    createOrder: async (orderRequest) => {
        try {
            const response = await api.post(ORDER_ENDPOINTS.ALL, orderRequest);

            // Cache the new order
            if (response.data && response.data.id) {
                orderService.cacheOrder(response.data.id, response.data);
            }

            return response.data;
        } catch (error) {
            console.error('Error creating order:', error);
            throw error;
        }
    },

    /**
     * Get all orders for the current user
     * @returns {Promise<Array>} List of orders
     */
    getUserOrders: async () => {
        try {
            // Try API call
            const response = await api.get(ORDER_ENDPOINTS.MY_ORDERS);

            // Cache the orders
            if (response.data && response.data.length > 0) {
                orderService.cacheAllOrders(response.data);
            }

            return response.data;
        } catch (error) {
            console.error('Error fetching user orders:', error);

            // Try to get from cache
            const cachedOrders = orderService.getCachedOrders();
            if (cachedOrders) {
                return cachedOrders;
            }

            throw error;
        }
    },

    /**
     * Get a specific order by ID
     * @param {number|string} orderId - Order ID to retrieve
     * @returns {Promise<Object>} Order details
     */
    getOrderById: async (orderId) => {
        // Debug output
        console.log('getOrderById called with:', orderId, 'Type:', typeof orderId);

        // First check cache - moved outside try/catch block
        let cachedOrder = null;
        try {
            cachedOrder = orderService.getCachedOrder(orderId);

            // Try API call
            const response = await api.get(ORDER_ENDPOINTS.BY_ID(orderId));
            console.log('Order API response status:', response.status);

            // Cache the order
            if (response.data && response.data.id) {
                orderService.cacheOrder(response.data.id, response.data);
            }

            return response.data;
        } catch (error) {
            console.error(`Error fetching order ${orderId}:`, error);

            // Return cached order if we have it
            if (cachedOrder) {
                return cachedOrder;
            }

            throw error;
        }
    },

    /**
     * Update order status (for admin/staff)
     * @param {string} orderId - Order ID to update
     * @param {string} status - New status (processing, shipped, delivered, etc.)
     * @returns {Promise<Object>} Updated order
     */
    updateOrderStatus: async (orderId, status) => {
        try {
            const response = await api.put(`${ORDER_ENDPOINTS.BY_ID(orderId)}/status`, {
                status
            });

            // Update cache
            if (response.data && response.data.id) {
                orderService.cacheOrder(response.data.id, response.data);
            }

            return response.data;
        } catch (error) {
            console.error(`Error updating order ${orderId} status:`, error);
            throw error;
        }
    },

    /**
     * Cancel an order
     * @param {string} orderId - Order ID to cancel
     * @param {string} cancelReason - Reason for cancellation
     * @returns {Promise<Object>} Cancelled order
     */
    cancelOrder: async (orderId, cancelReason) => {
        try {
            const response = await api.put(`${ORDER_ENDPOINTS.BY_ID(orderId)}/cancel`, {
                cancelReason
            });

            // Update cache
            if (response.data && response.data.id) {
                orderService.cacheOrder(response.data.id, response.data);
            }

            return response.data;
        } catch (error) {
            console.error(`Error cancelling order ${orderId}:`, error);
            throw error;
        }
    },

    /**
     * Cache all orders
     * @param {Array} orders - Orders to cache
     */
    cacheAllOrders: (orders) => {
        try {
            localStorage.setItem('allOrders', JSON.stringify(orders));

            // Also cache individual orders
            const cachedOrdersString = localStorage.getItem('cachedOrders');
            let cachedOrders = cachedOrdersString ? JSON.parse(cachedOrdersString) : {};

            orders.forEach(order => {
                cachedOrders[order.id] = order;
            });

            localStorage.setItem('cachedOrders', JSON.stringify(cachedOrders));
        } catch (e) {
            console.error('Error caching orders:', e);
        }
    },

    /**
     * Cache a single order
     * @param {string|number} id - Order ID
     * @param {Object} orderData - Order data to cache
     */
    cacheOrder: (id, orderData) => {
        try {
            const cachedOrdersString = localStorage.getItem('cachedOrders');
            const cachedOrders = cachedOrdersString ? JSON.parse(cachedOrdersString) : {};

            cachedOrders[id] = orderData;
            localStorage.setItem('cachedOrders', JSON.stringify(cachedOrders));
        } catch (e) {
            console.error('Error caching order:', e);
        }
    },

    /**
     * Get cached orders
     * @returns {Array|null} Cached orders or null if none
     */
    getCachedOrders: () => {
        try {
            const allOrdersString = localStorage.getItem('allOrders');
            if (!allOrdersString) return null;

            return JSON.parse(allOrdersString);
        } catch (e) {
            console.error('Error retrieving cached orders:', e);
            return null;
        }
    },

    /**
     * Get a cached order
     * @param {string|number} id - Order ID
     * @returns {Object|null} Cached order or null if not found
     */
    getCachedOrder: (id) => {
        try {
            const cachedOrdersString = localStorage.getItem('cachedOrders');
            if (!cachedOrdersString) return null;

            const cachedOrders = JSON.parse(cachedOrdersString);
            return cachedOrders[id] || null;
        } catch (e) {
            console.error('Error retrieving cached order:', e);
            return null;
        }
    },

    /**
     * Get order history for the current user
     * @returns {Promise<Array>} Array of past order objects
     */
    getOrderHistory: async () => {
        try {
            const response = await api.get(ORDER_ENDPOINTS.MY_ORDERS);
            return response.data;
        } catch (error) {
            console.error('Error fetching order history:', error);
            throw error;
        }
    },

    /**
     * Get all orders (admin only)
     * @returns {Promise<Array>} List of all orders
     */
    getAllOrders: async () => {
        try {
            const response = await api.get(ORDER_ENDPOINTS.ALL);
            return response.data;
        } catch (error) {
            console.error('Error fetching all orders:', error);
            throw error;
        }
    }
};

export default orderService; 