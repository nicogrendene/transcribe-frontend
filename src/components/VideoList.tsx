import React, { useMemo } from 'react'
import { getVideoThumbnail } from '../config/api'
import { Video } from '../types'

interface VideoListProps {
  videos: Video[]
  selectedVideo: string | null
  loading: boolean
  onVideoSelect: (video: Video) => void
}

const VideoList: React.FC<VideoListProps> = ({ videos, selectedVideo, loading, onVideoSelect }) => {

  const formatDuration = (seconds: string) => {
    const totalSeconds = parseInt(seconds)
    const hours = Math.floor(totalSeconds / 3600)
    const mins = Math.floor((totalSeconds % 3600) / 60)
    const secs = Math.floor(totalSeconds % 60)
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Memoizar las URLs de thumbnails para evitar llamadas repetitivas
  const videoThumbnails = useMemo(() => {
    return videos.reduce((acc, video) => {
      acc[video.id] = getVideoThumbnail(video.id)
      return acc
    }, {} as Record<string, string>)
  }, [videos])

  return (
    <div className="bg-gray-800/50 border border-gray-600/30 backdrop-blur-sm p-5">
      <h2 className="text-sm font-medium text-white mb-5 pb-3 border-b border-gray-500/50">
        Videos Disponibles
      </h2>
      
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex space-x-3">
                <div className="w-40 h-24 bg-gray-700 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-700 rounded w-1/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">📹</div>
          <div className="text-gray-400 text-sm">No hay videos disponibles</div>
        </div>
      ) : (
        <div 
          className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#1f2937 #000000'
          }}
        >
          {videos.map((video) => (
            <div
              key={video.id}
              onClick={() => onVideoSelect(video)}
              className={`group cursor-pointer transition-all duration-200
                ${selectedVideo === video.id
                  ? 'bg-blue-900/20'
                  : 'hover:bg-gray-700/50'
                }`}
            >
              <div className="flex space-x-3">
                        {/* Thumbnail */}
                        <div className="relative flex-shrink-0">
                          <img 
                            src={videoThumbnails[video.id]}
                            alt={video.title}
                            className="w-40 h-24 object-cover rounded-lg"
                            onError={(e) => {
                              // Fallback a placeholder si la imagen no carga
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = `
                                  <div class="w-40 h-24 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center">
                                    <div class="text-2xl">🎥</div>
                                  </div>
                                `;
                              }
                            }}
                          />
                  {/* Duration */}
                  <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                    {formatDuration(video.duration)}
                  </div>
                  {/* Play overlay on hover */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center">
                      <div className="w-0 h-0 border-l-4 border-l-gray-800 border-y-4 border-y-transparent ml-0.5"></div>
                    </div>
                  </div>
                </div>

                {/* Video Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm text-white line-clamp-2 group-hover:text-blue-400 transition-colors">
                    {video.title}
                  </h3>
                  <div className="mt-1 text-xs text-gray-500">
                    {video.title.includes('Diego Esteve') 
                      ? 'Conferencia sobre Zero Trust y ciberseguridad'
                      : 'Video educativo'
                    }
                  </div>
                  <div className="mt-1 text-xs text-gray-400">
                    {video.source || 'Universidad de Palermo'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default VideoList
