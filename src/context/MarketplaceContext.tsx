'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Ebook, Genre } from '@/types'
import { v4 as uuidv4 } from 'uuid'

interface MarketplaceContextType {
  ebooks: Ebook[]
  addEbook: (ebook: Omit<Ebook, 'id' | 'uploadedAt'>) => void
  getEbooksByGenre: (genre: Genre) => Ebook[]
  getFreeEbooks: () => Ebook[]
  searchEbooks: (query: string) => Ebook[]
  selectedGenre: Genre | 'all'
  setSelectedGenre: (genre: Genre | 'all') => void
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined)

export function MarketplaceProvider({ children }: { children: ReactNode }) {
  const [ebooks, setEbooks] = useState<Ebook[]>([])
  const [selectedGenre, setSelectedGenre] = useState<Genre | 'all'>('all')

  useEffect(() => {
    // Load from localStorage if available
    const stored = localStorage.getItem('ebooks')
    if (stored) {
      setEbooks(JSON.parse(stored))
    }
  }, [])

  useEffect(() => {
    // Save to localStorage
    localStorage.setItem('ebooks', JSON.stringify(ebooks))
  }, [ebooks])

  const addEbook = (ebook: Omit<Ebook, 'id' | 'uploadedAt'>) => {
    const newEbook: Ebook = {
      ...ebook,
      id: uuidv4(),
      uploadedAt: Date.now()
    }
    setEbooks(prev => [newEbook, ...prev])
  }

  const getEbooksByGenre = (genre: Genre) => {
    return ebooks.filter(book => book.genre === genre)
  }

  const getFreeEbooks = () => {
    return ebooks.filter(book => book.isFree)
  }

  const searchEbooks = (query: string) => {
    const lowercaseQuery = query.toLowerCase()
    return ebooks.filter(
      book =>
        book.title.toLowerCase().includes(lowercaseQuery) ||
        book.author.toLowerCase().includes(lowercaseQuery) ||
        book.description.toLowerCase().includes(lowercaseQuery)
    )
  }

  return (
    <MarketplaceContext.Provider
      value={{
        ebooks,
        addEbook,
        getEbooksByGenre,
        getFreeEbooks,
        searchEbooks,
        selectedGenre,
        setSelectedGenre
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  )
}

export function useMarketplace() {
  const context = useContext(MarketplaceContext)
  if (!context) {
    throw new Error('useMarketplace must be used within MarketplaceProvider')
  }
  return context
}
