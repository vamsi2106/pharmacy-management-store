import api from '../utils/apiInterceptor';
import { PAYMENT_ENDPOINTS } from '../config/apiConfig';

/**
 * Process a new payment
 * @param {Object} paymentData - Payment request data
 * @param {number} paymentData.orderId - Order ID associated with payment
 * @param {number} paymentData.amount - Payment amount
 * @param {string} paymentData.paymentMethod - Payment method (CREDIT_CARD, DEBIT_CARD, etc.)
 * @param {string} [paymentData.cardNumber] - Credit card number (if applicable)
 * @param {string} [paymentData.cardHolderName] - Card holder name (if applicable)
 * @param {string} [paymentData.expiryDate] - Card expiry date (if applicable)
 * @param {string} [paymentData.cvv] - Card CVV (if applicable)
 * @returns {Promise<Object>} Payment data
 */
const processPayment = async (paymentData) => {
    try {
        const response = await api.post(PAYMENT_ENDPOINTS.PROCESS, paymentData);
        return response.data;
    } catch (error) {
        console.error('Error processing payment:', error);
        throw error;
    }
};

/**
 * Get payment by ID
 * @param {number} id - Payment ID
 * @returns {Promise<Object>} Payment data
 */
const getPaymentById = async (id) => {
    try {
        const response = await api.get(PAYMENT_ENDPOINTS.BY_ID(id));
        return response.data;
    } catch (error) {
        console.error(`Error fetching payment ${id}:`, error);
        throw error;
    }
};

/**
 * Get payment by order ID
 * @param {number} orderId - Order ID
 * @returns {Promise<Object>} Payment data
 */
const getPaymentByOrder = async (orderId) => {
    try {
        const response = await api.get(PAYMENT_ENDPOINTS.BY_ORDER(orderId));
        return response.data;
    } catch (error) {
        console.error(`Error fetching payment for order ${orderId}:`, error);
        throw error;
    }
};

/**
 * Get all payments (admin function)
 * @returns {Promise<Array>} List of all payments
 */
const getAllPayments = async () => {
    try {
        const response = await api.get(PAYMENT_ENDPOINTS.ALL);
        return response.data;
    } catch (error) {
        console.error('Error fetching all payments:', error);
        throw error;
    }
};

/**
 * Update payment status
 * @param {number} id - Payment ID
 * @param {string} status - New payment status
 * @returns {Promise<Object>} Updated payment data
 */
const updatePaymentStatus = async (id, status) => {
    try {
        const response = await api.put(
            PAYMENT_ENDPOINTS.UPDATE_STATUS(id),
            { status }
        );
        return response.data;
    } catch (error) {
        console.error(`Error updating payment status for ${id}:`, error);
        throw error;
    }
};

export default {
    processPayment,
    getPaymentById,
    getPaymentByOrder,
    getAllPayments,
    updatePaymentStatus
}; 