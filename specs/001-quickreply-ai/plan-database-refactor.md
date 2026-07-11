# Plan: Database Schema Refactor & Supabase GitHub Integration

## Context

Current schema has 4 tables (`products`, `promotions`, `warranty_policies`, `chat_messages`) designed as a product catalog. This is wrong — the database should serve as:

1. **RAG knowledge base** — sourced from `https://help.phongvu.vn/llms-full.txt` (company info, policies, warranty, delivery, payment, FAQ)
2. **Chat trace history** — per-session consultation logs for dashboard tracing

Additionally, Supabase needs to be configured for GitHub integration branching with proper `supabase/` folder structure.

## New Database Schema

### Table: `documents` (RAG Knowledge Base)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PRIMARY KEY, DEFAULT gen_random_uuid() | Document ID |
| `title` | `text` | NOT NULL | Section/chunk title |
| `content` | `text` | NOT NULL | Full text content of the chunk |
| `category` | `text` | NOT NULL | Category: `company`, `policy`, `warranty`, `payment`, `delivery`, `faq`, `service`, `legal` |
| `source_url` | `text` | NULL | Original source URL |
| `metadata` | `jsonb` | DEFAULT '{}' | Additional metadata (brand, tags, etc.) |
| `embedding` | `vector(1536)` | NULL | OpenAI text-embedding-3-small vector |
| `created_at` | `timestamptz` | DEFAULT now() | Record creation |
| `updated_at` | `timestamptz` | DEFAULT now() | Last update |

Index: HNSW on `embedding` for cosine similarity search.

### Table: `chat_sessions`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PRIMARY KEY, DEFAULT gen_random_uuid() | Session ID |
| `user_agent` | `text` | NULL | Browser user agent |
| `started_at` | `timestamptz` | DEFAULT now() | Session start |
| `ended_at` | `timestamptz` | NULL | Session end |
| `metadata` | `jsonb` | DEFAULT '{}' | Extra context (referrer, page URL, etc.) |

### Table: `chat_messages` (Trace)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PRIMARY KEY, DEFAULT gen_random_uuid() | Message ID |
| `session_id` | `uuid` | NOT NULL, FK → chat_sessions.id | Parent session |
| `role` | `text` | NOT NULL, CHECK (role IN ('user', 'assistant', 'system', 'tool')) | Message role |
| `content` | `text` | NOT NULL | Message text |
| `tool_calls` | `jsonb` | DEFAULT '[]' | Tool invocations (name, args, result) |
| `tokens_used` | `integer` | NULL | Token count for this message |
| `latency_ms` | `integer` | NULL | Response latency in ms |
| `model` | `text` | NULL | Model used (e.g., gpt-4o-mini) |
| `created_at` | `timestamptz` | DEFAULT now() | Message timestamp |

Index: `(session_id, created_at ASC)` for ordered session replay.

## Files to Change

### 1. Supabase folder (NEW)
- `supabase/config.toml` — Supabase CLI config for GitHub integration
- `supabase/migrations/20260711000000_initial_schema.sql` — all 3 tables + indexes + RLS + RPC functions
- `supabase/seed.sql` — chunked RAG data from llms-full.txt

### 2. Specs (UPDATE)
- `specs/001-quickreply-ai/data-model.md` — rewrite with new schema
- `specs/001-quickreply-ai/schema.sql` — rewrite (or redirect to supabase/migrations/)
- `specs/001-quickreply-ai/seed.sql` — rewrite (or redirect to supabase/seed.sql)
- `specs/001-quickreply-ai/spec.md` — update Key Entities section
- `specs/001-quickreply-ai/plan.md` — update Data Model section

### 3. Source code (UPDATE)
- `src/lib/supabase.ts` — update types: `Document`, `ChatSession`, `ChatMessage` (remove `Product`, `Promotion`, `WarrantyPolicy`)
- `src/lib/rag.ts` — update to query `documents` table with single `match_documents` RPC (remove `queryProducts`, `queryPromotions`, `queryWarrantyPolicies`)
- `src/app/api/chat/route.ts` — update tools: `searchKnowledge` replaces 3 separate tools; save chat trace to DB
- `src/components/ChatWidget.tsx` — update tool rendering for new tool names
- `src/components/ProductCard.tsx` — may need update if product data comes from documents table now

### 4. Tests (UPDATE)
- `tests/rag.test.ts` — update for new `formatContextForPrompt` shape
- `tests/useCartStore.test.ts` — no change needed (cart is client-side)

### 5. Docs (UPDATE)
- `CLAUDE.md` — update data model section
- `README.md` — update database setup instructions

## Supabase GitHub Integration Config

Create `supabase/config.toml` with:
```toml
[project]
id = "quickreply-ai"

[db]
port = 54322
major_version = 15

[api]
enabled = true
port = 54321
schemas = ["public", "graphql_public"]
extra_search_path = ["public", "extensions"]
max_rows = 1000

[auth]
enabled = true
site_url = "http://localhost:3000"
```

Working directory for GitHub integration: `.` (repo root, since `supabase/` is at root).

## Execution Order

1. Create `supabase/` folder structure (config.toml, migrations/, seed.sql)
2. Update `data-model.md`, `schema.sql`, `seed.sql` in specs/
3. Update `src/lib/supabase.ts` (types)
4. Update `src/lib/rag.ts` (single `match_documents` RPC)
5. Update `src/app/api/chat/route.ts` (new tools + trace saving)
6. Update `src/components/ChatWidget.tsx` (tool rendering)
7. Update tests
8. Update CLAUDE.md and README.md
