import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import apiClient from '../api/client'

function ProductLanding() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProduct()
  }, [slug])

  const loadProduct = async () => {
    try {
      const response = await apiClient.get(`/api/products/slug/${slug}`)
      setProduct(response.data)
    } catch (error) {
      console.error('Failed to load product:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">{t('loading')}</div>
  }

  if (!product) {
    return <div className="min-h-screen flex items-center justify-center">Product not found</div>
  }

  const price = product.discount_price || product.price
  const originalPrice = product.discount_price ? product.price : null

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm sticky top-0 z-10 p-4">
        <div className="flex justify-between items-center">
          <button onClick={() => window.history.back()} className="text-2xl">←</button>
          <button
            onClick={() => i18n.changeLanguage(i18n.language === 'bn' ? 'en' : 'bn')}
            className="text-sm px-3 py-1 bg-gray-100 rounded"
          >
            {i18n.language === 'bn' ? 'EN' : 'BN'}
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow mb-4">
          <div className="aspect-square bg-gray-200 rounded-t-lg flex items-center justify-center">
            {product.images ? (
              <img src={JSON.parse(product.images)[0]} alt={product.title} className="w-full h-full object-cover rounded-t-lg" />
            ) : (
              <span className="text-6xl">📦</span>
            )}
          </div>
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-2 font-outfit">
              {i18n.language === 'bn' && product.title_bn ? product.title_bn : product.title}
            </h1>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl font-bold text-blue-600">৳{price}</span>
              {originalPrice && (
                <span className="text-xl text-gray-400 line-through">৳{originalPrice}</span>
              )}
            </div>
            <p className="text-gray-600 mb-4">
              {i18n.language === 'bn' && product.description_bn ? product.description_bn : product.description}
            </p>
            <div className="text-sm text-gray-500 mb-4">
              Stock: {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
            </div>
            <button
              onClick={() => navigate(`/checkout?product=${product.id}`)}
              disabled={product.stock === 0}
              className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('place_order')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductLanding

