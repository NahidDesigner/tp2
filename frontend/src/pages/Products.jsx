import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Layout from '../components/Layout'
import apiClient from '../api/client'

function Products() {
  const { t } = useTranslation()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const response = await apiClient.get('/api/products')
      setProducts(response.data)
    } catch (error) {
      console.error('Failed to load products:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Layout><div className="text-center py-8">{t('loading')}</div></Layout>
  }

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold font-outfit">{t('products')}</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold">
          {t('create_product')}
        </button>
      </div>

      <div className="grid gap-4">
        {products.map((product) => (
          <div key={product.id} className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2">{product.title}</h2>
            <p className="text-blue-600 font-bold">৳{product.price}</p>
            <p className="text-sm text-gray-600">Stock: {product.stock}</p>
          </div>
        ))}
        {products.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No products yet.
          </div>
        )}
      </div>
    </Layout>
  )
}

export default Products

