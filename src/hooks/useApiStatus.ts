import { useState, useEffect } from 'react'
import { checkApiHealth, getApiStats } from '../config/api'

export const useApiStatus = () => {
  const [apiOnline, setApiOnline] = useState<boolean | null>(null)
  const [apiStats, setApiStats] = useState<any>(null)

  const checkApiStatus = async () => {
    const isOnline = await checkApiHealth()
    setApiOnline(isOnline)
    
    if (isOnline) {
      // Cargar estadísticas cuando la API esté online
      const stats = await getApiStats()
      setApiStats(stats)
    } else {
      setApiStats(null)
    }
  }

  useEffect(() => {
    checkApiStatus()
  }, [])

  return {
    apiOnline,
    apiStats,
    checkApiStatus
  }
}
