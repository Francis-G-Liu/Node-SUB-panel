/**
 * Global API URL Builder Utility
 */

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');

/**
 * Ensures all API calls use the correct base URL and path prefixing.
 */
export const buildApiUrl = (path: string) => {
  // If the path already has a protocol, return it as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Ensure the path starts with a slash
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${apiBaseUrl}${cleanPath}`;
};
