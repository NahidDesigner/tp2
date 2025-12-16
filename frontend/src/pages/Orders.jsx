import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Layout from '../components/Layout'
import apiClient from '../api/client'

function Orders() {
  const { t } = useTranslation()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      const response = await apiClient.get('/api/orders')
      setOrders(response.data)
    } catch (error) {
      console.error('Failed to load orders:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Layout><div className="text-center py-8">{t('loading')}</div></Layout>
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6 font-outfit">{t('orders')}</h1>

      <div className="grid gap-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h2 className="font-semibold">{order.order_number}</h2>
                <p className="text-sm text-gray-600">{order.customer_name}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm ${
                order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                'bg-green-100 text-green-800'
              }`}>
                {t(order.status)}
              </span>
            </div>
            <p className="text-lg font-bold text-blue-600">৳{order.total}</p>
          </div>
        ))}
        {orders.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No orders yet.
          </div>
        )}
      </div>
    </Layout>
  )
}

export default Orders

