import axios from 'axios';

// Create a single Axios instance that all service files will share.
// This keeps base URL and token handling in one place.
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    withCredentials: true, // send httpOnly cookies with every request
    headers: { 'Content-Type': 'application/json' },
});

// Attach the JWT token from localStorage to every outgoing request.
// This acts as a fallback when the httpOnly cookie is not available (e.g. CORS dev setups).
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 responses globally — if the token has expired, clear local
// storage and redirect to the login page so the user can re-authenticate.
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Only redirect if we are not already on an auth page
            if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
