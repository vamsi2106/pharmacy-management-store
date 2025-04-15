import api from '../utils/apiInterceptor';
import { CART_ENDPOINTS } from '../config/apiConfig';

const cartService = {
    /**
     * Get current user's cart
     * @returns {Promise<Object>} Cart object with items
     */
    getCart: async () => {
        try {
            const response = await api.get(CART_ENDPOINTS.CART);
            return response.data;
        } catch (error) {
            console.error('Error fetching cart:', error);
            throw error;
        }
    },

    /**
     * Add item to cart
     * @param {string} productId - Product ID to add
     * @param {number} quantity - Quantity to add (default: 1)
     * @returns {Promise<Object>} Updated cart
     */
    addToCart: async (productId, quantity = 1) => {
        try {
            const response = await api.post(CART_ENDPOINTS.ITEMS, {
                productId,
                quantity
            });
            return response.data;
        } catch (error) {
            console.error('Error adding item to cart:', error);
            throw error;
        }
    },

    /**
     * Update cart item quantity
     * @param {string} cartItemId - Cart item ID to update
     * @param {number} quantity - New quantity
     * @returns {Promise<Object>} Updated cart
     */
    updateCartItem: async (cartItemId, quantity) => {
        try {
            const response = await api.put(CART_ENDPOINTS.ITEM(cartItemId), {
                quantity
            });
            return response.data;
        } catch (error) {
            console.error(`Error updating cart item ${cartItemId}:`, error);
            throw error;
        }
    },

    /**
     * Remove item from cart
     * @param {string} cartItemId - Cart item ID to remove
     * @returns {Promise<Object>} Updated cart
     */
    removeFromCart: async (cartItemId) => {
        try {
            const response = await api.delete(CART_ENDPOINTS.ITEM(cartItemId));
            return response.data;
        } catch (error) {
            console.error(`Error removing item ${cartItemId} from cart:`, error);
            throw error;
        }
    },

    /**
     * Clear entire cart
     * @returns {Promise<Object>} Empty cart
     */
    clearCart: async () => {
        try {
            const response = await api.delete(CART_ENDPOINTS.CART);
            return response.data;
        } catch (error) {
            console.error('Error clearing cart:', error);
            throw error;
        }
    },

    /**
     * Apply coupon to cart
     * @param {string} couponCode - Coupon code to apply
     * @returns {Promise<Object>} Updated cart with applied discount
     */
    applyCoupon: async (couponCode) => {
        try {
            const response = await api.post(`${CART_ENDPOINTS.CART}/coupon`, {
                couponCode
            });
            return response.data;
        } catch (error) {
            console.error(`Error applying coupon ${couponCode}:`, error);
            throw error;
        }
    },

    /**
     * Remove coupon from cart
     * @returns {Promise<Object>} Updated cart without coupon
     */
    removeCoupon: async () => {
        try {
            const response = await api.delete(`${CART_ENDPOINTS.CART}/coupon`);
            return response.data;
        } catch (error) {
            console.error('Error removing coupon from cart:', error);
            throw error;
        }
    }
};

export default cartService; 