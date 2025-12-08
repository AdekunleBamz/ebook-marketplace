'use client'

import Header from '@/components/Header'
import UploadForm from '@/components/UploadForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function UploadPage() {
  return (
    <div className="min-h-screen bg-[#0a0a14]">
      {/* Bookshelf Decorative Top Border */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-800 via-amber-600 to-amber-800 z-50" />

      <Header />
      
      <div className="max-w-4xl mx-auto py-8 px-4">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-teal-400 transition-colors mb-6"
        >
          <ArrowLeft size={18} />
          Back to Marketplace
        </Link>
        
        <UploadForm />
      </div>
    </div>
  )
}
