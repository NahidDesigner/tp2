import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Layout from '../components/Layout'
import apiClient from '../api/client'

function StoreSettings() {
  const { storeId } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    name_bn: '',
    logo: '',
    brand_color: '#007bff',
    currency: 'BDT',
    phone: '',
    whatsapp: '',
    facebook_pixel_id: '',
    default_language: 'bn'
  })

  useEffect(() => {
    if (storeId) {
      loadStore()
    }
  }, [storeId])

  const loadStore = async () => {
    try {
      const response = await apiClient.get(`/api/stores/${storeId}`)
      const store = response.data
      setFormData({
        name: store.name || '',
        name_bn: store.name_bn || '',
        logo: store.logo || '',
        brand_color: store.brand_color || '#007bff',
        currency: store.currency || 'BDT',
        phone: store.phone || '',
        whatsapp: store.whatsapp || '',
        facebook_pixel_id: store.facebook_pixel_id || '',
        default_language: store.default_language || 'bn'
      })
    } catch (error) {
      console.error('Failed to load store:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      await apiClient.put(`/api/stores/${storeId}`, formData)
      alert('Store settings saved!')
      navigate('/stores')
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to save store settings')
    }
  }

  if (loading) {
    return <Layout><div className="text-center py-8">{t('loading')}</div></Layout>
  }

  return (
    <Layout>
      <div className="mb-6">
        <button
          onClick={() => navigate('/stores')}
          className="text-blue-600 mb-4"
        >
          ← Back to Stores
        </button>
        <h1 className="text-2xl font-bold font-outfit">Store Settings</h1>
      </div>

      <form onSubmit={handleSave} className="bg-white p-6 rounded-lg shadow space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Store Name (English) *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Store Name (Bangla)</label>
          <input
            type="text"
            value={formData.name_bn}
            onChange={(e) => setFormData({ ...formData, name_bn: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Brand Color</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={formData.brand_color}
              onChange={(e) => setFormData({ ...formData, brand_color: e.target.value })}
              className="w-20 h-10 border rounded"
            />
            <input
              type="text"
              value={formData.brand_color}
              onChange={(e) => setFormData({ ...formData, brand_color: e.target.value })}
              className="flex-1 px-4 py-2 border rounded-lg"
              placeholder="#007bff"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">WhatsApp</label>
            <input
              type="tel"
              value={formData.whatsapp}
              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Facebook Pixel ID</label>
          <input
            type="text"
            value={formData.facebook_pixel_id}
            onChange={(e) => setFormData({ ...formData, facebook_pixel_id: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="1234567890"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Default Language</label>
          <select
            value={formData.default_language}
            onChange={(e) => setFormData({ ...formData, default_language: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="bn">Bangla</option>
            <option value="en">English</option>
          </select>
        </div>

        <div className="flex gap-2 pt-4">
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold">
            {t('save')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/stores')}
            className="bg-gray-200 px-6 py-2 rounded-lg"
          >
            {t('cancel')}
          </button>
        </div>
      </form>
    </Layout>
  )
}

export default StoreSettings

