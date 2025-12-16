import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import apiClient from '../api/client'

function Checkout() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const productId = searchParams.get('product')
  
  const [product, setProduct] = useState(null)
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    shipping_address: '',
    shipping_city: '',
    shipping_postal: '',
    quantity: 1
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (productId) {
      loadProduct()
    }
  }, [productId])

  const loadProduct = async () => {
    try {
      const response = await apiClient.get(`/api/products/${productId}`)
      setProduct(response.data)
    } catch (error) {
      console.error('Failed to load product:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!product) return

    setLoading(true)
    try {
      await apiClient.post('/api/orders', {
        items: [{ product_id: product.id, quantity: formData.quantity }],
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        customer_email: formData.customer_email,
        shipping_address: formData.shipping_address,
        shipping_city: formData.shipping_city,
        shipping_postal: formData.shipping_postal,
      })
      alert('Order placed successfully!')
      navigate('/')
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  if (!product) {
    return <div className="min-h-screen flex items-center justify-center">{t('loading')}</div>
  }

  const total = (product.discount_price || product.price) * formData.quantity

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm sticky top-0 z-10 p-4">
        <button onClick={() => navigate(-1)} className="text-2xl">←</button>
      </div>

      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6 font-outfit">{t('checkout')}</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="font-semibold mb-2">{product.title}</h2>
            <div className="flex justify-between">
              <span>Quantity: {formData.quantity}</span>
              <span className="font-bold">৳{total}</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">{t('customer_name')}</label>
              <input
                type="text"
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{t('phone')}</label>
              <input
                type="tel"
                value={formData.customer_phone}
                onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{t('shipping_address')}</label>
              <textarea
                value={formData.shipping_address}
                onChange={(e) => setFormData({ ...formData, shipping_address: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                rows="3"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold text-lg disabled:opacity-50"
          >
            {loading ? t('loading') : t('place_order')}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Checkout

