'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { Ebook, Genre } from '@/types'
import { supabase } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'

interface MarketplaceContextType {
  ebooks: Ebook[]
  addEbook: (ebook: Omit<Ebook, 'id' | 'uploadedAt'>) => Promise<boolean>
  getEbooksByGenre: (genre: Genre) => Ebook[]
  getFreeEbooks: () => Ebook[]
  searchEbooks: (query: string) => Ebook[]
  selectedGenre: Genre | 'all'
  setSelectedGenre: (genre: Genre | 'all') => void
  isLoading: boolean
  refreshEbooks: () => Promise<void>
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined)

export function MarketplaceProvider({ children }: { children: ReactNode }) {
  const [ebooks, setEbooks] = useState<Ebook[]>([])
  const [selectedGenre, setSelectedGenre] = useState<Genre | 'all'>('all')
  const [isLoading, setIsLoading] = useState(true)

  const fetchEbooks = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('ebooks')
        .select('*')
        .order('uploaded_at', { ascending: false })

      if (error) {
        console.error('Error fetching ebooks:', error)
        setIsLoading(false)
        return
      }

      if (data) {
        const formattedEbooks: Ebook[] = data.map(record => ({
          id: record.id,
          title: record.title,
          author: record.author,
          description: record.description,
          genre: record.genre as Genre,
          price: record.price,
          chain: record.chain as 'base' | 'celo',
          coverImage: record.cover_image || '',
          pdfUrl: record.pdf_url,
          seller: record.seller,
          paymentWallet: record.payment_wallet || record.seller,
          isFree: record.is_free,
          fileSize: record.file_size,
          uploadedAt: new Date(record.uploaded_at).getTime()
        }))
        setEbooks(formattedEbooks)
      }
    } catch (err) {
      console.error('Failed to fetch ebooks:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEbooks()
  }, [fetchEbooks])

  useEffect(() => {
    const channel = supabase
      .channel('ebooks_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ebooks' },
        () => {
          fetchEbooks()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchEbooks])

  const addEbook = async (ebook: Omit<Ebook, 'id' | 'uploadedAt'>): Promise<boolean> => {
    const id = uuidv4()
    const uploadedAt = new Date().toISOString()

    try {
      const { error } = await supabase.from('ebooks').insert({
        id,
        title: ebook.title,
        author: ebook.author,
        description: ebook.description,
        genre: ebook.genre,
        price: ebook.price,
        chain: ebook.chain,
        cover_image: ebook.coverImage,
        pdf_url: ebook.pdfUrl,
        seller: ebook.seller,
        payment_wallet: ebook.paymentWallet || ebook.seller,
        is_free: ebook.isFree,
        file_size: ebook.fileSize,
        uploaded_at: uploadedAt
      })

      if (error) {
        console.error('Error adding ebook:', error)
        return false
      }

      const newEbook: Ebook = {
        ...ebook,
        id,
        uploadedAt: new Date(uploadedAt).getTime()
      }
      setEbooks(prev => [newEbook, ...prev])
      return true
    } catch (err) {
      console.error('Failed to add ebook:', err)
      return false
    }
  }

  const refreshEbooks = async () => {
    setIsLoading(true)
    await fetchEbooks()
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
        setSelectedGenre,
        isLoading,
        refreshEbooks
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
