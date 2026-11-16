import axiosInstance from './axiosInstance';

export const orderApi = {
  create: (userId, order) => axiosInstance.post(`/orders/${userId}`, order),
};
