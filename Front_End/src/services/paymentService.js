import { paymentApi } from '../api/paymentApi';

// PaymentController currently returns PaymentResponse directly. This also
// accepts ApiResponse { data: PaymentResponse } if the backend wraps it later.
const unwrapPayment = (response) => response?.data ?? response;

export const paymentService = {
  async createKhqr(orderId, customer) {
    return unwrapPayment(await paymentApi.createKhqr(orderId, customer));
  },

  async checkStatus(paymentId) {
    return unwrapPayment(await paymentApi.checkStatus(paymentId));
  },
};

export default paymentService;
