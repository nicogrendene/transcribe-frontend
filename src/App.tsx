import { useState, useEffect, useRef, useMemo } from 'react'
import VideoList from './components/VideoList'
import VideoPlayer from './components/VideoPlayer'
import VideoSummary from './components/VideoSummary'
import SearchSection from './components/SearchSection'
import ApiStatus from './components/ApiStatus'
import ApiOfflineMessage from './components/ApiOfflineMessage'
import { useApiStatus } from './hooks/useApiStatus'
import { Video, Subtitle, SearchResult } from './types'
import { parseWebVTT } from './utils/vttParser'
import { getVideos, getVideoSubtitles, getVideoSummary, getVideoFile, searchVideos } from './config/api'

function App() {
  const [videoList, setVideoList] = useState<Video[]>([])
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)
  const [subtitles, setSubtitles] = useState<Subtitle[]>([])
  const [videoSummary, setVideoSummary] = useState<string>('')
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [videoStartTime, setVideoStartTime] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [loadingSummary, setLoadingSummary] = useState(false)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [generatedAnswer, setGeneratedAnswer] = useState<string>('')
  const [loadingSearch, setLoadingSearch] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const isLoadingVideos = useRef(false)
  
  // Memoizar la URL del video para evitar re-renders innecesarios
  const currentVideoUrl = useMemo(() => {
    return selectedVideo ? getVideoFile(selectedVideo) : null
  }, [selectedVideo])
  
  // Hook personalizado para manejar el estado de la API
  const { apiOnline, apiStats } = useApiStatus()
  

  useEffect(() => {
    loadVideos()
  }, [])

  useEffect(() => {
    // Mostrar subtítulo si hay subtítulos cargados
    if (subtitles.length > 0) {
      // const activeSubtitle = subtitles.find(sub => 
      //   currentTime >= sub.start && currentTime <= sub.end
      // )
      // setCurrentSubtitle(activeSubtitle ? activeSubtitle.text : '')
    }
  }, [currentTime, subtitles])

  const loadVideos = async () => {
    if (isLoadingVideos.current) return // Evitar llamadas duplicadas
    
    isLoadingVideos.current = true
    try {
      const data = await getVideos()
      if (data) {
        setVideoList(data.videos || [])
      } else {
        setVideoList([])
      }
    } catch (error) {
      setVideoList([])
    } finally {
      setLoading(false)
      isLoadingVideos.current = false
    }
  }

  const handleVideoSelect = async (video: Video) => {
    setSelectedVideo(video.id)
    setVideoStartTime(0) // Resetear el tiempo de inicio
    
    // Cargar subtítulos y resumen en paralelo
    await Promise.all([
      loadSubtitles(video.id),
      loadSummary(video.id)
    ])
    
    // No cargar el video automáticamente - solo cuando el usuario haga clic en play
  }


  const loadSubtitles = async (videoId: string) => {
    try {
      const webvttText = await getVideoSubtitles(videoId)
      if (webvttText) {
        const parsedSubtitles = parseWebVTT(webvttText)
        setSubtitles(parsedSubtitles)
      } else {
        setSubtitles([])
      }
    } catch (error) {
      setSubtitles([])
    }
  }


  const loadSummary = async (videoId: string) => {
    setLoadingSummary(true)
    try {
      const summaryText = await getVideoSummary(videoId)
      if (summaryText) {
        setVideoSummary(summaryText || 'No hay resumen disponible')
      } else {
        setVideoSummary('No se pudo cargar el resumen')
      }
    } catch (error) {
      console.error('Error loading summary:', error)
      setVideoSummary('Error al cargar el resumen')
    } finally {
      setLoadingSummary(false)
    }
  }


  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    setLoadingSearch(true)
    try {
      const data = await searchVideos(searchQuery, 3)
      if (data) {
        // Mapear 'id' a 'video_id' para mantener compatibilidad
        const mappedResults = (data.results || []).map((result: any) => ({
          ...result,
          video_id: result.id
        }))
        setSearchResults(mappedResults)
        setGeneratedAnswer(data.generated_answer || '')
      } else {
        setSearchResults([])
        setGeneratedAnswer('')
      }
    } catch (error) {
      setSearchResults([])
      setGeneratedAnswer('')
    } finally {
      setLoadingSearch(false)
    }
  }

  const handleResultClick = async (result: SearchResult) => {
    if (result.video_id && result.video_id !== selectedVideo) {
      const video = videoList.find(v => v.id === result.video_id)
      if (video) {
        await handleVideoSelect(video)
      }
    }
    
    // Actualizar el tiempo de inicio para el video de YouTube
    if (result.start_sec !== undefined) {
      setVideoStartTime(result.start_sec)
    }
    
    // Para videos normales, usar la lógica existente
    if (videoRef.current && result.start_sec !== undefined) {
      videoRef.current.currentTime = result.start_sec
      videoRef.current.play()
    }
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header estilo YouTube Dark */}
          <header className="bg-black/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-10">
        <div className="max-w-full mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src="/logo-up.png" 
                alt="Universidad de Palermo" 
                className="w-12 h-12 object-contain filter-none drop-shadow-sm"
                style={{ 
                  imageRendering: '-webkit-optimize-contrast'
                }}
              />
              <div className="flex items-center space-x-3">
                <h1 className="text-xl font-medium text-white">
                  Universidad de Palermo
                </h1>
                <div className="w-px h-6 bg-gray-600"></div>
                <span className="text-sm text-gray-300 font-medium">
                  Consulta videos
                </span>
              </div>
            </div>
            <ApiStatus apiOnline={apiOnline} apiStats={apiStats} />
          </div>
        </div>
      </header>

      <main className="max-w-full mx-auto px-6 py-6">
        {apiOnline === false ? (
          <ApiOfflineMessage />
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
              <VideoList
                videos={videoList}
                selectedVideo={selectedVideo}
                loading={loading}
                onVideoSelect={handleVideoSelect}
              />

              <VideoPlayer
                currentVideo={currentVideoUrl}
                videoRef={videoRef}
                onTimeUpdate={(e) => {
                  const video = e.target as HTMLVideoElement
                  setCurrentTime(video.currentTime)
                }}
                subtitles={subtitles}
                startTime={videoStartTime}
              />

              <VideoSummary
                videoSummary={videoSummary}
                loadingSummary={loadingSummary}
              />
            </div>

            <SearchSection
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onSearch={handleSearch}
              loadingSearch={loadingSearch}
              searchResults={searchResults}
              generatedAnswer={generatedAnswer}
              onResultClick={handleResultClick}
            />
          </>
        )}
      </main>
    </div>
  )
}

export default App
