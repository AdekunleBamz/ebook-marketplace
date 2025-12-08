'use client'

import { GENRES, Genre } from '@/types'
import { useMarketplace } from '@/context/MarketplaceContext'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

export default function GenreSidebar() {
  const { selectedGenre, setSelectedGenre } = useMarketplace()
  const [isExpanded, setIsExpanded] = useState(false)

  const currentGenre = selectedGenre === 'all' 
    ? { label: 'All Books', icon: '🏠' }
    : GENRES.find(g => g.value === selectedGenre) || { label: 'All Books', icon: '🏠' }

  return (
    <>
      {/* Mobile Genre Selector */}
      <div className="md:hidden w-full bg-gradient-to-r from-[#1a1a2e] to-[#0f0f1a] border-b border-teal-900/30">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-3 flex items-center justify-between text-teal-400"
        >
          <span className="flex items-center gap-2 font-semibold">
            <span>{currentGenre.icon}</span>
            <span>{currentGenre.label}</span>
          </span>
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        
        {isExpanded && (
          <div className="px-3 pb-3 grid grid-cols-3 gap-2">
            <button
              onClick={() => { setSelectedGenre('all'); setIsExpanded(false); }}
              className={`text-left px-2 py-2 rounded-lg transition-all duration-200 flex items-center gap-1 text-sm ${
                selectedGenre === 'all'
                  ? 'bg-teal-600/20 text-teal-400 border border-teal-500/50'
                  : 'text-gray-400 hover:bg-teal-900/20'
              }`}
            >
              <span>🏠</span>
              <span className="truncate">All</span>
            </button>
            
            {GENRES.map((genre) => (
              <button
                key={genre.value}
                onClick={() => { setSelectedGenre(genre.value as Genre); setIsExpanded(false); }}
                className={`text-left px-2 py-2 rounded-lg transition-all duration-200 flex items-center gap-1 text-sm ${
                  selectedGenre === genre.value
                    ? 'bg-teal-600/20 text-teal-400 border border-teal-500/50'
                    : 'text-gray-400 hover:bg-teal-900/20'
                }`}
              >
                <span>{genre.icon}</span>
                <span className="truncate">{genre.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1a] border-r border-teal-900/30 p-4 min-h-screen shrink-0">
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
    </>
  )
}
