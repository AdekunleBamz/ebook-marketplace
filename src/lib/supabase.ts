import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface EbookRecord {
  id: string
  title: string
  author: string
  description: string
  genre: string
  price: string
  chain: string
  cover_image: string
  pdf_url: string
  seller: string
  is_free: boolean
  file_size: number
  uploaded_at: string
  signature?: string
}
