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

// Sample ebooks for demo
const sampleEbooks: Ebook[] = [
  {
    id: '1',
    title: 'The Art of DeFi',
    author: 'Satoshi Builder',
    description: 'A comprehensive guide to decentralized finance protocols and yield strategies.',
    genre: 'crypto',
    price: '9.99',
    chain: 'base',
    coverImage: '/covers/defi.jpg',
    pdfUrl: '/sample.pdf',
    uploadedAt: Date.now() - 86400000 * 5,
    seller: '0x1234...5678',
    isFree: false,
    fileSize: 2500000
  },
  {
    id: '2',
    title: 'Journey Through the Alps',
    author: 'Maria Wanderer',
    description: 'An exciting adventure through the most breathtaking mountain trails.',
    genre: 'travel',
    price: '14.99',
    chain: 'celo',
    coverImage: '/covers/alps.jpg',
    pdfUrl: '/sample.pdf',
    uploadedAt: Date.now() - 86400000 * 3,
    seller: '0x2345...6789',
    isFree: false,
    fileSize: 5000000
  },
  {
    id: '3',
    title: 'Building Wealth on Chain',
    author: 'Alex Trader',
    description: 'Learn financial strategies for the blockchain era.',
    genre: 'finance',
    price: '19.99',
    chain: 'base',
    coverImage: '/covers/wealth.jpg',
    pdfUrl: '/sample.pdf',
    uploadedAt: Date.now() - 86400000 * 2,
    seller: '0x3456...7890',
    isFree: false,
    fileSize: 3200000
  },
  {
    id: '4',
    title: 'The Lost Kingdom',
    author: 'Emma Storyteller',
    description: 'A thrilling fiction about a hidden kingdom and ancient secrets.',
    genre: 'fiction',
    price: '0',
    chain: 'base',
    coverImage: '/covers/kingdom.jpg',
    pdfUrl: '/sample.pdf',
    uploadedAt: Date.now() - 86400000,
    seller: '0x4567...8901',
    isFree: true,
    fileSize: 1800000
  },
  {
    id: '5',
    title: 'Blockchain for Beginners',
    author: 'Tech Guru',
    description: 'Start your blockchain journey with this beginner-friendly guide.',
    genre: 'technology',
    price: '0',
    chain: 'celo',
    coverImage: '/covers/blockchain.jpg',
    pdfUrl: '/sample.pdf',
    uploadedAt: Date.now() - 86400000 * 7,
    seller: '0x5678...9012',
    isFree: true,
    fileSize: 4100000
  },
  {
    id: '6',
    title: 'Mystery at Midnight',
    author: 'Detective Dan',
    description: 'A gripping mystery that will keep you on the edge of your seat.',
    genre: 'mystery',
    price: '12.99',
    chain: 'base',
    coverImage: '/covers/mystery.jpg',
    pdfUrl: '/sample.pdf',
    uploadedAt: Date.now() - 86400000 * 4,
    seller: '0x6789...0123',
    isFree: false,
    fileSize: 2900000
  }
]

export function MarketplaceProvider({ children }: { children: ReactNode }) {
  const [ebooks, setEbooks] = useState<Ebook[]>(sampleEbooks)
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
