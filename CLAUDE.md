# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

Spec-kit planning phase. No application code exists (`src/` not created). Feature artifacts live in `specs/001-quickreply-ai/spec.md`, `plan.md`, `research.md`, `data-model.md` — no `tasks.md` yet, so run `/speckit-tasks` before `/speckit-implement`.

## Spec-Kit Workflow

Slash commands (`.claude/skills/speckit-*`, mirrored in `.agents/skills/speckit-*`) drive [GitHub Spec Kit](https://github.com/github/spec-kit) spec-driven development in order:

1. `/speckit-constitution` — project principles (`.specify/memory/constitution.md` is still an unfilled template — fill it in before relying on constitution gates).
2. `/speckit-specify` — write the feature spec.
3. `/speckit-clarify` — resolve ambiguities (recorded as `## Clarifications` in spec.md).
4. `/speckit-plan` — produces `plan.md`, `research.md`, `data-model.md`, `contracts/`.
5. `/speckit-tasks` — produces `tasks.md`.
6. `/speckit-analyze` / `/speckit-checklist` — cross-artifact consistency and quality gates.
7. `/speckit-implement` — executes `tasks.md`.

Active feature directory tracked in `.specify/feature.json` (currently `specs/001-quickreply-ai`). PowerShell helpers in `.specify/scripts/powershell/`: `create-new-feature.ps1`, `setup-plan.ps1`, `setup-tasks.ps1`, `check-prerequisites.ps1`.

## Feature: QuickReply AI Conversational Sales Agent

An AI chat widget embedded in a mockup storefront (branded around Phong Vu hardware) that:

- Uses **RAG** (Retrieval-Augmented Generation) over Supabase Postgres + `pgvector` to answer questions about hardware specs, promotions, and warranty policies.
- Uses **Vercel AI SDK Core** tool calling to stream interactive React components (Product Cards, "Add to Cart" triggers) directly into the chat stream.
- Syncs cart state between the chat widget and storefront via a client-side **Zustand** store persisted to `localStorage` and broadcast via custom DOM events (not a shared React context, and not server-persisted for the MVP).
- Identifies users via **anonymous session UUIDs** in cookies/localStorage (no login for MVP).
- Retries failed RAG/LLM calls up to 3 times silently before surfacing a generic error to the user.

### Planned Architecture (not yet scaffolded)

```text
src/
├── app/
│   ├── api/chat/route.ts   # LLM streaming, RAG retrieval, tool call setup (Vercel Edge/Serverless)
│   ├── layout.tsx
│   └── page.tsx            # Mockup storefront page
├── components/
│   ├── CartDrawer.tsx      # Slide-out shopping cart
│   ├── ChatWidget.tsx      # Expandable interactive chat panel
│   └── ProductCard.tsx     # Streamed into the chat via tool calls
├── store/
│   └── useCartStore.ts     # Zustand store, `persist` middleware, key `phongvu-cart-store`
└── lib/
    ├── supabase.ts         # Supabase client initializer
    └── rag.ts              # pgvector semantic search queries
```

Key architectural constraint: LLM tool-calling/RAG logic must stay in `src/lib` (library-first), independently testable without rendering the UI — see the Constitution Check in `plan.md`.

### Data Model (`specs/001-quickreply-ai/data-model.md`)

Supabase/Postgres tables with `pgvector` for RAG knowledge base and chat trace:

- `documents` — RAG knowledge base chunks from `help.phongvu.vn/llms-full.txt`. Columns: title, content, category (company/policy/warranty/payment/delivery/faq/service/legal), metadata (jsonb), embedding (vector 1536). HNSW cosine-distance index.
- `chat_sessions` — tracks each AI consultation session for dashboard tracing. Columns: user_agent, started_at, ended_at, metadata (jsonb).
- `chat_messages` — persists every message with trace metadata. Columns: session_id (FK), role (user/assistant/system/tool), content, tool_calls (jsonb), tokens_used, latency_ms, model. Indexed by `(session_id, created_at)`.

Supabase configured for GitHub integration branching — `supabase/` folder at repo root with `config.toml`, `migrations/`, `seed.sql`.

Client-side cart state (Zustand, not a DB table): `CartItem { productId, name, price, brand, quantity, image }`, exposed via `useCartStore`.

### Key Technical Decisions (see `research.md` for full rationale)

- Cart state: client-side Zustand + localStorage + custom DOM events — chosen over shared React context (no persistence) and server-persisted cart (too much latency for MVP).
- Vector search: Supabase Postgres + pgvector — chosen over Pinecone (extra provider, harder relational joins) and client-side vector search (too heavy).
- RAG: single `documents` table with `match_documents` RPC (category filter optional) — simpler than 3 separate tables.
- Rate-limiting: explicitly deferred to Vercel platform defaults for the MVP (no Redis/Upstash limiter).
- Sessions: anonymous UUID in cookie/localStorage, no auth for MVP.
- Chat trace: every message saved to DB with tokens, latency, model for dashboard replay.
- LLM/RAG failures: silent retry ×3, then generic user-facing error.

### Planned Stack

TypeScript, Next.js 14+ (App Router), React 18+, Vercel AI SDK (`ai`, `@ai-sdk/openai`, `@ai-sdk/elements`), `zustand`, `@supabase/supabase-js`, `lucide-react`. Testing: Vitest (unit/integration), Playwright (E2E). Target: Vercel Serverless/Edge runtime.

Performance targets: first-token latency < 1.5s for RAG queries; cart UI updates < 200ms; no layout shift from streamed components.

### Package Manager

Use **pnpm** for all dependency and script commands (`pnpm install`, `pnpm add`, `pnpm dev`, `pnpm build`, `pnpm test`). Do not use npm or yarn.
