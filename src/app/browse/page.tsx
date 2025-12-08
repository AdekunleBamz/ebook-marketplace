'use client'

import Header from '@/components/Header'
import GenreSidebar from '@/components/GenreSidebar'
import EbookGrid from '@/components/EbookGrid'

export default function BrowsePage() {
  return (
    <div className="min-h-screen bg-[#0a0a14]">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2314b8a6' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Bookshelf Decorative Top Border */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-800 via-amber-600 to-amber-800 z-50" />

      <Header />
      
      <div className="flex relative">
        <GenreSidebar />
        <EbookGrid />
      </div>
    </div>
  )
}
