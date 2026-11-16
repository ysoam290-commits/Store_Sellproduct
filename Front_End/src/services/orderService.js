import { orderApi } from '../api/orderApi';

export const orderService = {
  create: (userId, { shippingAddress, note, items }) =>
    orderApi.create(userId, {
      shippingAddress: shippingAddress.trim(),
      note: note?.trim() || '',
      items: items.map(({ id, quantity }) => ({ productId: id, quantity })),
    }),
};
