# AGENTS.md

## Package manager

**pnpm only.** Never use npm or yarn.

## Commands

| Command | What it does |
|---------|-------------|
| `pnpm dev` | Next.js dev server |
| `pnpm build` | Production build |
| `pnpm test` | Vitest (runs all `tests/**/*.test.ts`) |
| `pnpm lint` | ESLint (next lint) |

No typecheck script exists — use `npx tsc --noEmit` for a type-only check.

There is no single-test-file shortcut in package.json. Run one test file with:
```
pnpm test -- tests/rag.test.ts
```

## Required env vars

No `.env.local.example` exists. Create `.env.local` with:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
OPENAI_API_KEY=...
```
The app throws at startup if Supabase vars are missing (`src/lib/supabase.ts:6-11`). Vitest stubs these in `vitest.config.ts` so tests run without a real `.env.local`.

## Architecture

Next.js 16 App Router, React 19, TypeScript. Single-package (not a monorepo despite `pnpm-workspace.yaml` — that file only configures build allowlists).

Key source layout:
- `src/app/api/chat/route.ts` — Edge runtime, Vercel AI SDK v7 `streamText`, RAG retrieval, tool definitions
- `src/lib/rag.ts` — OpenAI embeddings + Supabase `match_documents` RPC
- `src/lib/supabase.ts` — singleton client + DB type definitions
- `src/lib/session.ts` — anonymous UUID in localStorage (`qr_session_id`)
- `src/store/useCartStore.ts` — Zustand + persist middleware, localStorage key `phongvu-cart-store`
- `src/components/` — ChatWidget, CartDrawer, ProductCard
- `supabase/` — config.toml, migrations, seed.sql (pgvector schema)

`@/*` path alias maps to `./src/*` (tsconfig + vitest both resolve it).

## Testing

- Tests live in `tests/` (not `src/`), files must match `tests/**/*.test.ts`
- Environment: `node` (not jsdom)
- Vitest defines stub env vars for `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `OPENAI_API_KEY`
- Cart store tests use `useCartStore.setState()` to reset between tests (see `beforeEach` pattern)

## Spec-kit workflow

Spec-driven development artifacts live in `specs/001-quickreply-ai/`. Active feature tracked in `.specify/feature.json`. Slash commands in `.claude/skills/speckit-*` and `.agents/skills/speckit-*` drive the workflow (constitution → specify → clarify → plan → tasks → implement). See `CLAUDE.md` for the full sequence.

## Framework quirks

- Chat route uses `runtime = 'edge'` and `maxDuration = 30`
- AI SDK v7: uses `convertToModelMessages`, `stepCountIs`, `tool()` — not the older v6 APIs
- `addToCart` tool has no server `execute()` — it's a client-side tool handled by ChatWidget via `onToolCall`
- Cart sync between chat widget and storefront uses custom DOM events (not shared React context)
- Supabase client has `persistSession: false` and `autoRefreshToken: false` (anonymous-only MVP)
- `phongvu-ai-agent/` is a git submodule — don't edit its contents directly

## Codebase status

Application code exists in `src/` with working components, API route, and tests. `CLAUDE.md` claims "no src/" — that is outdated; the actual code is the source of truth.
