import api from '../utils/apiInterceptor';
import { PRODUCT_ENDPOINTS } from '../config/apiConfig';

const getAllProducts = async () => {
    try {
        const response = await api.get(PRODUCT_ENDPOINTS.ALL);
        return response.data;
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
};

const getProductById = async (id) => {
    try {
        const response = await api.get(PRODUCT_ENDPOINTS.BY_ID(id));
        return response.data;
    } catch (error) {
        console.error(`Error fetching product ${id}:`, error);
        throw error;
    }
};

const getProductsByCategory = async (category) => {
    try {
        const response = await api.get(PRODUCT_ENDPOINTS.BY_CATEGORY(category));
        return response.data;
    } catch (error) {
        console.error(`Error fetching products in category ${category}:`, error);
        throw error;
    }
};

const searchProducts = async (name) => {
    try {
        const response = await api.get(`${PRODUCT_ENDPOINTS.SEARCH}?name=${name}`);
        return response.data;
    } catch (error) {
        console.error(`Error searching products with name ${name}:`, error);
        throw error;
    }
};

const getProductsByPrescriptionRequirement = async (requiresPrescription) => {
    try {
        const response = await api.get(`${PRODUCT_ENDPOINTS.ALL}/prescription?requiresPrescription=${requiresPrescription}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching products with prescription requirement ${requiresPrescription}:`, error);
        throw error;
    }
};

// Admin functions
const createProduct = async (productData) => {
    try {
        const response = await api.post(PRODUCT_ENDPOINTS.ALL, productData);
        return response.data;
    } catch (error) {
        console.error('Error creating product:', error);
        throw error;
    }
};

const updateProduct = async (id, productData) => {
    try {
        const response = await api.put(PRODUCT_ENDPOINTS.BY_ID(id), productData);
        return response.data;
    } catch (error) {
        console.error(`Error updating product ${id}:`, error);
        throw error;
    }
};

const deleteProduct = async (id) => {
    try {
        const response = await api.delete(PRODUCT_ENDPOINTS.BY_ID(id));
        return response.data;
    } catch (error) {
        console.error(`Error deleting product ${id}:`, error);
        throw error;
    }
};

const productService = {
    getAllProducts,
    getProductById,
    getProductsByCategory,
    searchProducts,
    getProductsByPrescriptionRequirement,
    createProduct,
    updateProduct,
    deleteProduct
};

export default productService; 