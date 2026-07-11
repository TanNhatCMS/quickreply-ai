import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('Missing env variable: NEXT_PUBLIC_SUPABASE_URL')
}
if (!supabaseAnonKey) {
  throw new Error('Missing env variable: NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

/**
 * Singleton Supabase client for use in browser and Edge runtime.
 * Uses the public anon key — row-level security enforces data access.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Anonymous sessions only — no user login flows for MVP
    persistSession: false,
    autoRefreshToken: false,
  },
})

// ------------- Type helpers mirroring the DB schema ----------------

export interface Document {
  id: string
  title: string
  content: string
  category: 'company' | 'policy' | 'warranty' | 'payment' | 'delivery' | 'faq' | 'service' | 'legal'
  source_url: string | null
  metadata: Record<string, unknown>
  embedding?: number[]
  similarity?: number
  created_at: string
  updated_at: string
}

export interface ChatSession {
  id: string
  user_agent: string | null
  started_at: string
  ended_at: string | null
  metadata: Record<string, unknown>
}

export interface ChatMessage {
  id: string
  session_id: string
  role: 'user' | 'assistant' | 'system' | 'tool'
  content: string
  tool_calls: unknown[]
  tokens_used: number | null
  latency_ms: number | null
  model: string | null
  created_at: string
}
