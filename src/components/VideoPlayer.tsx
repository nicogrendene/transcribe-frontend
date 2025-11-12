import React, { useMemo, useEffect, useState } from 'react'
import Hls from 'hls.js'

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
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [startTimeApplied, setStartTimeApplied] = useState(false)
  
  // Generar VTT dinámicamente para subtítulos
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

  // Resetear estado cuando cambia el video
  useEffect(() => {
    if (currentVideo) {
      setIsLoading(true)
      setError(null)
      setStartTimeApplied(false)
    }
  }, [currentVideo])
  
  // Resetear flag cuando cambia el startTime (para permitir re-aplicar)
  useEffect(() => {
    setStartTimeApplied(false)
  }, [startTime])

  // Configurar HLS para reproducir el video
  useEffect(() => {
    if (!currentVideo || !videoRef.current) return

    const video = videoRef.current

    // Safari tiene soporte nativo para HLS
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = currentVideo
      
      // Aplicar startTime cuando el video esté listo
      const applyStartTime = () => {
        if (startTime > 0 && !startTimeApplied && video.readyState >= 2) {
          // Asegurarse de que el video esté pausado antes de hacer seek
          video.pause()
          video.currentTime = startTime
          // NO marcar como aplicado todavía, esperar al evento seeked
        }
      }
      
      const handleLoadedMetadata = () => {
        setIsLoading(false)
        applyStartTime()
      }
      
      const handleCanPlay = () => {
        applyStartTime()
      }
      
      const handleCanPlayThrough = () => {
        applyStartTime()
        // Si no hay startTime, reproducir automáticamente
        if (startTime === 0 && video.paused) {
          video.play().catch(() => {
            // Autoplay puede fallar por políticas del navegador
          })
        }
      }
      
      const handleSeeked = () => {
        // Si el video ya está en el tiempo correcto, marcar como aplicado
        if (startTime > 0 && Math.abs(video.currentTime - startTime) < 1) {
          setStartTimeApplied(true)
          // Verificar el currentTime justo antes de reproducir (Safari a veces resetea el tiempo)
          setTimeout(() => {
            if (Math.abs(video.currentTime - startTime) > 1) {
              // El currentTime se reseteó, re-establecerlo
              video.currentTime = startTime
              // Esperar otro seeked antes de reproducir
              video.addEventListener('seeked', () => {
                if (video.paused) {
                  video.play().catch(() => {})
                }
              }, { once: true })
            } else {
              // Reproducir después del seek
              if (video.paused) {
                video.play().catch(() => {})
              }
            }
          }, 50)
        }
      }
      
      // Prevenir que el video se reproduzca automáticamente antes del seek
      const handlePlay = (e: Event) => {
        if (startTime > 0 && !startTimeApplied && video.currentTime < startTime - 1) {
          e.preventDefault()
          e.stopPropagation()
          video.pause()
          video.currentTime = startTime
          // Esperar al seeked antes de reproducir
          const seekHandler = () => {
            setStartTimeApplied(true)
            video.play().catch(() => {})
          }
          video.addEventListener('seeked', seekHandler, { once: true })
        }
      }
      
      video.addEventListener('play', handlePlay)

      video.addEventListener('loadedmetadata', handleLoadedMetadata)
      video.addEventListener('canplay', handleCanPlay)
      video.addEventListener('canplaythrough', handleCanPlayThrough)
      video.addEventListener('seeked', handleSeeked)

      // Manejar errores
      const handleError = () => {
        setIsLoading(false)
        if (video.error) {
          setError('Error al cargar el video')
        }
      }
      video.addEventListener('error', handleError)

      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata)
        video.removeEventListener('canplay', handleCanPlay)
        video.removeEventListener('canplaythrough', handleCanPlayThrough)
        video.removeEventListener('seeked', handleSeeked)
        video.removeEventListener('play', handlePlay)
        video.removeEventListener('error', handleError)
      }
    }
    // Otros navegadores usan hls.js
    else if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
      })
      
      hls.loadSource(currentVideo)
      hls.attachMedia(video)
      
      // Prevenir reproducción automática antes del seek
      const handlePlay = (e: Event) => {
        if (startTime > 0 && !startTimeApplied && video.currentTime < startTime - 1) {
          e.preventDefault()
          e.stopPropagation()
          video.pause()
          video.currentTime = startTime
          setStartTimeApplied(true)
          video.addEventListener('seeked', () => {
            video.play().catch(() => {})
          }, { once: true })
        }
      }
      
      video.addEventListener('play', handlePlay)
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false)
        // Esperar a que el video esté listo antes de aplicar startTime
        const applyStartTime = () => {
          if (startTime > 0 && !startTimeApplied && video.readyState >= 2) {
            video.pause()
            video.currentTime = startTime
          }
        }
        
        // Intentar aplicar inmediatamente si está listo
        applyStartTime()
        
        // Si no está listo, esperar a los eventos
        if (video.readyState < 2) {
          const handleCanPlay = () => {
            applyStartTime()
            video.removeEventListener('canplay', handleCanPlay)
          }
          video.addEventListener('canplay', handleCanPlay)
        }
        
        // Aplicar startTime y luego reproducir
        const playVideo = () => {
          if (startTime > 0 && !startTimeApplied) {
            // Pausar primero para evitar que se reproduzca desde el principio
            video.pause()
            video.currentTime = startTime
            setStartTimeApplied(true)
            // Esperar a que el seek termine antes de reproducir
            const handleSeeked = () => {
              // Verificar que el currentTime no se haya reseteado
              setTimeout(() => {
                if (Math.abs(video.currentTime - startTime) > 1) {
                  video.currentTime = startTime
                  video.addEventListener('seeked', () => {
                    video.play().catch(() => {})
                  }, { once: true })
                } else {
                  video.play().catch(() => {})
                }
              }, 50)
            }
            video.addEventListener('seeked', handleSeeked, { once: true })
          } else {
            video.play().catch(() => {
              // Autoplay puede fallar por políticas del navegador
            })
          }
        }
        
        // Esperar un momento para asegurar que el video esté listo
        if (video.readyState >= 2) {
          playVideo()
        } else {
          video.addEventListener('canplay', () => {
            playVideo()
          }, { once: true })
        }
      })
      
      // Si el video ya está cargado y cambió el startTime, aplicarlo inmediatamente
      if (startTime > 0 && video.readyState >= 2 && !startTimeApplied) {
        setTimeout(() => {
          if (videoRef.current && !startTimeApplied) {
            videoRef.current.currentTime = startTime
            setStartTimeApplied(true)
          }
        }, 100)
      }
      
      // Escuchar el evento seeked para confirmar que el tiempo se estableció
      const handleSeeked = () => {
        if (startTime > 0 && Math.abs(video.currentTime - startTime) < 1) {
          setStartTimeApplied(true)
        }
      }
      video.addEventListener('seeked', handleSeeked)
      
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          setIsLoading(false)
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setError('Error de red al cargar el video')
              hls.startLoad()
              break
            case Hls.ErrorTypes.MEDIA_ERROR:
              setError('Error al decodificar el video')
              hls.recoverMediaError()
              break
            default:
              setError('Error al cargar el video')
              hls.destroy()
              break
          }
        }
      })
      
      const cleanup = () => {
        hls.destroy()
        video.removeEventListener('seeked', handleSeeked)
        video.removeEventListener('play', handlePlay)
      }
      
      return cleanup
    } else {
      // Navegador no soporta HLS
      setIsLoading(false)
      setError('Tu navegador no soporta la reproducción de video HLS')
    }
  }, [currentVideo, startTime, startTimeApplied])

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
        <div className="relative w-full h-[600px] bg-black rounded-lg shadow-2xl overflow-hidden">
          {isLoading && !error && (
            <div className="absolute inset-0 bg-black z-10 flex items-center justify-center">
              <div className="text-gray-400 text-sm">Cargando video...</div>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 bg-black z-10 flex flex-col items-center justify-center p-4">
              <div className="text-red-400 text-sm mb-2">⚠️ {error}</div>
            </div>
          )}
          <video
            ref={videoRef}
            controls
            muted
            className="w-full h-full object-cover bg-black"
            onTimeUpdate={onTimeUpdate}
            onPlay={() => {
              if (videoRef.current) {
                // Si el video se está reproduciendo pero el currentTime no es el correcto, corregirlo
                if (startTime > 0 && Math.abs(videoRef.current.currentTime - startTime) > 1) {
                  videoRef.current.currentTime = startTime
                }
                videoRef.current.muted = false
              }
            }}
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
        </div>
      ) : (
        <div className="w-full h-[600px] bg-black flex items-center justify-center text-gray-400 text-sm border border-gray-600/30">
          Selecciona un video
        </div>
      )}
    </div>
  )
})

VideoPlayer.displayName = 'VideoPlayer'

export default VideoPlayer
