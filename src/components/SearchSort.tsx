'use client'

import { Search, ArrowUpDown } from 'lucide-react'

interface SearchSortProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  sortBy: string
  onSortChange: (sort: string) => void
  resultCount: number
}

export default function SearchSort({ 
  searchQuery, 
  onSearchChange, 
  sortBy, 
  onSortChange,
  resultCount 
}: SearchSortProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      {/* Search Bar */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search books by title or author..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-[#1a1a2e] border border-teal-900/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
          >
            ✕
          </button>
        )}
      </div>

      {/* Sort Dropdown */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <ArrowUpDown size={16} />
        </div>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="pl-10 pr-8 py-3 bg-[#1a1a2e] border border-teal-900/30 rounded-lg text-white focus:outline-none focus:border-teal-500 transition-colors appearance-none cursor-pointer min-w-[160px]"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="title">Title A-Z</option>
        </select>
      </div>

      {/* Results Count */}
      <div className="flex items-center px-4 py-3 bg-teal-900/20 border border-teal-900/30 rounded-lg">
        <span className="text-sm text-gray-300">
          <span className="font-semibold text-teal-400">{resultCount}</span> books
        </span>
      </div>
    </div>
  )
}
