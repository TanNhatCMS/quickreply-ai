# Implementation Plan: Phong Vu AI Agent (Skills & Tools)

**Branch**: `003-phongvu-ai-agent` | **Date**: 2026-07-12 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/003-phongvu-ai-agent/spec.md`

## Summary

Triển khai AI Agent cho chatbot Phong Vũ sử dụng Vercel AI SDK v7 với MCP tools. Agent query sản phẩm realtime từ Phong Vũ Discovery API (qua MCP server), và policy/warranty/FAQ từ RAG knowledge base (Supabase pgvector). Chat trace lưu vào Supabase cho dashboard.

## Technical Context

**Language/Version**: TypeScript 5.8+ / Next.js 14+ (App Router)

**Primary Dependencies**: Vercel AI SDK v7 (`ai`, `@ai-sdk/openai`, `@ai-sdk/react`, `@ai-sdk/mcp`), `@modelcontextprotocol/sdk`, `zustand`, `@supabase/supabase-js`

**Storage**: Supabase PostgreSQL (chat_sessions, chat_messages, documents tables), LocalStorage (Zustand cart)

**Testing**: Vitest (unit), Playwright (E2E)

**Target Platform**: Vercel Serverless/Edge Runtime, modern web browsers

**Project Type**: Next.js Web Application

**Performance Goals**: AI Response first-token < 3s, cart state sync < 200ms

**Constraints**: MCP server spawned as subprocess per request, Supabase free tier limits

**Scale/Scope**: Solo Hackathon MVP

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Principle I: Solo MVP Focus**: ✅ Core value = product discovery + action calling. CRM/omnichannel mocked.
- **Principle II: Architectural stack**: ✅ Next.js App Router, TypeScript, Tailwind CSS, Vercel.
- **Principle III: Streamable UI**: ✅ Vercel AI SDK v7 tool calling + streamable UI. MCP tools for product data.
- **Principle IV: Fail-Safe UX**: ✅ `maxRetries: 3` on streamText. MCP tools have 10s timeout. Supabase trace is fire-and-forget.
- **Principle V: Definition of Ready**: ✅ Spec has User Alignment, Technical Flow, UI/UX impact, Success Metrics.

## Project Structure

### Documentation (this feature)

```text
specs/003-phongvu-ai-agent/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── contracts/           # Phase 1 output
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── api/chat/route.ts   # MCP client + LLM streaming + trace
│   ├── layout.tsx
│   └── page.tsx            # Storefront mockup
├── components/
│   ├── ChatWidget.tsx      # useChat + tool rendering
│   └── CartDrawer.tsx      # Slide-out cart
├── store/
│   └── useCartStore.ts     # Zustand + localStorage persist
└── lib/
    ├── supabase.ts         # Supabase client + types
    └── session.ts          # Anonymous session UUID

phongvu-ai-agent/           # Git submodule
├── mcp-server/             # MCP server (Phong Vũ Discovery API)
│   └── index.js
└── skills/                 # Agent skills (reference only)
```

**Structure Decision**: MCP server lives in submodule `phongvu-ai-agent/mcp-server/`. Route.ts spawns it as subprocess via `StdioClientTransport`. No local product database needed.

## Complexity Tracking

No constitution violations. All principles satisfied.
