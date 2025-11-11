import React, { useMemo, useEffect } from 'react'

interface VideoPlayerProps {
  currentVideo: string | null
  videoRef: React.RefObject<HTMLVideoElement>
  onTimeUpdate: (e: React.SyntheticEvent<HTMLVideoElement>) => void
  subtitles: Array<{start: number, end: number, text: string}>
  startTime?: number
}

const VideoPlayer: React.FC<VideoPlayerProps> = React.memo(({ 
  currentVideo, 
  videoRef, 
  onTimeUpdate,
  subtitles,
  startTime = 0
}) => {
  // Detectar si es una URL de YouTube
  const isYouTubeVideo = currentVideo && (
    currentVideo.includes('youtube.com') || 
    currentVideo.includes('youtu.be') ||
    currentVideo.includes('youtube.com/embed')
  )
  
  // Extraer ID de YouTube de diferentes formatos de URL
  const getYouTubeEmbedUrl = (url: string): string => {
    let videoId = ''
    
    // Formato: https://www.youtube.com/watch?v=VIDEO_ID
    const watchMatch = url.match(/[?&]v=([^&]+)/)
    if (watchMatch) {
      videoId = watchMatch[1]
    }
    
    // Formato: https://youtu.be/VIDEO_ID
    const shortMatch = url.match(/youtu\.be\/([^?]+)/)
    if (shortMatch) {
      videoId = shortMatch[1]
    }
    
    // Formato: https://www.youtube.com/embed/VIDEO_ID
    const embedMatch = url.match(/embed\/([^?]+)/)
    if (embedMatch) {
      videoId = embedMatch[1]
    }
    
    // Si ya es una URL de embed, devolverla tal cual
    if (url.includes('youtube.com/embed')) {
      return url.includes('?') ? `${url}&start=${Math.floor(startTime)}` : `${url}?start=${Math.floor(startTime)}`
    }
    
    // Construir URL de embed con parámetros
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&start=${Math.floor(startTime)}&cc_load_policy=1`
    }
    
    return url
  }
  
  // Generar VTT dinámicamente
  const generateVTT = (subtitles: Array<{start: number, end: number, text: string}>) => {
    if (subtitles.length === 0) return ''
    
    let vtt = 'WEBVTT\n\n'
    subtitles.forEach((sub, index) => {
      const startTime = formatTimeForVTT(sub.start)
      const endTime = formatTimeForVTT(sub.end)
      vtt += `${index + 1}\n${startTime} --> ${endTime}\n${sub.text}\n\n`
    })
    return vtt
  }

  const formatTimeForVTT = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    const ms = Math.floor((seconds % 1) * 1000)
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`
  }

  const vttUrl = useMemo(() => {
    if (subtitles.length === 0) return null
    
    const vttContent = generateVTT(subtitles)
    const vttBlob = new Blob([vttContent], { type: 'text/vtt' })
    return URL.createObjectURL(vttBlob)
  }, [subtitles])

  // Limpiar URLs de objeto cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (vttUrl) {
        URL.revokeObjectURL(vttUrl)
      }
    }
  }, [vttUrl])

  return (
    <div className="relative lg:col-span-2">
      {currentVideo ? (
        isYouTubeVideo ? (
          // Video de YouTube embebido con tiempo específico y subtítulos encendidos
          <iframe
            className="w-full h-[600px] rounded-lg shadow-2xl"
            src={getYouTubeEmbedUrl(currentVideo)}
            title="Video de YouTube"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video
            ref={videoRef}
            controls
            className="w-full h-[600px] object-cover shadow-2xl"
            src={currentVideo}
            onTimeUpdate={onTimeUpdate}
            preload="metadata"
            playsInline
          >
            {vttUrl && (
              <track
                kind="captions"
                src={vttUrl}
                srcLang="es"
                label="Español"
                default
              />
            )}
            Tu navegador no soporta el elemento de video.
          </video>
        )
      ) : (
        <div className="w-full h-[600px] bg-gray-800/50 backdrop-blur-sm flex items-center justify-center text-gray-400 text-sm border border-gray-600/30">
          Selecciona un video
        </div>
      )}
    </div>
  )
})

VideoPlayer.displayName = 'VideoPlayer'

export default VideoPlayer