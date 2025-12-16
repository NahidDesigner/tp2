import React, { useState } from 'react'

// Get API URL - try multiple sources
const getApiUrl = () => {
  // 1. Try meta tag (can be set at runtime)
  if (typeof document !== 'undefined') {
    const metaTag = document.querySelector('meta[name="api-url"]')
    if (metaTag && metaTag.content && metaTag.content !== '%VITE_API_URL%') {
      const metaUrl = metaTag.content.trim()
      if (metaUrl && (metaUrl.startsWith('http://') || metaUrl.startsWith('https://'))) {
        return metaUrl
      }
    }
  }
  
  // 2. Try build-time environment variable
  const envUrl = import.meta.env.VITE_API_URL
  if (envUrl && (envUrl.startsWith('http://') || envUrl.startsWith('https://'))) {
    return envUrl
  }
  
  // 3. In browser, try to construct backend URL from current location
  if (typeof window !== 'undefined') {
    const { protocol, host } = window.location
    
    // Coolify pattern: replace service name in subdomain
    // e.g., frontend-xxx.domain.com -> backend-xxx.domain.com
    const hostParts = host.split('.')
    if (hostParts.length >= 3) {
      // Try replacing first part with 'backend'
      const newHost = ['backend', ...hostParts.slice(1)].join('.')
      return `${protocol}//${newHost}`
    }
    
    // Fallback: same origin
    return `${protocol}//${host}`
  }
  
  // 4. Default fallback
  return 'http://localhost:8000'
}

const API_URL = getApiUrl()

// Log API URL for debugging
if (typeof window !== 'undefined') {
  console.log('API URL:', API_URL)
}

function App() {
  const [tenantId, setTenantId] = useState('')
  const [value, setValue] = useState('')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    if (!tenantId || !value) {
      setError('Tenant ID and Value are required')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_URL}/data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenantId
        },
        body: JSON.stringify({ value })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to save data')
      }

      const result = await response.json()
      setValue('')
      setError('')
      // Refresh data list
      await fetchData()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchData = async () => {
    if (!tenantId) {
      setError('Tenant ID is required')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_URL}/data`, {
        method: 'GET',
        headers: {
          'X-Tenant-ID': tenantId
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to fetch data')
      }

      const result = await response.json()
      setData(result)
      setError('')
    } catch (err) {
      setError(err.message)
      setData([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      maxWidth: '800px',
      margin: '50px auto',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>
        Coolify Multi Tenant Demo
      </h1>
      <p style={{ textAlign: 'center', color: '#666', fontSize: '12px', marginTop: '-10px', marginBottom: '20px' }}>
        API: {API_URL}
      </p>

      <div style={{
        backgroundColor: '#f5f5f5',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Tenant ID:
          </label>
          <input
            type="text"
            value={tenantId}
            onChange={(e) => setTenantId(e.target.value)}
            placeholder="Enter tenant ID"
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '16px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Value:
          </label>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Enter value to save"
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '16px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleSave}
            disabled={loading}
            style={{
              flex: 1,
              padding: '12px',
              fontSize: '16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'Saving...' : 'Save Data'}
          </button>

          <button
            onClick={fetchData}
            disabled={loading}
            style={{
              flex: 1,
              padding: '12px',
              fontSize: '16px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'Loading...' : 'Fetch Data'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          padding: '12px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          Error: {error}
        </div>
      )}

      <div>
        <h2 style={{ color: '#333', marginBottom: '15px' }}>
          Tenant Data ({data.length} records)
        </h2>
        {data.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>
            No data found. Save some data or fetch data for the tenant.
          </p>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            {data.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: '15px',
                  backgroundColor: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                  ID: {item.id}
                </div>
                <div style={{ marginBottom: '5px' }}>
                  Value: {item.value}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  Created: {new Date(item.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default App

