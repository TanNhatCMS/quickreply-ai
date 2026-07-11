# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

This repository is currently in the **spec-kit planning phase** — no application source code exists yet (`src/` has not been created). Only feature specs, research, and a data model live under `specs/001-quickreply-ai/`. Before writing implementation code, check whether `tasks.md` exists in that directory; if not, the feature needs to go through `/speckit-tasks` before `/speckit-implement`.

## Spec-Kit Workflow

This project uses [GitHub Spec Kit](https://github.com/github/spec-kit) (Speckit) for spec-driven development. Slash commands (available via `.claude/skills/speckit-*` and mirrored in `.agents/skills/speckit-*`) drive the pipeline in order:

1. `/speckit-constitution` — define/update project principles (`.specify/memory/constitution.md` is still an unfilled template — fill it in before relying on constitution gates).
2. `/speckit-specify` — write the feature spec (`specs/<feature>/spec.md`).
3. `/speckit-clarify` — resolve ambiguities (recorded as a `## Clarifications` section in spec.md).
4. `/speckit-plan` — produce `plan.md`, `research.md`, `data-model.md`, and `contracts/` under `specs/<feature>/`.
5. `/speckit-tasks` — break the plan into `tasks.md`.
6. `/speckit-analyze` / `/speckit-checklist` — cross-artifact consistency checks and quality checklists.
7. `/speckit-implement` — execute tasks.md against the codebase.

Feature working directory is tracked in `.specify/feature.json` (currently `specs/001-quickreply-ai`). PowerShell helper scripts for the workflow live in `.specify/scripts/powershell/` (e.g. `create-new-feature.ps1`, `setup-plan.ps1`, `setup-tasks.ps1`, `check-prerequisites.ps1`).

## Feature: QuickReply AI Conversational Sales Agent

Source of truth: `specs/001-quickreply-ai/spec.md`, `plan.md`, `research.md`, `data-model.md`.

An AI chat widget embedded in a mockup storefront (branded around Phong Vu hardware) that:

- Uses **RAG** (Retrieval-Augmented Generation) over Supabase Postgres + `pgvector` to answer questions about hardware specs, promotions, and warranty policies.
- Uses **Vercel AI SDK Core** tool calling to stream interactive React components (Product Cards, "Add to Cart" triggers) directly into the chat stream.
- Syncs cart state between the chat widget and storefront via a client-side **Zustand** store persisted to `localStorage` and broadcast via custom DOM events (not a shared React context, and not server-persisted for the MVP).
- Identifies users via **anonymous session UUIDs** in cookies/localStorage (no login for MVP).
- Retries failed RAG/LLM calls up to 3 times silently before surfacing a generic error to the user.

### Planned Architecture (per plan.md — not yet scaffolded)

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

Supabase/Postgres tables, each with a `vector(1536)` `embedding` column and an HNSW cosine-distance index for semantic search:

- `products` — name, brand, price, `specifications` (jsonb), stock, embedding.
- `promotions` — title, description, discount_percentage, start/end date, embedding.
- `warranty_policies` — brand (unique), policy_details, duration_months, embedding.
- `chat_messages` — session_id, role (`user`/`assistant`), content, tool_calls (jsonb), indexed by `(session_id, created_at)`.

Client-side cart state (Zustand, not a DB table): `CartItem { productId, name, price, brand, quantity, image }`, exposed via `useCartStore` with `addItem`, `removeItem`, `updateQuantity`, `clearCart`, `toggleDrawer`.

### Key Technical Decisions (see `research.md` for full rationale)

- Cart state: client-side Zustand + localStorage + custom DOM events — chosen over shared React context (no persistence) and server-persisted cart (too much latency for MVP).
- Vector search: Supabase Postgres + pgvector — chosen over Pinecone (extra provider, harder relational joins) and client-side vector search (too heavy).
- Rate-limiting: explicitly deferred to Vercel platform defaults for the MVP (no Redis/Upstash limiter).
- Sessions: anonymous UUID in cookie/localStorage, no auth for MVP.
- LLM/RAG failures: silent retry ×3, then generic user-facing error.

### Planned Stack

TypeScript, Next.js 14+ (App Router), React 18+, Vercel AI SDK (`ai`, `@ai-sdk/openai`, `@ai-sdk/elements`), `zustand`, `@supabase/supabase-js`, `lucide-react`. Testing: Vitest (unit/integration), Playwright (E2E). Target: Vercel Serverless/Edge runtime.

Performance targets: first-token latency < 1.5s for RAG queries; cart UI updates < 200ms; no layout shift from streamed components.
