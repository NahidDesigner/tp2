import React, { useState } from 'react'
import apiClient from '../api/client'

function ImageUpload({ value, onChange, multiple = false }) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(value || [])

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    setUploading(true)
    try {
      const formData = new FormData()
      files.forEach(file => {
        formData.append('files', file)
      })

      // Don't set Content-Type header - let browser set it with boundary
      const response = await apiClient.post('/api/uploads/images', formData)

      const newUrls = response.data.files
      const updatedUrls = multiple 
        ? [...(preview || []), ...newUrls]
        : newUrls

      setPreview(updatedUrls)
      onChange(updatedUrls)
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to upload images')
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index) => {
    const updated = preview.filter((_, i) => i !== index)
    setPreview(updated)
    onChange(updated)
  }

  const getImageUrl = (url) => {
    if (!url) return ''
    if (url.startsWith('http')) return url
    const apiUrl = apiClient.defaults.baseURL || window.location.origin
    return `${apiUrl}${url}`
  }

  return (
    <div>
      <div className="mb-2">
        <label className="block text-sm font-medium mb-2">
          {multiple ? 'Product Images' : 'Product Image'}
        </label>
        <input
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={handleFileSelect}
          disabled={uploading}
          className="w-full px-4 py-2 border rounded-lg"
        />
        {uploading && <p className="text-sm text-gray-500 mt-1">Uploading...</p>}
      </div>

      {preview && preview.length > 0 && (
        <div className="grid grid-cols-4 gap-2 mt-4">
          {preview.map((url, index) => (
            <div key={index} className="relative">
              <img
                src={getImageUrl(url)}
                alt={`Preview ${index + 1}`}
                className="w-full h-24 object-cover rounded border"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ImageUpload

