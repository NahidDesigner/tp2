import axios from 'axios'

// Get API URL from config or environment
const getApiUrl = () => {
  if (typeof window !== 'undefined' && window.APP_CONFIG && window.APP_CONFIG.API_URL) {
    return window.APP_CONFIG.API_URL
  }
  return import.meta.env.VITE_API_URL || 'http://localhost:8000'
}

const apiClient = axios.create({
  baseURL: getApiUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    // Send dev tokens too - backend will handle them
    config.headers.Authorization = `Bearer ${token}`
  }
  // Don't set Content-Type for FormData - let browser set it with boundary
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }
  return config
})

// Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if using dev token - skip 401 redirect
    const token = localStorage.getItem('token')
    const isDevToken = token && token.startsWith('dev-token-')
    
    // Only redirect on 401 if we're not already on login page and not using dev token
    if (error.response?.status === 401 && !isDevToken && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('token')
      // Use navigate if available, otherwise redirect
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient

