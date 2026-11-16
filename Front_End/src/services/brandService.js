import { brandApi } from '../api/brandApi';
export const brandService = {
  getAll: async () => {
    const data = await brandApi.getAll();
    return Array.isArray(data) ? data : data?.content || [];
  },
  getById: async (id) => {
    return brandApi.getById(id);
  },
  create: async (data) => {
    return await brandApi.create(data);
  },
  update: async (id, data) => {
    return await brandApi.update(id, data);
  },
  delete: async (id) => {
    return await brandApi.delete(id);
  },
};

export default brandService;
