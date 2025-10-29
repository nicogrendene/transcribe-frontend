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
  // Hack para demo: Si el video es el específico, usar YouTube embebido
  const isDemoVideo = currentVideo && currentVideo.includes('01JF8K5EJX84S5J9SYG7Y2G8ZX')
  
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
        isDemoVideo ? (
          // Hack para demo: Video de YouTube embebido con tiempo específico y subtítulos encendidos
          <iframe
            className="w-full h-[600px] rounded-lg shadow-2xl"
            src={`https://www.youtube.com/embed/ZdKU8P8swj8?autoplay=1&rel=0&modestbranding=1&start=${Math.floor(startTime)}&cc_load_policy=1`}
            title="Video Demo - Diego Esteve"
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