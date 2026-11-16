import axiosInstance from './axiosInstance';

export const brandApi = {
  /**
   * Fetch all brands
   * GET /api/brands
   */
  getAll: async () => {
    return await axiosInstance.get('/brands');
  },

  /**
   * Fetch single brand by ID
   * GET /api/brands/{id}
   */
  getById: async (id) => {
    return await axiosInstance.get(`/brands/${id}`);
  },

  /**
   * Create brand
   * POST /api/brands
   * DTO: BrandRequest { name, description, status }
   */
  create: async (data) => {
    return await axiosInstance.post('/brands', data);
  },

  /**
   * Update brand
   * PUT /api/brands/{id}
   * DTO: BrandRequest { name, description, status }
   */
  update: async (id, data) => {
    return await axiosInstance.put(`/brands/${id}`, data);
  },

  /**
   * Delete brand
   * DELETE /api/brands/{id}
   */
  delete: async (id) => {
    return await axiosInstance.delete(`/brands/${id}`);
  },
};

export default brandApi;

