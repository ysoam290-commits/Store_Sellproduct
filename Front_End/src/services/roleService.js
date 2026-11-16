import { roleApi } from '../api/roleApi';

export const roleService = {
  getAll: async () => {
    const res = await roleApi.getAll();
    return res?.list || (Array.isArray(res) ? res : []);
  },
  getById: async (id) => {
    return roleApi.getById(id);
  },
  create: async (data) => {
    return await roleApi.create(data);
  },
  update: async (id, data) => {
    return await roleApi.update(id, data);
  },
  delete: async (id) => {
    return await roleApi.delete(id);
  },
};

export default roleService;
