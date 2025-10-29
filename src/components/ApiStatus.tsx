import React from 'react'

interface ApiStatusProps {
  apiOnline: boolean | null
  apiStats: any
}

const ApiStatus: React.FC<ApiStatusProps> = ({ apiOnline, apiStats }) => {
  if (apiOnline === null) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
        <span className="text-sm text-yellow-400">
          Verificando API...
        </span>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${apiOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <span className={`text-sm ${apiOnline ? 'text-green-400' : 'text-red-400'}`}>
          {apiOnline ? 'API Online' : 'API Offline'}
        </span>
      </div>
      
      {apiOnline && apiStats && (
        <div className="flex items-center space-x-4 text-xs text-gray-400">
          {apiStats.total_vectores && (
            <div className="flex items-center space-x-1">
              <span>🔢</span>
              <span>{apiStats.total_vectores} vectores</span>
            </div>
          )}
          {apiStats.dimension && (
            <div className="flex items-center space-x-1">
              <span>📐</span>
              <span>{apiStats.dimension}D</span>
            </div>
          )}
          {apiStats.modelo && (
            <div className="flex items-center space-x-1">
              <span>🤖</span>
              <span>{apiStats.modelo}</span>
            </div>
          )}
          {apiStats.index_name && (
            <div className="flex items-center space-x-1">
              <span>🗂️</span>
              <span>{apiStats.index_name}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ApiStatus
