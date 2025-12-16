import { create } from 'zustand'
import apiClient from '../api/client'

const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  
  // Initialize from localStorage on store creation
  initialize: () => {
    const token = localStorage.getItem('token')
    if (token) {
      set({ token, isAuthenticated: true })
      // Load user in background
      get().loadUser()
    }
  },
  
  login: async (phone, otp) => {
    try {
      const response = await apiClient.post('/api/auth/otp/verify', { phone, otp })
      const { access_token, user } = response.data
      localStorage.setItem('token', access_token)
      set({ user, token: access_token, isAuthenticated: true })
      // Verify token works by loading user
      await get().loadUser()
      return { success: true }
    } catch (error) {
      // If login succeeded but loadUser failed, still return success
      const token = localStorage.getItem('token')
      if (token) {
        return { success: true }
      }
      return { success: false, error: error.response?.data?.detail || 'Login failed' }
    }
  },
  
  requestOTP: async (phone) => {
    try {
      const response = await apiClient.post('/api/auth/otp/request', { phone })
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Failed to request OTP' }
    }
  },
  
  logout: () => {
    localStorage.removeItem('token')
    set({ user: null, token: null, isAuthenticated: false })
  },
  
  loadUser: async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      set({ isAuthenticated: false, user: null, token: null })
      return
    }
    
    try {
      const response = await apiClient.get('/api/auth/me')
      set({ user: response.data, isAuthenticated: true, token })
    } catch (error) {
      // If 401, token is invalid - clear auth
      if (error.response?.status === 401) {
        localStorage.removeItem('token')
        set({ isAuthenticated: false, user: null, token: null })
      }
      // Otherwise, keep token but don't set user
    }
  },
}))

export default useAuthStore

