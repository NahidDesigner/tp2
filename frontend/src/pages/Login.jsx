import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'

function Login() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { requestOTP, login } = useAuthStore()
  
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState('phone')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleRequestOTP = async () => {
    if (!phone) {
      setError('Phone number required')
      return
    }
    setLoading(true)
    setError('')
    const result = await requestOTP(phone)
    if (result.success) {
      setStep('otp')
      // In production, remove this alert
      alert(`OTP: ${result.data.otp}`)
    } else {
      setError(result.error)
    }
    setLoading(false)
  }

  const handleVerifyOTP = async () => {
    if (!otp) {
      setError('OTP required')
      return
    }
    setLoading(true)
    setError('')
    const result = await login(phone, otp)
    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.error)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <h1 className="text-3xl font-bold text-center mb-8 font-outfit">
          {t('welcome')}
        </h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {step === 'phone' ? (
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">{t('phone')}</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleRequestOTP}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? t('loading') : t('request_otp')}
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">{t('otp')}</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="000000"
                maxLength="6"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleVerifyOTP}
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 mb-2"
            >
              {loading ? t('loading') : t('verify_otp')}
            </button>
            <button
              onClick={() => setStep('phone')}
              className="w-full text-gray-600 py-2"
            >
              Change phone
            </button>
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => i18n.changeLanguage(i18n.language === 'bn' ? 'en' : 'bn')}
            className="text-sm text-gray-600"
          >
            {i18n.language === 'bn' ? 'English' : 'বাংলা'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Login

