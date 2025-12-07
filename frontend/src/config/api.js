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
  
  // In production, if no explicit URL is set, show error
  // This prevents silent failures
  if (typeof window !== 'undefined') {
    console.error('VITE_API_URL is not set! Please configure it in your hosting platform.');
    console.error('Current origin:', window.location.origin);
    // Try to use current origin as fallback, but log warning
    const url = `${window.location.origin}`;
    console.warn('Using fallback API URL (may not work):', url);
    return url;
  }
  
  // Fallback for SSR
  return '';
};

export const API_URL = getApiUrl();

// Log API URL for debugging
console.log('API_URL configured as:', API_URL);
console.log('Environment:', import.meta.env.MODE);
console.log('VITE_API_URL env var:', import.meta.env.VITE_API_URL);

export default API_URL;
