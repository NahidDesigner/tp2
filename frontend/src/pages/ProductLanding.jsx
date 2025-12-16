import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import apiClient from '../api/client'

function ProductLanding() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const [product, setProduct] = useState(null)
  const [store, setStore] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  useEffect(() => {
    loadProduct()
  }, [slug])

  const loadProduct = async () => {
    try {
      // Try public endpoint first (works without subdomain)
      const publicResponse = await apiClient.get(`/api/public/products?slug=${slug}`)
      if (publicResponse.data && publicResponse.data.length > 0) {
        setProduct(publicResponse.data[0])
        
        // Load store info
        try {
          const storeResponse = await apiClient.get('/api/public/store')
          setStore(storeResponse.data)
        } catch (e) {
          console.error('Failed to load store:', e)
        }
      } else {
        // Fallback: try direct slug endpoint
        const response = await apiClient.get(`/api/products/slug/${slug}`)
        setProduct(response.data)
        
        // Load store info
        try {
          const storeResponse = await apiClient.get('/api/public/store')
          setStore(storeResponse.data)
        } catch (e) {
          console.error('Failed to load store:', e)
        }
      }
    } catch (error) {
      console.error('Failed to load product:', error)
    } finally {
      setLoading(false)
    }
  }

  const getImageUrl = (url) => {
    if (!url) return null
    if (url.startsWith('http')) return url
    // Handle both /api/uploads/images/ and /uploads/ paths
    if (url.startsWith('/api/uploads/') || url.startsWith('/uploads/')) {
      const apiUrl = apiClient.defaults.baseURL || window.location.origin
      return `${apiUrl}${url}`
    }
    const apiUrl = apiClient.defaults.baseURL || window.location.origin
    return `${apiUrl}${url}`
  }

  const getImages = () => {
    if (!product?.images) return []
    try {
      const images = JSON.parse(product.images)
      return images.map(getImageUrl).filter(Boolean)
    } catch (e) {
      return []
    }
  }

  const shareOnFacebook = () => {
    const url = window.location.href
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
  }

  const shareOnWhatsApp = () => {
    const url = window.location.href
    const text = product?.title || 'Check out this product!'
    window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank')
  }

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    alert('Link copied to clipboard!')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>{t('loading')}</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Product not found</h1>
          <p className="text-gray-600">The product you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  const images = getImages()
  const price = product.discount_price || product.price
  const originalPrice = product.discount_price ? product.price : null
  const discountPercent = product.discount_price 
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <button 
            onClick={() => window.history.back()} 
            className="text-2xl hover:bg-gray-100 rounded-full p-2"
          >
            ←
          </button>
          {store && (
            <h1 className="text-lg font-bold font-outfit">{store.name}</h1>
          )}
          <button
            onClick={() => i18n.changeLanguage(i18n.language === 'bn' ? 'en' : 'bn')}
            className="text-sm px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
          >
            {i18n.language === 'bn' ? 'EN' : 'BN'}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Image Gallery */}
          <div className="relative">
            <div className="aspect-square bg-gray-100 flex items-center justify-center">
              {images.length > 0 ? (
                <img 
                  src={images[selectedImageIndex]} 
                  alt={product.title} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-8xl">📦</span>
              )}
            </div>
            
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImageIndex(Math.max(0, selectedImageIndex - 1))}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow"
                  disabled={selectedImageIndex === 0}
                >
                  ←
                </button>
                <button
                  onClick={() => setSelectedImageIndex(Math.min(images.length - 1, selectedImageIndex + 1))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow"
                  disabled={selectedImageIndex === images.length - 1}
                >
                  →
                </button>
                
                {/* Thumbnails */}
                <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2 overflow-x-auto px-2">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`w-16 h-16 rounded border-2 overflow-hidden flex-shrink-0 ${
                        selectedImageIndex === idx ? 'border-blue-600' : 'border-gray-300'
                      }`}
                    >
                      <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Product Info */}
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-2 font-outfit">
              {i18n.language === 'bn' && product.title_bn ? product.title_bn : product.title}
            </h1>
            
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl font-bold text-blue-600">৳{price}</span>
              {originalPrice && (
                <>
                  <span className="text-2xl text-gray-400 line-through">৳{originalPrice}</span>
                  <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
                    {discountPercent}% OFF
                  </span>
                </>
              )}
            </div>

            {(product.description || product.description_bn) && (
              <div className="mb-6">
                <h2 className="font-semibold mb-2">Description</h2>
                <p className="text-gray-700 leading-relaxed">
                  {i18n.language === 'bn' && product.description_bn 
                    ? product.description_bn 
                    : product.description}
                </p>
              </div>
            )}

            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">Availability:</span>
                <span className={product.stock > 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </span>
              </div>
            </div>

            {/* Share Buttons */}
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">Share this product:</p>
              <div className="flex gap-2">
                <button
                  onClick={shareOnFacebook}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700"
                >
                  📘 Facebook
                </button>
                <button
                  onClick={shareOnWhatsApp}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700"
                >
                  💬 WhatsApp
                </button>
                <button
                  onClick={copyLink}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  📋 Copy
                </button>
              </div>
            </div>

            {/* Buy Button */}
            <button
              onClick={() => navigate(`/checkout?product=${product.id}`)}
              disabled={product.stock === 0}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {product.stock > 0 ? t('place_order') : 'Out of Stock'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductLanding
