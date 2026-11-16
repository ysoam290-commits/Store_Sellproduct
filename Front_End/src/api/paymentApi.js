import axiosInstance from './axiosInstance';

export const paymentApi = {
  createKhqr: (orderId, customer = {}) => axiosInstance.post('/payments/khqr', {
    orderId,
    firstName: customer.firstName,
    lastName: customer.lastName,
    phone: customer.phone,
  }),
  checkStatus: (paymentId) => axiosInstance.get(`/payments/${paymentId}/status`),
};
