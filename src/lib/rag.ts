/**
 * RAG (Retrieval-Augmented Generation) helper
 *
 * Builds vector embeddings for a user query using the OpenAI Embeddings API,
 * then retrieves semantically similar documents from Supabase via pgvector RPC.
 */

import OpenAI from 'openai'
import { supabase, type Document } from './supabase'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  ...(process.env.OPENAI_BASE_URL && { baseURL: process.env.OPENAI_BASE_URL }),
})

const EMBEDDING_MODEL = 'text-embedding-3-small'
const EMBEDDING_DIMENSIONS = 1536

// ─── Embedding ─────────────────────────────────────────────────────────────

/**
 * Generate an embedding vector for the given text using OpenAI.
 * Dimensions: 1536 (text-embedding-3-small default).
 */
export async function embedText(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text.trim().slice(0, 8191), // max token safety
    dimensions: EMBEDDING_DIMENSIONS,
  })

  return response.data[0].embedding
}

// ─── Retrieval helpers ─────────────────────────────────────────────────────

export interface RAGQueryOptions {
  /** Minimum cosine similarity score to include a result (0–1) */
  matchThreshold?: number
  /** Maximum number of results to return */
  matchCount?: number
  /** Optional category filter */
  category?: Document['category']
}

/**
 * Retrieve semantically similar documents from Supabase.
 * Optionally filter by category (e.g., 'warranty', 'policy', 'faq').
 */
export async function queryDocuments(
  query: string,
  options: RAGQueryOptions = {},
): Promise<Document[]> {
  if (!supabase) return []

  const { matchThreshold = 0.4, matchCount = 5, category } = options

  const embedding = await embedText(query)

  const { data, error } = await supabase.rpc('match_documents', {
    query_embedding: embedding,
    match_threshold: matchThreshold,
    match_count: matchCount,
    filter_category: category ?? null,
  })

  if (error) {
    console.error('[RAG] queryDocuments error:', error.message)
    throw new Error(`Failed to query documents: ${error.message}`)
  }

  return (data as Document[]) ?? []
}

// ─── Context serializer ─────────────────────────────────────────────────────

export interface RAGContext {
  documents: Document[]
}

/**
 * Retrieve relevant documents for a user query.
 * Used to pre-populate the LLM system prompt with relevant context.
 */
export async function retrieveContext(query: string): Promise<RAGContext> {
  const documents = await queryDocuments(query, { matchCount: 8 }).catch((e) => {
    console.warn('[RAG] document retrieval failed:', e.message)
    return [] as Document[]
  })

  return { documents }
}

/**
 * Serialize RAG context into a human-readable string block for injection
 * into the system prompt.
 */
export function formatContextForPrompt(ctx: RAGContext): string {
  if (ctx.documents.length === 0) {
    return 'Không tìm thấy thông tin liên quan.'
  }

  const parts: string[] = ['## Thông tin liên quan từ cơ sở dữ liệu']

  ctx.documents.forEach((doc) => {
    parts.push(`\n### ${doc.title} [${doc.category}]`)
    parts.push(doc.content)
  })

  return parts.join('\n')
}
