import axiosInstance from './axiosInstance';

export const categoryApi = {
  /**
   * Fetch all categories
   * GET /api/categories
   */
  getAll: async () => {
    return await axiosInstance.get('/categories');
  },

  /**
   * Fetch single category by ID
   * GET /api/categories/{id}
   */
  getById: async (id) => {
    return await axiosInstance.get(`/categories/${id}`);
  },

  /**
   * Paginated and filtered categories
   * GET /api/categories/filter
   * Returns PageResponse: { content, pageNumber, pageSize, totalElements, totalpage, first, last }
   */
  filter: async (params = {}) => {
    return await axiosInstance.get('/categories/filter', { params });
  },

  /**
   * Create category
   * POST /api/categories
   * DTO: RequestCategory { name, code, description, status }
   */
  create: async (data) => {
    return await axiosInstance.post('/categories', data);
  },

  /**
   * Update category
   * PUT /api/categories/{id}
   * DTO: RequestCategory { name, code, description, status }
   */
  update: async (id, data) => {
    return await axiosInstance.put(`/categories/${id}`, data);
  },

  /**
   * Delete category
   * DELETE /api/categories/{id}
   */
  delete: async (id) => {
    return await axiosInstance.delete(`/categories/${id}`);
  },
};

export default categoryApi;

