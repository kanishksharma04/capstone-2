// Get API URL from environment variable or use fallback
const getApiUrl = () => {
  // First check for explicit VITE_API_URL environment variable
  if (import.meta.env.VITE_API_URL) {
    const url = import.meta.env.VITE_API_URL;
    console.log('Using VITE_API_URL:', url);
    return url;
  }
  
  // In development (localhost), default to backend on port 3001
  if (import.meta.env.DEV) {
    const url = 'http://localhost:3001';
    console.log('Using development API URL:', url);
    return url;
  }
  
  // In production, if no explicit URL, try to construct from current origin
  if (typeof window !== 'undefined') {
    // If backend is on same domain, use relative path
    // Otherwise, you need to set VITE_API_URL in your hosting environment
    const url = `${window.location.origin}`;
    console.log('Using fallback API URL:', url);
    return url;
  }
  
  // Fallback for SSR
  return '';
};

export const API_URL = getApiUrl();

// Log API URL for debugging
console.log('API_URL configured as:', API_URL);

export default API_URL;
