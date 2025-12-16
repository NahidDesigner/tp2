import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Layout from '../components/Layout'
import apiClient from '../api/client'
import ImageUpload from '../components/ImageUpload'
import useStoreStore from '../store/storeStore'

function Products() {
  const { t } = useTranslation()
  const { getProductUrl, currentStore } = useStoreStore()
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPublished, setFilterPublished] = useState('all')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    discount_price: '',
    stock: '0',
    is_published: false,
    images: []
  })

  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    if (products.length > 0 || searchTerm || filterPublished !== 'all') {
      filterProducts()
    }
  }, [products, searchTerm, filterPublished])

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

  const filterProducts = () => {
    let filtered = [...products]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.title_bn && p.title_bn.includes(searchTerm))
      )
    }

    // Published filter
    if (filterPublished === 'published') {
      filtered = filtered.filter(p => p.is_published)
    } else if (filterPublished === 'draft') {
      filtered = filtered.filter(p => !p.is_published)
    }

    setFilteredProducts(filtered)
  }

  const handleCreateProduct = async (e) => {
    e.preventDefault()
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
        stock: parseInt(formData.stock) || 0,
        images: JSON.stringify(formData.images)
      }
      
      if (editingProduct) {
        await apiClient.put(`/api/products/${editingProduct.id}`, productData)
      } else {
        await apiClient.post('/api/products', productData)
      }
      
      resetForm()
      loadProducts()
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message || 'Failed to save product'
      alert(errorMessage)
    }
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    // Use title/description (prefer Bangla if available, otherwise English)
    setFormData({
      title: product.title_bn || product.title || '',
      description: product.description_bn || product.description || '',
      price: product.price || '',
      discount_price: product.discount_price || '',
      stock: product.stock?.toString() || '0',
      is_published: product.is_published || false,
      images: product.images ? (typeof product.images === 'string' ? JSON.parse(product.images) : product.images) : []
    })
    setShowForm(true)
  }

  const handleDelete = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    
    try {
      await apiClient.delete(`/api/products/${productId}`)
      loadProducts()
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to delete product')
    }
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingProduct(null)
    setFormData({
      title: '',
      description: '',
      price: '',
      discount_price: '',
      stock: '0',
      is_published: false,
      images: []
    })
  }

  const copyProductUrl = (product) => {
    const url = getProductUrl(product)
    navigator.clipboard.writeText(url)
    alert('Product URL copied to clipboard!')
  }

  const getImageUrl = (product) => {
    if (!product.images) return null
    try {
      const images = JSON.parse(product.images)
      if (images && images.length > 0) {
        const imgUrl = images[0]
        if (imgUrl.startsWith('http')) return imgUrl
        const apiUrl = apiClient.defaults.baseURL || window.location.origin
        return `${apiUrl}${imgUrl}`
      }
    } catch (e) {
      return null
    }
    return null
  }

  if (loading) {
    return <Layout><div className="text-center py-8">{t('loading')}</div></Layout>
  }

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold font-outfit">{t('products')}</h1>
        <button
          onClick={() => {
            resetForm()
            setShowForm(true)
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold"
        >
          {t('create_product')}
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Search Products</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name..."
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Filter by Status</label>
            <select
              value={filterPublished}
              onChange={(e) => setFilterPublished(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="all">All Products</option>
              <option value="published">Published Only</option>
              <option value="draft">Draft Only</option>
            </select>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingProduct ? 'Edit Product' : t('create_product')}
          </h2>
          <form onSubmit={handleCreateProduct} className="space-y-4">
            <ImageUpload
              value={formData.images}
              onChange={(images) => setFormData({ ...formData, images })}
              multiple={true}
            />
            
            <div>
              <label className="block text-sm font-medium mb-2">Product Title * (Supports English & Bangla)</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Enter product title in English or Bangla"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description (Supports English & Bangla)</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                rows="3"
                placeholder="Enter product description in English or Bangla"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Price (BDT) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Discount Price (BDT)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.discount_price}
                  onChange={(e) => setFormData({ ...formData, discount_price: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Stock</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_published}
                onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                className="w-4 h-4"
              />
              <label className="text-sm">Publish immediately</label>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg">
                {t('save')}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-200 px-4 py-2 rounded-lg"
              >
                {t('cancel')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {filteredProducts.map((product) => {
          const productUrl = getProductUrl(product)
          const imageUrl = getImageUrl(product)
          
          return (
            <div key={product.id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex gap-4">
                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt={product.title}
                    className="w-24 h-24 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h2 className="text-lg font-semibold">{product.title_bn || product.title}</h2>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-blue-600 text-sm"
                      >
                        {t('edit')}
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 text-sm"
                      >
                        {t('delete')}
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-2">
                    <p className="text-blue-600 font-bold">৳{product.discount_price || product.price}</p>
                    {product.discount_price && (
                      <p className="text-gray-400 line-through">৳{product.price}</p>
                    )}
                    <p className="text-sm text-gray-600">Stock: {product.stock}</p>
                    {product.is_published ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Published</span>
                    ) : (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">Draft</span>
                    )}
                  </div>

                  {product.is_published && productUrl && (
                    <div className="mt-2 p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={productUrl}
                          readOnly
                          className="flex-1 px-2 py-1 text-xs border rounded bg-white"
                        />
                        <button
                          onClick={() => copyProductUrl(product)}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-xs"
                        >
                          Copy URL
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Share this URL for Facebook ads
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
        {filteredProducts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {searchTerm || filterPublished !== 'all' 
              ? 'No products match your filters.' 
              : 'No products yet.'}
          </div>
        )}
      </div>
    </Layout>
  )
}

export default Products
