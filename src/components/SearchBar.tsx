import React from 'react'

interface SearchBarProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  onSearch: () => void
  loadingSearch: boolean
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  searchQuery, 
  setSearchQuery, 
  onSearch, 
  loadingSearch 
}) => {
  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Buscar en todos los videos..."
        className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        onKeyPress={(e) => e.key === 'Enter' && onSearch()}
      />
      <button
        onClick={onSearch}
        disabled={loadingSearch || !searchQuery.trim()}
        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
      >
        {loadingSearch ? 'Buscando...' : 'Buscar'}
      </button>
    </div>
  )
}

export default SearchBar
