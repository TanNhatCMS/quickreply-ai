# Tasks: Home Page — Phong Vu Storefront Redesign

**Input**: Design documents from `/specs/004-home-page/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, etc.)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Design tokens, fonts, product data

- [x] T001 Add Titanium Blue @theme tokens to src/app/globals.css — add a scoped `.theme-titanium` class with all Titanium Blue design tokens (colors: primary #003b73, secondary #006688, secondary-container #00c1fd, promo-orange #FFA940, alert-red #E63946, success-green #2ECC71, surface-blue #F0F5FA; font families: Hanken Grotesk, JetBrains Mono; font sizes: headline-xl, headline-lg, title-md, label-spec, price-major; spacing: gutter, margin-edge, stack-sm/md/lg). Keep existing dashboard tokens untouched.
- [x] T002 Add Hanken Grotesk and JetBrains Mono font links to src/app/layout.tsx — add Google Fonts CDN links with display=swap alongside existing Inter font.
- [x] T003 Create hardcoded product data in src/lib/products.ts — export `homeProducts: HomeProduct[]` with 5 laptop products from the design reference (Lenovo LOQ, Acer Aspire Go, HP 14, HP Victus, MSI Modern). Include id, name, brand, category, price, originalPrice, discount, image, specs (cpu, gpu, ram, storage). Also export `homeCategories: HomeCategory[]` with 7 categories (Laptop, Apple, PC, Linh Kiện, Màn Hình, Phụ Kiện, Thiết Bị Mạng) and Material Symbol icons.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared components that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Create TopNavBar component in src/components/home/TopNavBar.tsx — 'use client'. Sticky header with glassmorphism (backdrop-blur-md bg-surface-bright/70). Logo image, search input (rounded-full, hidden on mobile), nav links (Build PC, Promotions, Installment, News, Contact — hidden on mobile), cart icon with count badge from useCartStore. Max-width 1280px container.
- [x] T005 Create HomeFooter component in src/components/home/HomeFooter.tsx — Server Component. 4-column grid: logo + copyright, "Về Phong Vũ" links, "Chính sách" links, "Liên hệ" with hotline + email. Uses Hanken Grotesk for headings, Material Symbols icons. Responsive: 2-col on mobile, 4-col on desktop.

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 — Hero Section (Priority: P1)

**Goal**: Visitor sees a bento-grid hero with AI promo banner and side promo cards

**Independent Test**: Navigate to `/`, see main banner with gradient, headline, CTA, and 2 side cards.

### Implementation for User Story 1

- [x] T006 [US1] Create HeroSection component in src/components/home/HeroSection.tsx — Server Component. Bento grid (md:grid-cols-4): main banner (md:col-span-3) with gradient from primary-container to secondary, badge "Khuyến Mãi Độc Quyền", headline "Thế Hệ AI Sức Mạnh Mới", description, "Mua Ngay" button (white bg, rounded-full). Side column (md:col-span-1) with 2 flex-1 cards: Flash Sale (promo-orange icon, "Giảm đến 50%") and Tựu Trường (primary icon, "Ưu đãi sinh viên"). Hover effects via group-hover.

---

## Phase 4: User Story 2 — Category Navigation (Priority: P1)

**Goal**: Visitor sees a horizontally scrollable category icon bar

**Independent Test**: See 7 category icons in a scrollable row. Click one to highlight.

### Implementation for User Story 2

- [x] T007 [US2] Create CategoryBar component in src/components/home/CategoryBar.tsx — 'use client'. Horizontal flex row with overflow-x-auto and hide-scrollbar. Each category: 16x16 rounded-2xl icon container with Material Symbol, label below. Uses homeCategories data. Hover: border-primary/50, icon text-primary. Active state via useState (selected category). Pass selected category to parent via onCategoryChange callback.

---

## Phase 5: User Story 3 — Featured Product Cards (Priority: P1)

**Goal**: Visitor sees product grid with specs, prices, discounts, and can add to cart

**Independent Test**: See 5 product cards. Click "Thêm vào giỏ" to add to cart. Click brand filter to filter.

### Implementation for User Story 3

- [x] T008 [P] [US3] Create ProductCard component in src/components/home/ProductCard.tsx — 'use client'. Props: HomeProduct. Card with: discount badge (absolute top-left, promo-orange), image area (h-40, bg-surface, object-contain, hover scale-105), product name (line-clamp-2), specs box (bg-surface-container-low, JetBrains Mono font-label-spec), price (font-price-major text-error), original price (line-through text-outline), "Thêm vào giỏ" button (bg-surface-variant, group-hover:bg-primary group-hover:text-white). Card hover: shadow-lg.
- [x] T009 [US3] Create ProductGrid component in src/components/home/ProductGrid.tsx — 'use client'. Section header with AI icon + "Laptop AI - Hiệu Suất Đỉnh Cao" title. Brand filter buttons (Lenovo, Acer, HP, MSI) with active state (border-primary text-primary). Grid layout: grid-cols-2 md:grid-cols-3 lg:grid-cols-5. Filters homeProducts by selected brand using useState. Renders ProductCard for each. "Thêm vào giỏ" calls useCartStore.addItem().

**Checkpoint**: Core product experience complete — visitors can browse and add to cart

---

## Phase 6: User Story 4 + 5 — Sticky Nav + Footer (Priority: P2/P3)

**Goal**: Sticky nav with glassmorphism, footer with site links

**Independent Test**: Scroll page and verify nav stays fixed. Scroll to bottom for footer.

> Note: TopNavBar (T004) and HomeFooter (T005) already implemented in Phase 2. No additional tasks needed.

**Checkpoint**: All user stories complete

---

## Phase 7: Integration & Polish

**Purpose**: Wire components into page, validate, fix issues

- [x] T010 Replace src/app/page.tsx with new home page — Server Component. Import and render: TopNavBar, HeroSection, CategoryBar (wrapped in client component for state), ProductGrid, HomeFooter, ChatWidget. Wrap content in `div.theme-titanium` for scoped tokens. Main content area: pt-28 pb-16, max-w-container-max mx-auto, space-y-stack-lg. Add `id="products"` to ProductGrid section for hero CTA anchor link.
- [x] T011 Run quickstart.md validation — execute all 6 scenarios from specs/004-home-page/quickstart.md. Verify: all sections render, product cards display correctly, add to cart works, brand filtering works, responsive layout, sticky nav. Fix any issues found.
- [x] T012 Run npx tsc --noEmit — fix any type errors introduced by home page code.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 (needs tokens, fonts)
- **Phase 3 (US1 Hero)**: Depends on Phase 2 (needs TopNavBar for layout context)
- **Phase 4 (US2 Categories)**: Depends on Phase 2
- **Phase 5 (US3 Products)**: Depends on Phase 2 + T003 (product data)
- **Phase 6 (US4+5)**: Already done in Phase 2
- **Phase 7 (Integration)**: Depends on all phases

### Parallel Opportunities

- T001 + T002 can run in parallel (different files)
- T004 + T005 can run in parallel (different files)
- T006 + T007 can run in parallel (different files, US1 + US2)
- T008 + T009 depend on each other (ProductGrid imports ProductCard) — sequential
- US1, US2, US3 can be developed in parallel after Phase 2

---

## Implementation Strategy

### MVP First (US1 + US3 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T005)
3. Complete Phase 3: Hero (T006)
4. Complete Phase 5: Products (T008-T009)
5. Complete Phase 7: Integration (T010-T012)
6. **STOP and VALIDATE**: Home page with hero + products is live

### Incremental Delivery

1. Setup + Foundational → Nav + Footer ready
2. Add Hero → Banner visible → Deploy
3. Add Categories → Full navigation → Deploy
4. Add Products → Shopping experience → Deploy (MVP!)
5. Polish → Responsive, validation → Final deploy

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story
- Each user story is independently completable and testable
- Product data is hardcoded — easy to update later
- Titanium Blue tokens scoped via `.theme-titanium` class — dashboard unaffected
