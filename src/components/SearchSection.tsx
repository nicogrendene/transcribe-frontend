import React from 'react'
import SearchBar from './SearchBar'
import SearchResults from './SearchResults'
import { SearchResult } from '../types'

interface SearchSectionProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  onSearch: () => void
  loadingSearch: boolean
  searchResults: SearchResult[]
  generatedAnswer: string
  onResultClick: (result: SearchResult) => void
}

const SearchSection: React.FC<SearchSectionProps> = ({
  searchQuery,
  setSearchQuery,
  onSearch,
  loadingSearch,
  searchResults,
  generatedAnswer,
  onResultClick
}) => {
  return (
    <div className="flex justify-center px-4">
      <div className="w-full max-w-6xl bg-gray-800/50 border border-gray-600/30 backdrop-blur-sm p-5">
        <h2 className="text-sm font-medium text-white mb-5 pb-3 border-b border-gray-500/50">
          Búsqueda en Videos
        </h2>
        
        <div className="space-y-4">
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSearch={onSearch}
            loadingSearch={loadingSearch}
          />
          
          {(searchResults.length > 0 || generatedAnswer) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Respuesta generada - Izquierda */}
              {generatedAnswer && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-white border-b border-gray-500/50 pb-2">
                    Respuesta
                  </h3>
                  <div className="bg-gray-700/30 p-4 rounded border border-gray-600/20">
                    <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
                      {generatedAnswer}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Resultados de búsqueda - Derecha */}
              <div className="space-y-3">
                <SearchResults
                  results={searchResults}
                  onResultClick={onResultClick}
                />
              </div>
            </div>
          )}
          
          {searchResults.length === 0 && !generatedAnswer && searchQuery && !loadingSearch && (
            <div className="text-center text-gray-400 py-4">
              No se encontraron resultados para "{searchQuery}"
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SearchSection
