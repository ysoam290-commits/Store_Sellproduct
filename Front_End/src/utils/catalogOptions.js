const uniqueNamedOptions = (products, nameField, idField) => {
  const options = new Map();

  products.forEach((product) => {
    const name = String(product[nameField] || '').trim();
    const key = name.toLocaleLowerCase();
    if (key && !options.has(key)) {
      options.set(key, { id: product[idField], name });
    }
  });

  return [...options.values()].sort((a, b) => a.name.localeCompare(b.name));
};

export const getProductCategories = (products = []) =>
  uniqueNamedOptions(products, 'categoryName', 'categoryId');

export const getProductBrands = (products = []) =>
  uniqueNamedOptions(products, 'brandName', 'brandId');
