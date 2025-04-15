import api from '../utils/apiInterceptor';
import { PRESCRIPTION_ENDPOINTS } from '../config/apiConfig';

const prescriptionService = {
    /**
     * Upload a new prescription
     * @param {FormData} formData - The form data containing the prescription file and metadata
     * @param {Function} progressCallback - Callback function for upload progress
     * @returns {Promise<Object>} Uploaded prescription metadata
     */
    uploadPrescription: async (formData, progressCallback) => {
        try {
            const response = await api.post(PRESCRIPTION_ENDPOINTS.UPLOAD, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: progressCallback,
                // Increase timeout for large files
                timeout: 30000 // 30 seconds
            });
            return response.data;
        } catch (error) {
            console.error('Error uploading prescription:', error);
            // Make sure we throw the error with any response data for handling in the component
            if (error.response) {
                throw error;
            } else if (error.request) {
                // Request was made but no response received
                throw new Error('No response from server. Please check your connection and try again.');
            } else {
                // Something else caused the error
                throw new Error('Error preparing request: ' + error.message);
            }
        }
    },

    /**
     * Get all prescriptions for the current user
     * @returns {Promise<Array>} Array of prescription objects
     */
    getUserPrescriptions: async () => {
        try {
            const response = await api.get(PRESCRIPTION_ENDPOINTS.ALL);
            return response.data;
        } catch (error) {
            console.error('Error fetching prescriptions:', error);
            throw error;
        }
    },

    /**
     * Get a specific prescription by ID
     * @param {string} prescriptionId - The ID of the prescription to retrieve
     * @returns {Promise<Object>} Prescription object
     */
    getPrescriptionById: async (prescriptionId) => {
        try {
            const response = await api.get(PRESCRIPTION_ENDPOINTS.BY_ID(prescriptionId));
            return response.data;
        } catch (error) {
            console.error(`Error fetching prescription ${prescriptionId}:`, error);
            throw error;
        }
    },

    /**
     * Delete a prescription by ID
     * @param {string} prescriptionId - The ID of the prescription to delete
     * @returns {Promise<Object>} Result of the deletion
     */
    deletePrescription: async (prescriptionId) => {
        try {
            const response = await api.delete(PRESCRIPTION_ENDPOINTS.BY_ID(prescriptionId));
            return response.data;
        } catch (error) {
            console.error(`Error deleting prescription ${prescriptionId}:`, error);
            throw error;
        }
    },

    /**
     * Verify a prescription with a doctor
     * @param {string} prescriptionId - The ID of the prescription to verify
     * @returns {Promise<Object>} Updated prescription with verification status
     */
    verifyPrescription: async (prescriptionId) => {
        try {
            const response = await api.post(PRESCRIPTION_ENDPOINTS.VERIFY(prescriptionId), {});
            return response.data;
        } catch (error) {
            console.error(`Error verifying prescription ${prescriptionId}:`, error);
            throw error;
        }
    },

    /**
     * Reject a prescription
     * @param {string} prescriptionId - The ID of the prescription to reject
     * @returns {Promise<Object>} Updated prescription with rejection status
     */
    rejectPrescription: async (prescriptionId) => {
        try {
            const response = await api.post(`${PRESCRIPTION_ENDPOINTS.BY_ID(prescriptionId)}/reject`, {});
            return response.data;
        } catch (error) {
            console.error(`Error rejecting prescription ${prescriptionId}:`, error);
            throw error;
        }
    },

    /**
     * Download a prescription file
     * @param {string} prescriptionId - The ID of the prescription to download
     * @returns {Promise<Blob>} Prescription file as a blob
     */
    downloadPrescription: async (prescriptionId) => {
        try {
            const response = await api.get(PRESCRIPTION_ENDPOINTS.DOWNLOAD(prescriptionId), {
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            console.error(`Error downloading prescription ${prescriptionId}:`, error);
            throw error;
        }
    },

    /**
     * Get all prescriptions (for admin/pharmacist)
     * @returns {Promise<Array>} Array of all prescription objects
     */
    getAllPrescriptions: async () => {
        try {
            const response = await api.get(PRESCRIPTION_ENDPOINTS.ALL_ADMIN);
            return response.data;
        } catch (error) {
            console.error('Error fetching all prescriptions:', error);
            throw error;
        }
    }
};

export default prescriptionService; 