# Implementation Plan: Home Page — Phong Vu Storefront Redesign

**Branch**: `004-home-page` | **Date**: 2026-07-12 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-home-page/spec.md`

## Summary

Replace the current dark-themed storefront page with a premium "Titanium Blue" home page based on the Stitch design reference. The page features a glassmorphism sticky nav, bento-grid hero section, horizontal category bar, product cards with specs/prices/discounts, and a 4-column footer. Product data is hardcoded for MVP. The existing chat widget and Zustand cart store are reused.

## Technical Context

**Language/Version**: TypeScript / Next.js 16 (App Router)

**Primary Dependencies**: `tailwindcss`, `zustand`, `lucide-react`, Material Symbols Outlined (CDN), Hanken Grotesk + Inter + JetBrains Mono (Google Fonts CDN)

**Storage**: Client-side Zustand + localStorage (existing cart store)

**Testing**: Vitest

**Target Platform**: Vercel Serverless / Edge Runtime, modern web browsers

**Project Type**: Next.js Web Application

**Performance Goals**: Page load < 3s, cart add < 200ms

**Constraints**: Solo Hackathon MVP — static/hardcoded product data, no backend product API

**Scale/Scope**: Single page replacement (`/` route), ~8 new components

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Principle I: Solo MVP Focus** — PASS. Products are hardcoded, no backend integration. Chat widget reused. Cart is client-side only.
- **Principle II: Architectural stack** — PASS. Next.js App Router, Tailwind CSS, TypeScript. No third-party infra.
- **Principle III: Streamable UI** — N/A. Home page does not use chat streaming. Chat widget is reused from existing code.
- **Principle IV: Fail-Safe UX** — PASS. Empty states and image fallbacks defined. No LLM/DB calls on home page.
- **Principle V: Definition of Ready** — PASS. Spec has User Alignment, Technical Flow, UI/UX Impact, and Success Metrics.

## Project Structure

### Documentation (this feature)

```text
specs/004-home-page/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
└── quickstart.md        # Phase 1 output
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── page.tsx                  # REPLACE — new home page (Server Component shell)
│   ├── layout.tsx                # MODIFY — add Hanken Grotesk + JetBrains Mono fonts
│   └── globals.css               # MODIFY — add Titanium Blue @theme tokens (scoped)
├── components/
│   ├── home/                     # NEW — home page components
│   │   ├── TopNavBar.tsx         # Sticky glassmorphism header
│   │   ├── HeroSection.tsx       # Bento grid hero
│   │   ├── CategoryBar.tsx       # Horizontal category icons
│   │   ├── ProductCard.tsx       # Product card (home version)
│   │   ├── ProductGrid.tsx       # Product grid with brand filter
│   │   └── HomeFooter.tsx        # 4-column footer
│   ├── ChatWidget.tsx            # EXISTING — reused
│   └── CartDrawer.tsx            # EXISTING — reused
├── lib/
│   └── products.ts               # NEW — hardcoded product data
└── store/
    └── useCartStore.ts            # EXISTING — reused
```

**Structure Decision**: Home components isolated in `components/home/` to avoid polluting existing components. Product data in `lib/products.ts` as a static array. The existing `page.tsx` is replaced entirely. Titanium Blue tokens added via a scoped `@theme` block in globals.css.

## Complexity Tracking

> No constitution violations. Table left empty.

## Post-Design Constitution Re-Check

After Phase 1 design artifacts generated:

- **Principle I: Solo MVP** — PASS. Static product array in `lib/products.ts`. No backend API.
- **Principle II: Stack** — PASS. All components are Next.js App Router + Tailwind CSS + TypeScript.
- **Principle III: Streamable UI** — N/A. Chat widget reused from existing code.
- **Principle IV: Fail-Safe UX** — PASS. Empty states, image fallbacks, responsive layouts defined in quickstart.md.
- **Principle V: DoR** — PASS. All 5 artifacts complete (spec, plan, research, data-model, quickstart).
