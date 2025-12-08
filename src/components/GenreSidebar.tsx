'use client'

import { GENRES, Genre } from '@/types'
import { useMarketplace } from '@/context/MarketplaceContext'

export default function GenreSidebar() {
  const { selectedGenre, setSelectedGenre } = useMarketplace()

  return (
    <aside className="w-64 bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1a] border-r border-teal-900/30 p-4 min-h-screen">
      <h2 className="text-lg font-bold text-teal-400 mb-4 flex items-center gap-2">
        📚 Categories
      </h2>
      
      <nav className="space-y-1">
        <button
          onClick={() => setSelectedGenre('all')}
          className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
            selectedGenre === 'all'
              ? 'bg-teal-600/20 text-teal-400 border border-teal-500/50'
              : 'text-gray-400 hover:bg-teal-900/20 hover:text-gray-200'
          }`}
        >
          <span>🏠</span>
          <span>All Books</span>
        </button>
        
        {GENRES.map((genre) => (
          <button
            key={genre.value}
            onClick={() => setSelectedGenre(genre.value as Genre)}
            className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
              selectedGenre === genre.value
                ? 'bg-teal-600/20 text-teal-400 border border-teal-500/50'
                : 'text-gray-400 hover:bg-teal-900/20 hover:text-gray-200'
            }`}
          >
            <span>{genre.icon}</span>
            <span>{genre.label}</span>
          </button>
        ))}
      </nav>

      {/* Decorative Book Stack */}
      <div className="mt-8 p-4 bg-gradient-to-br from-amber-900/20 to-teal-900/20 rounded-lg border border-amber-800/30">
        <div className="text-center">
          <div className="text-4xl mb-2">📖</div>
          <p className="text-xs text-gray-400">
            Discover knowledge.<br />
            Support authors.<br />
            Build your library.
          </p>
        </div>
      </div>
    </aside>
  )
}
