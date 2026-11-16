import axiosInstance from './axiosInstance';

export const roleApi = {
  /**
   * Fetch all roles
   * GET /api/roles -> { total, list }
   */
  getAll: async () => {
    return await axiosInstance.get('/roles');
  },

  /**
   * Fetch single role by ID
   * GET /api/roles/{id}
   */
  getById: async (id) => {
    return await axiosInstance.get(`/roles/${id}`);
  },

  /**
   * Create role
   * POST /api/roles
   * Body: { name, code, status, permissions: [...] }
   */
  create: async (data) => {
    return await axiosInstance.post('/roles', data);
  },

  /**
   * Update role
   * PUT /api/roles/{id}
   * Body: { name, code, status, permissions: [...] }
   */
  update: async (id, data) => {
    return await axiosInstance.put(`/roles/${id}`, data);
  },

  /**
   * Delete role
   * DELETE /api/roles/{id}
   */
  delete: async (id) => {
    return await axiosInstance.delete(`/roles/${id}`);
  },
};

export default roleApi;

