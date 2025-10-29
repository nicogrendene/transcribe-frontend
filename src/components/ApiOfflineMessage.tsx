import React from 'react'

const ApiOfflineMessage: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-red-400 mb-2">Servicio temporalmente no disponible</h2>
        <p className="text-gray-400 mb-4">
          Estamos experimentando problemas técnicos. Nuestro equipo está trabajando para solucionarlo.
        </p>
        <div className="text-sm text-gray-500">
          Por favor, intenta recargar la página en unos momentos
        </div>
      </div>
    </div>
  )
}

export default ApiOfflineMessage
