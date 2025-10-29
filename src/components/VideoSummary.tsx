import React from 'react'

interface VideoSummaryProps {
  videoSummary: string
  loadingSummary: boolean
}

const VideoSummary: React.FC<VideoSummaryProps> = ({ 
  videoSummary, 
  loadingSummary
}) => {
  return (
    <div className="bg-gray-800/50 border border-gray-600/30 backdrop-blur-sm p-5 h-[600px] flex flex-col">
      <h2 className="text-sm font-medium text-white mb-5 pb-3 border-b border-gray-500/50 flex-shrink-0">
        Resumen del Video
      </h2>
      
      <div className="flex-1 overflow-hidden">
        {loadingSummary ? (
          <div className="text-center py-8 h-full flex items-center justify-center">
            <div>
              <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              <div className="text-gray-400 text-sm">Cargando resumen...</div>
            </div>
          </div>
        ) : (
          <div 
            className="text-gray-300 text-sm leading-relaxed h-full overflow-y-auto pr-2 custom-scrollbar"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#1f2937 #000000'
            }}
          >
            {videoSummary || 'No hay resumen disponible'}
          </div>
        )}
      </div>
    </div>
  )
}

export default VideoSummary
