# Quickstart: Home Page — Phong Vu Storefront Redesign

**Date**: 2026-07-12

## Prerequisites

- Node.js 18+
- pnpm installed
- `.env.local` with Supabase and OpenAI credentials (for chat widget)

## Setup

```bash
pnpm install
```

## Run

```bash
pnpm dev
```

Open http://localhost:3000 — the home page should display with all sections.

## Validation Scenarios

### 1. Hero Section Renders

- Navigate to `/`
- **Expected**: Bento grid hero with main gradient banner ("Thế Hệ AI Sức Mạnh Mới"), two side promo cards (Flash Sale, Back to School)
- **Verify**: Banner has "Mua Ngay" button, side cards have icons and text

### 2. Category Bar Displays

- Scroll down past the hero
- **Expected**: 7 category icons in a horizontal row (Laptop, Apple, PC, Linh Kiện, Màn Hình, Phụ Kiện, Thiết Bị Mạng)
- **Verify**: Icons are Material Symbols, labels are visible, row is horizontally scrollable on mobile

### 3. Product Grid with Cards

- Scroll to the featured products section
- **Expected**: 5 laptop product cards in a grid
- **Verify**: Each card has image, name, specs (monospace font), price (red), original price (strikethrough), discount badge, "Thêm vào giỏ" button

### 4. Add to Cart

- Click "Thêm vào giỏ" on any product card
- **Expected**: Cart count badge in nav bar updates
- **Verify**: Open CartDrawer — product appears in cart

### 5. Brand Filtering

- Click "Asus" filter button above product grid
- **Expected**: Grid filters to show only Asus products
- **Verify**: Other brands hidden, filter button highlighted

### 6. Sticky Navigation

- Scroll down the page
- **Expected**: Nav bar stays fixed at top with glassmorphism effect (backdrop blur)
- **Verify**: Logo, search bar, nav links, cart icon all visible and functional

### 7. Responsive Layout

- Resize browser to mobile width (< 640px)
- **Expected**: Hero stacks vertically, product grid 2 columns, category bar scrolls, nav links collapse
- **Verify**: All content accessible, no horizontal overflow

### 8. Chat Widget

- Click the floating AI chat button (bottom-right)
- **Expected**: Chat window expands with message area and input
- **Verify**: Existing ChatWidget functionality works

## Test Commands

```bash
# Type check
npx tsc --noEmit

# Run existing tests
pnpm test

# Lint
pnpm lint
```
