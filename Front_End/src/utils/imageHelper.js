const API_URL = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:8082')
  .replace(/\/+$/, '')
  .replace(/\/api$/, '');

/**
 * Returns full URL for product / user images uploaded to the Spring Boot backend
 * Backend maps "/uploads/**" to the file storage directory
 */
export function getImageUrl(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const cleanPath = path.replace(/^\/+/, '');
  if (cleanPath.startsWith('uploads/')) {
    return `${API_URL}/${cleanPath}`;
  }
  return `${API_URL}/uploads/${cleanPath}`;
}

