import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Layout from '../components/Layout'
import apiClient from '../api/client'

function Stores() {
  const { t } = useTranslation()
  const [stores, setStores] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    subdomain: '',
    brand_color: '#007bff'
  })

  useEffect(() => {
    loadStores()
  }, [])

  const loadStores = async () => {
    try {
      const response = await apiClient.get('/api/stores')
      setStores(response.data)
    } catch (error) {
      console.error('Failed to load stores:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateStore = async (e) => {
    e.preventDefault()
    try {
      await apiClient.post('/api/stores', formData)
      setShowForm(false)
      setFormData({ name: '', subdomain: '', brand_color: '#007bff' })
      loadStores()
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to create store')
    }
  }

  if (loading) {
    return <Layout><div className="text-center py-8">{t('loading')}</div></Layout>
  }

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold font-outfit">{t('stores')}</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold"
        >
          {t('create_store')}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <form onSubmit={handleCreateStore}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">{t('store_name')}</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">{t('subdomain')}</label>
              <input
                type="text"
                value={formData.subdomain}
                onChange={(e) => setFormData({ ...formData, subdomain: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg">
                {t('save')}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-gray-200 px-4 py-2 rounded-lg">
                {t('cancel')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {stores.map((store) => (
          <div key={store.id} className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">{store.name}</h2>
            <p className="text-gray-600">{store.subdomain}.72.61.239.193.sslip.io</p>
          </div>
        ))}
        {stores.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No stores yet. Create your first store!
          </div>
        )}
      </div>
    </Layout>
  )
}

export default Stores

