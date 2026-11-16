import { productApi } from '../api/productApi';
import { getImageUrl } from '../utils/imageHelper';

const withImageUrl = (product) => {
  if (!product) return product;
  const image = product.imageUrl || product.image;
  return image ? { ...product, imageUrl: getImageUrl(image) } : product;
};

const withImageUrls = (products) => products.map(withImageUrl);

export const productService = {
  async list(params) {
    const data = await productApi.getAll(params);
    const list = Array.isArray(data) ? data : data?.content || [];
    return withImageUrls(list);
  },

  async filter(params) {
    const data = await productApi.filter(params);
    const list = Array.isArray(data) ? data : data?.content || [];
    return withImageUrls(list);
  },

  async get(id) {
    const data = await productApi.getById(id);
    return withImageUrl(data);
  },

  async create(formData) {
    return await productApi.create(formData);
  },

  async update(id, values) {
    return await productApi.update(id, values);
  },

  async remove(id) {
    return await productApi.delete(id);
  },
};

export default productService;
