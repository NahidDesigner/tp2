import { create } from 'zustand'
import apiClient from '../api/client'

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  
  login: async (phone, otp) => {
    try {
      const response = await apiClient.post('/api/auth/otp/verify', { phone, otp })
      const { access_token, user } = response.data
      localStorage.setItem('token', access_token)
      set({ user, token: access_token, isAuthenticated: true })
      return { success: true }
    } catch (error) {
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
    try {
      const response = await apiClient.get('/api/auth/me')
      set({ user: response.data })
    } catch (error) {
      // Silent fail
    }
  },
}))

export default useAuthStore

