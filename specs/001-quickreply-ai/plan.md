# Implementation Plan: QuickReply AI Conversational Sales Agent

**Branch**: `001-quickreply-ai` | **Date**: 2026-07-11 | **Spec**: [spec.md](file:///E:/source/repos/quickreply-ai/specs/001-quickreply-ai/spec.md)

**Input**: Feature specification from `/specs/001-quickreply-ai/spec.md`

## Summary

The QuickReply AI Sales Agent is an interactive chat widget embedded into a mockup storefront. The assistant queries hardware specifications, warranty policies, and active promotions using a RAG architecture with PostgreSQL/pgvector on Supabase, and uses Vercel AI SDK Core for tool calling/streaming custom React components (Product Cards, Add to Cart buttons) directly into the chat. Cart state is managed client-side using Zustand and synchronized via LocalStorage.

## Technical Context

**Language/Version**: TypeScript / Next.js 14+ (App Router), React 18+

**Primary Dependencies**: Vercel AI SDK (`ai`), `@ai-sdk/openai`, `@ai-sdk/elements`, `zustand`, `@supabase/supabase-js`, `lucide-react`

**Storage**: PostgreSQL with `pgvector` via Supabase (server-side RAG data), LocalStorage (client-side cart persistence)

**Testing**: Vitest (unit & integration), Playwright (E2E storefront/widget flow)

**Target Platform**: Vercel Serverless / Edge Runtime, modern web browsers

**Project Type**: Next.js Web Application

**Performance Goals**: First token latency < 1.5s for RAG queries, real-time client cart updates < 200ms

**Constraints**: Max Vercel serverless duration (10s on Hobby, 15s on Pro), LLM context window size

**Scale/Scope**: MVP mock storefront showcasing ASUS, Dell, Apple hardware (~100 items), warranty policies, and running promotions.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Library-First**: Handled. Core LLM tool calling, RAG parsing, and database logic will be isolated in `src/lib` to remain independent from React rendering code.
- **Local Interface / Separation of Concerns**: Handled. RAG queries and API tools can be invoked programmatically or tested locally via unit tests without rendering the UI.
- **Test-First**: Core Zustand store actions, Supabase vector search queries, and prompt template formatting will have corresponding unit and integration tests.
- **Simplicity**: No complex auth or heavy rate-limiter setup. Relying on anonymous session UUIDs and basic edge middleware defaults.

## Project Structure

### Documentation (this feature)

```text
specs/001-quickreply-ai/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
└── contracts/           # Phase 1 output (/speckit-plan command)
    └── api-chat.md      # API contract for the chat streaming endpoint
```

### Source Code (repository root)

```text
src/
├── app/                  # Next.js App Router (pages and API routes)
│   ├── api/
│   │   └── chat/
│   │       └── route.ts  # LLM streaming, RAG vector retrieval, and tool call setup
│   ├── layout.tsx
│   └── page.tsx          # Mockup storefront page
├── components/           # Storefront UI components
│   ├── CartDrawer.tsx    # Slide-out shopping cart
│   ├── ChatWidget.tsx    # Expandable interactive chat panel
│   └── ProductCard.tsx   # Custom React component injected into chat stream
├── store/
│   └── useCartStore.ts   # Zustand cart store with LocalStorage persistence
└── lib/                  # Shared backend utilities
    ├── supabase.ts       # Supabase client initializer
    └── rag.ts            # Semantic search queries using pgvector
```

**Structure Decision**: A Next.js Web Application structure was chosen to allow the API routes (Vercel serverless endpoint) and the interactive storefront layout to be developed and deployed together under a single workspace.

## Complexity Tracking

> **No violations of Core Principles detected.**
