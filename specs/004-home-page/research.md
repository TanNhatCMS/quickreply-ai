# Research: Home Page — Phong Vu Storefront Redesign

**Date**: 2026-07-12

## 1. Tailwind v4 CSS Custom Property Scoping

**Decision**: Use a `[data-theme="titanium"]` attribute selector on the `<body>` or a wrapper `<div>` to scope Titanium Blue tokens. The existing dashboard tokens remain in `:root`.

**Rationale**: Tailwind v4 uses CSS custom properties in `globals.css`. To avoid conflicts between the dashboard's Stitch tokens and the home page's Titanium Blue tokens, we scope the new tokens under a `[data-theme="titanium"]` selector. The home page's root element gets this attribute; the dashboard does not.

**Implementation**:
```css
@theme [data-theme="titanium"] {
  --color-primary: #003b73;
  --color-secondary: #006688;
  /* ... all Titanium Blue tokens ... */
}
```

**Alternatives considered**:
- CSS Modules: rejected — breaks Tailwind utility workflow
- Separate globals file: rejected — adds build complexity
- Inline styles: rejected — no Tailwind integration

## 2. Font Loading Strategy

**Decision**: Load Hanken Grotesk and JetBrains Mono via Google Fonts CDN `<link>` tags in `layout.tsx`. Use `display=swap` for FOUT control.

**Rationale**: The app already loads Inter and Material Symbols via CDN. Adding two more font families is acceptable for a demo/MVP. `font-display: swap` ensures text remains visible during font load.

**Performance impact**: ~50KB additional font payload. Acceptable for the 3s page load target.

**Alternatives considered**:
- Self-host fonts: rejected — adds build complexity for MVP
- `@fontsource` packages: rejected — larger bundle for unused weights
- Load on demand: rejected — fonts are needed above the fold

## 3. Product Data Structure

**Decision**: Static TypeScript array in `src/lib/products.ts` with typed `Product` interface.

**Rationale**: MVP uses hardcoded data. A typed array ensures type safety and is easy to replace with API calls later.

**Schema**:
```typescript
interface Product {
  id: string
  name: string
  brand: string
  price: number
  originalPrice: number
  image: string
  specs: { cpu: string; gpu: string; ram: string; storage: string }
  category: string
  discountBadge?: string
}
```

## 4. Component Architecture

**Decision**: Server Component shell (`page.tsx`) with client components for interactive parts.

**Rationale**: Follows Next.js App Router conventions. The hero, categories, and footer are static — they can be server-rendered. Product grid needs client-side brand filtering and cart interactions.

**Component breakdown**:
- `TopNavBar` → Client (cart badge, mobile menu toggle)
- `HeroSection` → Server (static content)
- `CategoryBar` → Client (scroll, active state)
- `ProductCard` → Client (hover effects, add to cart)
- `ProductGrid` → Client (brand filtering)
- `HomeFooter` → Server (static content)

## 5. Material Symbols Loading

**Decision**: Reuse the existing Material Symbols Outlined CDN link already in `layout.tsx`.

**Rationale**: The design uses the same icon set (Material Symbols Outlined) that's already loaded for the dashboard. No additional loading needed.

## 6. Mobile Responsiveness

**Decision**: Tailwind responsive breakpoints (`sm:`, `md:`, `lg:`). Hero stacks vertically on mobile, product grid goes 2-col on mobile / 3-col on tablet / 5-col on desktop.

**Rationale**: Standard Tailwind responsive patterns. The design reference shows clear mobile/tablet/desktop layouts.
