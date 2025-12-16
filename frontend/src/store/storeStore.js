import { create } from 'zustand'
import apiClient from '../api/client'

const useStoreStore = create((set, get) => ({
  stores: [],
  currentStore: null,
  loading: false,
  
  loadStores: async () => {
    set({ loading: true })
    try {
      const response = await apiClient.get('/api/stores')
      const stores = response.data
      set({ stores, loading: false })
      
      // Auto-select first store if no current store
      if (stores.length > 0 && !get().currentStore) {
        set({ currentStore: stores[0] })
      }
      return stores
    } catch (error) {
      console.error('Failed to load stores:', error)
      set({ loading: false })
      return []
    }
  },
  
  setCurrentStore: (store) => {
    set({ currentStore: store })
    localStorage.setItem('currentStoreId', store?.id)
  },
  
  getCurrentStore: () => {
    return get().currentStore
  },
  
  getProductUrl: (product) => {
    const store = get().currentStore
    if (!store || !product) return ''
    
    // Get base domain from config or current location
    let baseDomain = '72.61.239.193.sslip.io' // Default
    if (typeof window !== 'undefined') {
      if (window.APP_CONFIG && window.APP_CONFIG.API_URL) {
        try {
          const apiUrl = window.APP_CONFIG.API_URL
          const url = new URL(apiUrl)
          baseDomain = url.hostname.replace(/^[^.]+\./, '') || baseDomain
        } catch (e) {
          // Use default if URL parsing fails
        }
      } else {
        // Extract from current location
        const host = window.location.host
        const parts = host.split('.')
        if (parts.length >= 3) {
          baseDomain = parts.slice(-3).join('.') // Get last 3 parts (e.g., 72.61.239.193.sslip.io)
        }
      }
    }
    
    const protocol = window.location.protocol
    
    // Construct product URL - use subdomain if available
    if (store.subdomain) {
      return `${protocol}//${store.subdomain}.${baseDomain}/p/${product.slug}`
    }
    
    // Fallback to main domain with slug (works without subdomain routing)
    return `${protocol}//${baseDomain}/p/${product.slug}`
  },
  
  getStoreUrl: (store) => {
    if (!store) return ''
    
    // Get base domain from config or current location
    let baseDomain = '72.61.239.193.sslip.io' // Default
    if (typeof window !== 'undefined') {
      if (window.APP_CONFIG && window.APP_CONFIG.API_URL) {
        try {
          const apiUrl = window.APP_CONFIG.API_URL
          const url = new URL(apiUrl)
          baseDomain = url.hostname.replace(/^[^.]+\./, '') || baseDomain
        } catch (e) {
          // Use default if URL parsing fails
        }
      } else {
        // Extract from current location
        const host = window.location.host
        const parts = host.split('.')
        if (parts.length >= 3) {
          baseDomain = parts.slice(-3).join('.') // Get last 3 parts
        }
      }
    }
    
    const protocol = window.location.protocol
    
    if (store.subdomain) {
      return `${protocol}//${store.subdomain}.${baseDomain}`
    }
    
    return `${protocol}//${baseDomain}`
  },
  
  initialize: async () => {
    const stores = await get().loadStores()
    const savedStoreId = localStorage.getItem('currentStoreId')
    if (savedStoreId && stores.length > 0) {
      const store = stores.find(s => s.id === parseInt(savedStoreId))
      if (store) {
        set({ currentStore: store })
      } else if (stores.length > 0) {
        set({ currentStore: stores[0] })
      }
    } else if (stores.length > 0) {
      set({ currentStore: stores[0] })
    }
  },
}))

export default useStoreStore

