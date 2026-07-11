# QuickReply AI — Conversational Sales Agent

AI chat widget embedded in a mockup Phong Vũ hardware storefront. Uses RAG (Retrieval-Augmented Generation) over Supabase Postgres + pgvector to answer questions about hardware specs, promotions, and warranty policies, with interactive product card streaming via Vercel AI SDK tool calling.

## Tech Stack

- **Framework**: Next.js 14+ (App Router), React 19, TypeScript
- **AI**: Vercel AI SDK v7 (`ai`, `@ai-sdk/openai`, `@ai-sdk/react`)
- **State**: Zustand with `persist` middleware (localStorage)
- **Database**: Supabase Postgres + pgvector (vector similarity search)
- **Testing**: Vitest (unit), Playwright (E2E)
- **Deployment**: Vercel Serverless/Edge runtime

## Prerequisites

- Node.js v18+
- pnpm
- Supabase account (or local Supabase CLI)
- OpenAI API key

## Setup

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Configure environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   Edit `.env.local` with your credentials:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   OPENAI_API_KEY=your_openai_api_key
   ```

3. **Initialize database**

   Option A — Supabase CLI (recommended for GitHub integration branching):
   ```bash
   npx supabase init        # if not already done
   npx supabase db push      # apply migrations from supabase/migrations/
   npx supabase db seed      # seed RAG data from supabase/seed.sql
   ```

   Option B — Supabase SQL Editor:
   ```bash
   # 1. Create tables with pgvector
   # Copy and execute supabase/migrations/20260711000000_initial_schema.sql

   # 2. Insert RAG knowledge base data
   # Copy and execute supabase/seed.sql
   ```

4. **Start development server**
   ```bash
   pnpm dev
   ```

5. **Open** [http://localhost:3000](http://localhost:3000)

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start Next.js dev server |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm test` | Run unit tests (Vitest) |
| `pnpm lint` | Run ESLint |

## Project Structure

```
src/
├── app/
│   ├── api/chat/route.ts   # LLM streaming, RAG retrieval, tool calling
│   ├── layout.tsx           # Root layout with Vietnamese metadata
│   └── page.tsx             # Mockup Phong Vũ storefront
├── components/
│   ├── CartDrawer.tsx       # Slide-out shopping cart
│   ├── ChatWidget.tsx       # Expandable AI chat panel
│   └── ProductCard.tsx      # Streamed into chat via tool calls
├── store/
│   └── useCartStore.ts      # Zustand store, persist to localStorage
└── lib/
    ├── supabase.ts          # Supabase client + type definitions
    ├── rag.ts               # pgvector semantic search queries
    └── session.ts           # Anonymous session UUID helper
```

## Architecture

- **RAG flow**: User query → OpenAI embedding → pgvector RPC → context injected into system prompt → streamed LLM response
- **Tool calling**: LLM calls `queryProducts`, `queryPromotions`, `queryWarranty` (server-side) and `addToCart` (client-side)
- **Cart sync**: Client-side Zustand store persisted to `localStorage`, broadcast via custom DOM events
- **Sessions**: Anonymous UUID in `localStorage` (key `qr_session_id`), no auth for MVP

## Key Design Decisions

See `specs/001-quickreply-ai/research.md` for full rationale.

- Cart state: client-side Zustand + localStorage (not server-persisted) — chosen for low latency MVP
- Vector search: Supabase Postgres + pgvector — chosen over Pinecone (fewer moving parts)
- LLM failures: silent retry ×3 via `maxRetries`, then generic user-facing error
- Rate limiting: deferred to Vercel platform defaults for MVP
