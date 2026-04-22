const DEFAULT_API_BASE_URL = 'http://localhost:9002';
const DEFAULT_EMPIRE_MACHINE_URL = 'http://localhost:8001';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL;

export const EMPIRE_MACHINE_URL =
  import.meta.env.VITE_EMPIRE_MACHINE_URL || DEFAULT_EMPIRE_MACHINE_URL;

export const getApiUrl = (path) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

