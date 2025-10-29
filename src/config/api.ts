export const API_CONFIG = {
  BASE_URL: 'http://localhost:8000',
  ENDPOINTS: {
    HEALTH: '/health',
    STATS: '/stats',
    VIDEOS: '/videos',
    VIDEO_SUBTITLES: (id: string) => `/video/${id}/subtitles`,
    VIDEO_THUMBNAIL: (id: string) => `/video/${id}/thumbnail`,
    VIDEO_FILE: (id: string) => `/video/${id}`,
    VIDEO_SUMMARY: (id: string) => `/video/${id}/summary`,
    SEARCH: '/search'
  }
}

// Helper functions privadas para construir URLs completas
const buildApiUrl = (endpoint: string) => `${API_CONFIG.BASE_URL}${endpoint}`

// Función para limpiar el videoId y extraer solo el ID real
const cleanVideoId = (videoId: string): string => {
  if (!videoId) return ''
  
  // Si ya es un ID limpio (sin caracteres especiales de URL), devolverlo tal cual
  if (!videoId.includes('/') && !videoId.includes('?') && !videoId.includes(':')) {
    return videoId
  }
  
  // Si el videoId ya contiene una URL, extraer solo el ID
  if (videoId.includes('://')) {
    // Buscar el patrón /video/{ID}
    const match = videoId.match(/\/video\/([A-Z0-9]+)/i)
    if (match) {
      return match[1]
    }
  }
  
  // Si contiene /video/ pero no ://, extraer el ID
  if (videoId.includes('/video/')) {
    const parts = videoId.split('/video/')
    if (parts.length > 1) {
      const idPart = parts[1].split('/')[0].split('?')[0]
      return idPart
    }
  }
  
  return videoId
}

// URLs privadas (sin parámetros)
const getHealthUrl = () => buildApiUrl(API_CONFIG.ENDPOINTS.HEALTH)
const getStatsUrl = () => buildApiUrl(API_CONFIG.ENDPOINTS.STATS)
const getVideosUrl = () => buildApiUrl(API_CONFIG.ENDPOINTS.VIDEOS)
const getSearchUrl = () => buildApiUrl(API_CONFIG.ENDPOINTS.SEARCH)

// URLs privadas con parámetros (video ID)
const getVideoSubtitlesUrl = (id: string) => buildApiUrl(API_CONFIG.ENDPOINTS.VIDEO_SUBTITLES(cleanVideoId(id)))
const getVideoThumbnailUrl = (id: string) => buildApiUrl(API_CONFIG.ENDPOINTS.VIDEO_THUMBNAIL(cleanVideoId(id)))
const getVideoFileUrl = (id: string) => buildApiUrl(API_CONFIG.ENDPOINTS.VIDEO_FILE(cleanVideoId(id)))
const getVideoSummaryUrl = (id: string) => buildApiUrl(API_CONFIG.ENDPOINTS.VIDEO_SUMMARY(cleanVideoId(id)))

// Función para verificar el estado de la API
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 segundos de timeout
    
    const response = await fetch(getHealthUrl(), {
      method: 'GET',
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    return response.ok
  } catch (error) {
    return false
  }
}

// Función para obtener estadísticas de la API
export const getApiStats = async (): Promise<any> => {
  try {
    const response = await fetch(getStatsUrl())
    if (response.ok) {
      return await response.json()
    }
    return null
  } catch (error) {
    return null
  }
}

// Función para obtener lista de videos
export const getVideos = async (): Promise<any> => {
  try {
    const response = await fetch(getVideosUrl())
    if (response.ok) {
      return await response.json()
    }
    return null
  } catch (error) {
    return null
  }
}

// Función para obtener subtítulos de un video
export const getVideoSubtitles = async (videoId: string): Promise<string> => {
  const cleanId = cleanVideoId(videoId)
  try {
    const response = await fetch(getVideoSubtitlesUrl(cleanId))
    if (response.ok) {
      return await response.text()
    }
    return ''
  } catch (error) {
    return ''
  }
}

// Función para obtener resumen de un video
export const getVideoSummary = async (videoId: string): Promise<string> => {
  const cleanId = cleanVideoId(videoId)
  try {
    const response = await fetch(getVideoSummaryUrl(cleanId))
    if (response.ok) {
      return await response.text()
    }
    return ''
  } catch (error) {
    return ''
  }
}

// Función para obtener URL del archivo de video
export const getVideoFile = (videoId: string): string => {
  const cleanId = cleanVideoId(videoId)
  return getVideoFileUrl(cleanId)
}

// Función para obtener URL del thumbnail de un video
export const getVideoThumbnail = (videoId: string): string => {
  const cleanId = cleanVideoId(videoId)
  return getVideoThumbnailUrl(cleanId)
}

// Función para realizar búsqueda
export const searchVideos = async (query: string, topK: number = 3): Promise<any> => {
  try {
    const response = await fetch(getSearchUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, top_k: topK })
    })
    
    if (response.ok) {
      return await response.json()
    }
    return null
  } catch (error) {
    return null
  }
}


