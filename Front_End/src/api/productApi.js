import axiosInstance from './axiosInstance';

export const productApi = {
  /**
   * Fetch all products
   * GET /api/products
   */
  getAll: async (params) => {
    return await axiosInstance.get('/products', { params });
  },

  /**
   * Fetch single product by ID
   * GET /api/products/{id}
   */
  getById: async (id) => {
    return await axiosInstance.get(`/products/${id}`);
  },

  /**
   * Filter products by parameters
   * Note: Backend ProductController uses param 'categotyId' (with typo)
   * GET /api/products/filter
   */
  filter: async (params = {}) => {
    const formattedParams = { ...params };
    // Support both categoryId and categotyId
    if (formattedParams.categoryId && !formattedParams.categotyId) {
      formattedParams.categotyId = formattedParams.categoryId;
    }
    return await axiosInstance.get('/products/filter', { params: formattedParams });
  },

  /**
   * Create product with multipart/form-data (required for image upload)
   * POST /api/products
   */
  create: async (formData) => {
    return await axiosInstance.post('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Update product (JSON payload)
   * PUT /api/products/{id}
   */
  update: async (id, data) => {
    return await axiosInstance.put(`/products/${id}`, data);
  },

  /**
   * Delete product by ID
   * DELETE /api/products/{id}
   */
  delete: async (id) => {
    return await axiosInstance.delete(`/products/${id}`);
  },
};

export default productApi;

