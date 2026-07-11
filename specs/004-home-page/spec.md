# Feature Specification: Home Page — Phong Vu Storefront Redesign

**Feature Branch**: `004-home-page`

**Created**: 2026-07-12

**Status**: Draft

**Input**: User description: "Implement the home page based on the Stitch design (Titanium Blue theme) from `tmp/stitch_quickreply_ai_shopping_assistant_home/`. Replace the current storefront page with a premium tech retail home page featuring hero banners, category navigation, featured product cards with AI branding, and the existing chat widget."

## Clarifications

### Session 2026-07-12

- Q: How should the Titanium Blue tokens coexist with the existing dashboard tokens? → A: Separate scopes — home page uses Titanium Blue tokens, dashboard keeps its existing tokens. Both coexist in globals.css.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Hero Section with Promotional Banners (Priority: P1)

As a visitor, I want to see a prominent hero section with promotional banners when I land on the home page, so that I'm immediately aware of current deals and the AI-powered shopping experience.

**Why this priority**: The hero section is the first thing users see. It establishes brand identity and drives engagement with promotions.

**Independent Test**: Navigate to `/`, see a bento-grid hero with a main AI promotion banner and two side cards (Flash Sale, Back to School).

**Acceptance Scenarios**:

1. **Given** the visitor opens the home page, **When** the page loads, **Then** a hero section displays with a main banner (gradient background, "Thế Hệ AI Sức Mạnh Mới" headline, description, "Mua Ngay" CTA button) and two side promo cards.
2. **Given** the visitor clicks "Mua Ngay", **When** the button is clicked, **Then** the page navigates to the products section (or a placeholder action for MVP).
3. **Given** the visitor hovers over a side promo card, **When** the hover occurs, **Then** the card shows a subtle shadow elevation and the icon scales up.

---

### User Story 2 — Category Navigation (Priority: P1)

As a visitor, I want to browse product categories via a horizontal icon bar, so that I can quickly find the type of product I'm looking for.

**Why this priority**: Category navigation is a core e-commerce UX pattern. Users expect it near the top of the page.

**Independent Test**: See a horizontally scrollable row of category icons (Laptop, Apple, PC, Components, Monitor, Accessories, Network). Click a category to filter.

**Acceptance Scenarios**:

1. **Given** the visitor views the category section, **When** the page loads, **Then** 7 category icons are displayed in a horizontal scrollable row with labels: Laptop, Apple, PC, Linh Kiện, Màn Hình, Phụ Kiện, Thiết Bị Mạng.
2. **Given** the visitor clicks a category icon, **When** the click occurs, **Then** the category is visually selected (highlighted state) and the product section filters to that category (or shows a "coming soon" state for MVP).

---

### User Story 3 — Featured Product Cards (Priority: P1)

As a visitor, I want to see featured products with specs, prices, discount badges, and an "Add to Cart" button, so that I can evaluate and purchase products directly.

**Why this priority**: Product cards are the primary conversion element. They drive the shopping experience.

**Independent Test**: See a grid of 5 laptop product cards with images, spec labels (CPU, GPU, RAM), prices (original + discounted), and "Thêm vào giỏ" buttons.

**Acceptance Scenarios**:

1. **Given** the visitor views the featured products section, **When** the page loads, **Then** a grid of product cards is displayed with: product image, name, specs (in monospace font), current price (red), original price (strikethrough), discount badge, and "Thêm vào giỏ" button.
2. **Given** the visitor hovers over a product card, **When** the hover occurs, **Then** the card elevates with a shadow, the image scales slightly, and the "Thêm vào giỏ" button changes from muted to primary color.
3. **Given** the visitor clicks "Thêm vào giỏ", **When** the button is clicked, **Then** the product is added to the Zustand cart store and the cart count in the header updates.
4. **Given** the visitor clicks a brand filter (Asus, Acer, Lenovo), **When** the filter is clicked, **Then** the product grid filters to show only products from that brand.

---

### User Story 4 — Sticky Navigation Header (Priority: P2)

As a visitor, I want a sticky top navigation bar with logo, search, nav links, and cart icon, so that I can navigate the site from any scroll position.

**Why this priority**: Sticky nav is a standard e-commerce pattern. It provides persistent access to search and cart.

**Independent Test**: Scroll down the page and verify the nav bar stays fixed at the top with glassmorphism effect.

**Acceptance Scenarios**:

1. **Given** the visitor scrolls down the page, **When** scrolling occurs, **Then** the navigation bar remains fixed at the top with a glassmorphism background (backdrop blur + semi-transparent white).
2. **Given** the visitor types in the search bar, **When** they submit a query, **Then** the search action is triggered (placeholder for MVP — no search results page yet).
3. **Given** the visitor has items in the cart, **When** they view the nav bar, **Then** the cart icon shows the item count badge.

---

### User Story 5 — Footer with Site Links (Priority: P3)

As a visitor, I want a footer with company info, policy links, and contact details, so that I can find important information about the store.

**Why this priority**: Footer is a standard trust-building element. Lower priority since it's at the bottom of the page.

**Independent Test**: Scroll to the bottom and see a 4-column footer with logo, about links, policy links, and contact info.

**Acceptance Scenarios**:

1. **Given** the visitor scrolls to the bottom, **When** the footer is visible, **Then** four columns are displayed: company logo + description, "Về Phong Vũ" links, "Chính sách" links, and "Liên hệ" contact info.

---

### Edge Cases

- What happens when there are no products to display? → Show an empty state message: "Sản phẩm đang được cập nhật."
- What happens on mobile viewport? → Hero section stacks vertically, product grid becomes 2 columns, category bar scrolls horizontally, nav links collapse.
- What happens when a product image fails to load? → Show a fallback product icon.

## Technical Implementation Flow *(mandatory)*

- **Step 1 (Trigger)**: Visitor navigates to `/` (home page).
- **Step 2 (Page Load)**: Next.js Server Component renders the page shell (nav, hero, categories, footer). Product data is fetched server-side or statically.
- **Step 3 (Interactivity)**: Client components handle hover effects, cart interactions, brand filtering, and the chat widget toggle.

## UI/UX Impact & Streamable React Components *(mandatory)*

- **Component**: `TopNavBar` — sticky glassmorphism header with logo, search bar, nav links, cart icon with count badge.
- **Component**: `HeroSection` — bento grid with main gradient banner + 2 side promo cards.
- **Component**: `CategoryBar` — horizontally scrollable category icon row with hover/active states.
- **Component**: `ProductCard` — product image, name, specs (monospace), price (discount + original), discount badge, "Add to Cart" button with hover elevation.
- **Component**: `Footer` — 4-column layout with logo, links, contact info.
- **Layout**: Max-width 1280px, `surface-blue` background, 24px gutters, 8px base spacing unit. Fonts: Hanken Grotesk (headlines), Inter (body), JetBrains Mono (specs).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a hero section with a main promotional banner and two side promo cards on the home page.
- **FR-002**: System MUST display a horizontally scrollable category navigation bar with 7 product categories.
- **FR-003**: System MUST display a grid of featured product cards with images, specs, prices, discount badges, and "Add to Cart" buttons.
- **FR-004**: System MUST allow visitors to add products to the cart from product cards, syncing with the existing Zustand cart store.
- **FR-005**: System MUST display a sticky navigation header with glassmorphism effect, logo, search bar, nav links, and cart icon with count badge.
- **FR-006**: System MUST display a footer with company info, policy links, and contact details.
- **FR-007**: System MUST use the Titanium Blue design system tokens (colors, typography, spacing, elevation) from the provided design reference.
- **FR-008**: System MUST support brand filtering on the product grid (Asus, Acer, Lenovo).
- **FR-009**: System MUST handle responsive layouts: desktop (1280px, 5-col grid), tablet (3-col), mobile (2-col).
- **FR-010**: System MUST render the existing AI chat widget (floating action button) on the home page.

### Key Entities

- **Product**: Displayed on home page. Attributes: name, brand, price, originalPrice, discount, image, specs (cpu, gpu, ram, storage), category.
- **Category**: Navigation item. Attributes: name, icon (Material Symbol), slug.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Home page loads and displays all sections in under 3 seconds.
- **SC-002**: Product cards render correctly with all fields (image, specs, price, discount) on desktop and mobile.
- **SC-003**: "Add to Cart" button on product cards adds items to the cart store and updates the cart count badge.
- **SC-004**: Navigation bar remains sticky with glassmorphism effect while scrolling.
- **SC-005**: Category bar is horizontally scrollable on all viewport sizes.

## Assumptions

- Product data is static/hardcoded for the MVP demo (no database query for products on the home page).
- The hero banner images use placeholder URLs from the design reference.
- Brand filtering is client-side only (filters the hardcoded product list).
- The existing chat widget (`ChatWidget.tsx`) is reused on the home page without modification.
- The Titanium Blue design tokens are scoped to the home page only — they do not replace or conflict with the existing dashboard tokens in `globals.css`. Both token sets coexist.
