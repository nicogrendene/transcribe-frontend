import React, { useMemo } from 'react'
import { getVideoThumbnail } from '../config/api'
import { SearchResult } from '../types'

interface SearchResultsProps {
  results: SearchResult[]
  onResultClick: (result: SearchResult) => void
  showTitle?: boolean
}

const SearchResults: React.FC<SearchResultsProps> = ({ results, onResultClick, showTitle = true }) => {
  if (results.length === 0) return null

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Memoizar las URLs de thumbnails para evitar llamadas repetitivas
  const resultThumbnails = useMemo(() => {
    return results.reduce((acc, result) => {
      const videoId = result.video_id || result.id
      if (videoId) {
        acc[videoId] = getVideoThumbnail(videoId)
      }
      return acc
    }, {} as Record<string, string>)
  }, [results])

  return (
    <div className="space-y-4">
      {showTitle && (
        <h3 className="text-sm font-medium text-white border-b border-gray-500/50 pb-2">
          Resultados de Búsqueda
          <span className="ml-2 text-sm text-gray-400">({results.length})</span>
        </h3>
      )}
      
      <div 
        className="max-h-96 overflow-y-auto pr-2 custom-scrollbar"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#1f2937 #000000'
        }}
      >
        {results.map((result, index) => {
          console.log('SearchResult:', result)
          return (
            <div key={index}>
            <div
              onClick={() => onResultClick(result)}
              className="group cursor-pointer transition-all duration-200 hover:bg-gray-700/50 p-3"
            >
              {index > 0 && (
                <div className="border-t border-gray-600/30 -mt-3 mb-3"></div>
              )}
              <div className="flex space-x-3">
                {/* Thumbnail */}
                <div className="relative flex-shrink-0">
                  {result.id ? (
                    <img 
                      src={resultThumbnails[result.video_id || result.id]}
                      alt={result.text}
                      className="w-40 h-24 object-cover rounded-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `
                            <div class="w-40 h-24 bg-gradient-to-br from-blue-700 to-blue-800 rounded-lg flex items-center justify-center">
                              <div class="text-2xl">🎬</div>
                            </div>
                          `;
                        }
                      }}
                    />
                  ) : (
                    <div className="w-40 h-24 bg-gradient-to-br from-blue-700 to-blue-800 rounded-lg flex items-center justify-center">
                      <div className="text-2xl">🎬</div>
                    </div>
                  )}
                  {/* Start Time */}
                  <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                    {formatTime(result.start_sec)}
                  </div>
                  {/* Score badge */}
                  <div className="absolute top-1 right-1 bg-green-900/70 text-green-400 text-xs px-1.5 py-0.5 rounded">
                    {(result.score * 100).toFixed(0)}% relevancia
                  </div>
                  {/* Play overlay on hover */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center">
                      <div className="w-0 h-0 border-l-4 border-l-gray-800 border-y-4 border-y-transparent ml-0.5"></div>
                    </div>
                  </div>
                </div>

                {/* Result Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm text-white line-clamp-2 group-hover:text-blue-400 transition-colors">
                    {result.title || 'Fragmento de video'}
                  </h4>
                  <div className="mt-1 text-xs text-gray-400 line-clamp-2">
                    {result.text}
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {result.source || 'Archivo no disponible'}
                  </div>
                </div>
              </div>
            </div>
          </div>
          )
        })}
      </div>
    </div>
  )
}

export default SearchResults