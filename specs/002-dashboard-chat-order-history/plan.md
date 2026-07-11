# Implementation Plan: Admin Dashboard — Chat History & Order History

**Branch**: `002-dashboard-chat-order-history` | **Date**: 2026-07-12 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-dashboard-chat-order-history/spec.md`

## Summary

Add an admin dashboard at `/dashboard/*` with three pages: Conversations (browse/search chat history), Orders (view order history), and Overview (metric cards, funnel chart, category bars). Requires a new `orders` Supabase table, a POST `/api/orders` checkout endpoint, and dashboard UI components built with the Stitch design system tokens.

## Technical Context

**Language/Version**: TypeScript / Next.js 16 (App Router)

**Primary Dependencies**: `@supabase/supabase-js`, `zustand`, `tailwindcss`, `lucide-react`, Material Symbols Outlined (CDN)

**Storage**: PostgreSQL via Supabase (existing `chat_sessions`, `chat_messages` + new `orders` table)

**Testing**: Vitest (unit), Playwright (E2E)

**Target Platform**: Vercel Serverless / Edge Runtime, modern web browsers

**Project Type**: Next.js Web Application

**Performance Goals**: Page load < 2s for paginated tables, search results < 1s

**Constraints**: Max Vercel serverless duration (30s), Supabase anon key access (no admin service key for MVP)

**Scale/Scope**: Solo Hackathon MVP Focus — dashboard is read-only (orders always `pending`), no auth

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Principle I: Solo MVP Focus** — PASS. Dashboard is a read-only view layer. No CRM/ERP integration. Orders are mocked (always `pending`). No payment processing.
- **Principle II: Architectural stack** — PASS. Next.js App Router, Tailwind CSS, TypeScript, Supabase. No third-party infra beyond Supabase.
- **Principle III: Streamable UI** — N/A. Dashboard does not use chat streaming or tool calling. It reads existing DB tables. No violation — this is a non-chat feature.
- **Principle IV: Fail-Safe UX** — PASS. Inline error banners with Retry buttons for DB query failures. No LLM calls in dashboard.
- **Principle V: Definition of Ready** — PASS. Spec has User Alignment, Technical Flow, UI/UX Impact, and Success Metrics.

## Project Structure

### Documentation (this feature)

```text
specs/002-dashboard-chat-order-history/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── contracts/           # Phase 1 output
    └── api-orders.md
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── api/
│   │   ├── chat/route.ts       # Existing
│   │   └── orders/route.ts     # NEW — POST checkout endpoint
│   ├── dashboard/
│   │   ├── layout.tsx           # NEW — DashboardLayout (side nav + header)
│   │   ├── page.tsx             # NEW — Overview (metric cards, funnel, categories)
│   │   ├── conversations/
│   │   │   └── page.tsx         # NEW — ConversationTable
│   │   └── orders/
│   │       └── page.tsx         # NEW — OrderTable
│   ├── layout.tsx               # Existing root layout
│   └── page.tsx                 # Existing storefront
├── components/
│   ├── dashboard/               # NEW — Dashboard-specific components
│   │   ├── DashboardLayout.tsx
│   │   ├── MetricCard.tsx
│   │   ├── ConversationTable.tsx
│   │   ├── OrderTable.tsx
│   │   ├── FunnelChart.tsx
│   │   └── CategoryBarChart.tsx
│   ├── CartDrawer.tsx           # Existing
│   ├── ChatWidget.tsx           # Existing
│   └── ProductCard.tsx          # Existing
├── lib/
│   ├── supabase.ts              # Existing — add Order type
│   ├── rag.ts                   # Existing
│   └── session.ts               # Existing
└── store/
    └── useCartStore.ts           # Existing
```

**Structure Decision**: Dashboard pages under `app/dashboard/` with shared `DashboardLayout`. Dashboard components isolated in `components/dashboard/` to avoid polluting storefront components. Orders API under `app/api/orders/`.

## Complexity Tracking

> No constitution violations. Table left empty.
