import React, { useEffect } from 'react'
import useStoreStore from '../store/storeStore'

function StoreSelector() {
  const { stores, currentStore, loadStores, setCurrentStore } = useStoreStore()

  useEffect(() => {
    if (stores.length === 0) {
      loadStores()
    }
  }, [stores.length, loadStores])

  if (stores.length === 0) {
    return null
  }

  if (stores.length === 1) {
    return (
      <div className="text-sm text-gray-600 px-3 py-1 bg-gray-100 rounded">
        {currentStore?.name || stores[0].name}
      </div>
    )
  }

  return (
    <select
      value={currentStore?.id || ''}
      onChange={(e) => {
        const store = stores.find(s => s.id === parseInt(e.target.value))
        if (store) setCurrentStore(store)
      }}
      className="text-sm px-3 py-1 border rounded bg-white"
    >
      {stores.map(store => (
        <option key={store.id} value={store.id}>
          {store.name}
        </option>
      ))}
    </select>
  )
}

export default StoreSelector

