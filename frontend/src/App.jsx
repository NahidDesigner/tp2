import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useAuthStore from './store/authStore'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Stores from './pages/Stores'
import Products from './pages/Products'
import Orders from './pages/Orders'
import ProductLanding from './pages/ProductLanding'
import Checkout from './pages/Checkout'
import StoreSettings from './pages/StoreSettings'

function App() {
  const { i18n } = useTranslation()
  const { isAuthenticated, loadUser, token } = useAuthStore()

  useEffect(() => {
    // Load user on mount if token exists
    const storedToken = localStorage.getItem('token')
    if (storedToken && !isAuthenticated) {
      // Token exists but state not synced - reload user
      loadUser()
    } else if (isAuthenticated && token) {
      // Already authenticated, just ensure user is loaded
      loadUser()
    }
  }, []) // Only run on mount

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/p/:slug" element={<ProductLanding />} />
        <Route path="/checkout" element={<Checkout />} />
        
        {/* Auth routes */}
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
        
        {/* Protected routes */}
        <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/stores" element={isAuthenticated ? <Stores /> : <Navigate to="/login" />} />
        <Route path="/stores/:storeId/settings" element={isAuthenticated ? <StoreSettings /> : <Navigate to="/login" />} />
        <Route path="/products" element={isAuthenticated ? <Products /> : <Navigate to="/login" />} />
        <Route path="/orders" element={isAuthenticated ? <Orders /> : <Navigate to="/login" />} />
        
        {/* Default */}
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
