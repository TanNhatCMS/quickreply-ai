-- ============================================================
-- QuickReply AI - Initial Schema
-- Migration: 20260711000000_initial_schema
-- ============================================================

-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================
-- 2. documents table (RAG Knowledge Base)
-- ============================================================
CREATE TABLE IF NOT EXISTS documents (
  id          uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text          NOT NULL,
  content     text          NOT NULL,
  category    text          NOT NULL CHECK (category IN (
    'company', 'policy', 'warranty', 'payment',
    'delivery', 'faq', 'service', 'legal'
  )),
  source_url  text,
  metadata    jsonb         NOT NULL DEFAULT '{}',
  embedding   vector(1536),
  created_at  timestamptz   NOT NULL DEFAULT now(),
  updated_at  timestamptz   NOT NULL DEFAULT now()
);

-- HNSW index for fast cosine-similarity search
CREATE INDEX IF NOT EXISTS documents_embedding_idx
  ON documents USING hnsw (embedding vector_cosine_ops);

-- Category index for filtered queries
CREATE INDEX IF NOT EXISTS documents_category_idx
  ON documents (category);

-- ============================================================
-- 3. chat_sessions table
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_sessions (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_agent  text,
  started_at  timestamptz NOT NULL DEFAULT now(),
  ended_at    timestamptz,
  metadata    jsonb       NOT NULL DEFAULT '{}'
);

-- ============================================================
-- 4. chat_messages table (Trace)
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  uuid        NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role        text        NOT NULL CHECK (role IN ('user', 'assistant', 'system', 'tool')),
  content     text        NOT NULL,
  tool_calls  jsonb       NOT NULL DEFAULT '[]',
  tokens_used integer     CHECK (tokens_used >= 0),
  latency_ms  integer     CHECK (latency_ms >= 0),
  model       text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Session + time index for ordered replay
CREATE INDEX IF NOT EXISTS chat_messages_session_idx
  ON chat_messages (session_id, created_at ASC);

-- ============================================================
-- 5. Row Level Security (RLS)
-- ============================================================

-- Documents: public read (RAG queries are server-side, but allow anon read for flexibility)
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on documents"
  ON documents FOR SELECT USING (true);

-- Chat sessions: anon can insert and read own sessions
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon insert on chat_sessions"
  ON chat_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon select on chat_sessions"
  ON chat_sessions FOR SELECT USING (true);

-- Chat messages: anon can insert and read
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon insert on chat_messages"
  ON chat_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon select on chat_messages"
  ON chat_messages FOR SELECT USING (true);

-- ============================================================
-- 6. Helper RPC: match_documents (vector similarity search)
-- ============================================================
CREATE OR REPLACE FUNCTION match_documents (
  query_embedding  vector(1536),
  match_threshold  float DEFAULT 0.4,
  match_count      int   DEFAULT 5,
  filter_category  text  DEFAULT NULL
)
RETURNS TABLE (
  id         uuid,
  title      text,
  content    text,
  category   text,
  metadata   jsonb,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    d.id,
    d.title,
    d.content,
    d.category,
    d.metadata,
    1 - (d.embedding <=> query_embedding) AS similarity
  FROM documents d
  WHERE d.embedding IS NOT NULL
    AND 1 - (d.embedding <=> query_embedding) > match_threshold
    AND (filter_category IS NULL OR d.category = filter_category)
  ORDER BY d.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- ============================================================
-- 7. Trigger: auto-update updated_at on documents
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
