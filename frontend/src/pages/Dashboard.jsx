import React from 'react'
import { useTranslation } from 'react-i18next'
import Layout from '../components/Layout'

function Dashboard() {
  const { t } = useTranslation()

  return (
    <Layout>
      <div>
        <h1 className="text-2xl font-bold mb-6 font-outfit">{t('welcome')}</h1>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-3xl font-bold text-blue-600">0</div>
            <div className="text-gray-600 mt-2">{t('stores')}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-3xl font-bold text-green-600">0</div>
            <div className="text-gray-600 mt-2">{t('products')}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-3xl font-bold text-purple-600">0</div>
            <div className="text-gray-600 mt-2">{t('orders')}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-3xl font-bold text-orange-600">0</div>
            <div className="text-gray-600 mt-2">Revenue</div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Dashboard

