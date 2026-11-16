import { categoryApi } from '../api/categoryApi';
export const categoryService = {
  getAll: async () => {
    const data = await categoryApi.getAll();
    return Array.isArray(data) ? data : data?.content || [];
  },
  getById: async (id) => {
    return categoryApi.getById(id);
  },
  create: async (data) => {
    return await categoryApi.create(data);
  },
  update: async (id, data) => {
    return await categoryApi.update(id, data);
  },
  delete: async (id) => {
    return await categoryApi.delete(id);
  },
};

export default categoryService;
