# Tasks: Admin Dashboard — Chat History & Order History

**Input**: Design documents from `/specs/002-dashboard-chat-order-history/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Database migration, type definitions, Tailwind theme with Stitch design tokens

- [x] T001 Create orders table migration in supabase/migrations/20260712000000_add_orders.sql — columns: id (uuid PK), session_id (uuid FK → chat_sessions), items (jsonb), total (bigint), status (text, default 'pending'), created_at, updated_at. Add RLS policies (anon insert + select). Add indexes on created_at, status, session_id. Add auto-update trigger for updated_at.
- [x] T002 Add Order and OrderItem types to src/lib/supabase.ts — Order interface with id, session_id, items (OrderItem[]), total, status, created_at, updated_at. OrderItem with productId, name, brand, price, quantity, image.
- [x] T003 Extend Tailwind config with Stitch design tokens in tailwind.config.ts (or postcss.config.mjs globals) — add colors (primary #003b73, secondary #355f97, surface variants, error, tertiary), font sizes (display-lg, headline-md/sm, body-lg/md, label-md/sm), spacing (base 4px, xs 8px, sm 16px, md 24px, lg 40px, xl 64px), border-radius (sm, DEFAULT, md, lg, xl, full). Reference: tmp/stitch_quickreply_ai_shopping_assistant/DESIGN.md.
- [x] T004 Add Material Symbols Outlined and Inter font CDN links to src/app/layout.tsx — Google Fonts Inter (400,500,600,700) and Material Symbols Outlined.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared dashboard layout, error handling, and API helpers that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Create DashboardLayout component in src/components/dashboard/DashboardLayout.tsx — fixed side nav (256px, left) with links: Overview (/dashboard), Conversations (/dashboard/conversations), Orders (/dashboard/orders). Top header bar with page title and search input. Uses Stitch tokens. Material Symbols icons: analytics, forum, shopping_cart, dashboard, settings.
- [x] T006 Create dashboard layout route in src/app/dashboard/layout.tsx — imports DashboardLayout, wraps children. Adds Inter font class to body.
- [x] T007 Create ErrorBanner component in src/components/dashboard/ErrorBanner.tsx — inline banner with error message and Retry button. Props: message, onRetry. Red-tinted background, dismissible.
- [x] T008 Add dashboard query helpers to src/lib/dashboard.ts — functions: getConversations(page, limit, search?), getConversationDetail(sessionId), getOrders(page, limit, status?), getDashboardMetrics(). Uses existing supabase client. Returns typed results with totalCount for pagination.

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 — View Chat Conversation History (Priority: P1) 🎯 MVP

**Goal**: Admin can browse, search, and expand chat conversation history

**Independent Test**: Navigate to /dashboard/conversations, see paginated session list. Click row to expand message thread. Search by keyword.

### Implementation for User Story 1

- [x] T009 [P] [US1] Create ConversationTable component in src/components/dashboard/ConversationTable.tsx — paginated table with columns: Session ID (truncated), Started At, Ended At, Message Count, User Agent. Click row to expand detail view showing message thread (role badge, content, timestamp, tool calls). Uses offset pagination (page/limit). Empty state: "No conversations yet".
- [x] T010 [P] [US1] Create API route for conversations list in src/app/dashboard/api/conversations/route.ts — GET handler accepting query params: page (default 1), limit (default 20), search (optional). Calls getConversations() from dashboard.ts. Returns JSON with sessions array, totalCount, page, limit.
- [x] T011 [P] [US1] Create API route for conversation detail in src/app/dashboard/api/conversations/[id]/route.ts — GET handler. Calls getConversationDetail(sessionId). Returns JSON with session object and messages array ordered by created_at ASC.
- [x] T012 [US1] Create Conversations page in src/app/dashboard/conversations/page.tsx — Server Component that fetches initial data via getConversations(). Renders ConversationTable. Handles search form submission. Shows ErrorBanner on failure with Retry.

**Checkpoint**: User Story 1 complete — admin can browse and search chat history

---

## Phase 4: User Story 2 — View Order History (Priority: P2)

**Goal**: Admin can view order history; customers can checkout to create orders

**Independent Test**: Place an order via storefront checkout, then see it on /dashboard/orders with items, total, and status.

### Implementation for User Story 2

- [x] T013 [US2] Create POST /api/orders endpoint in src/app/api/orders/route.ts — accepts { sessionId?, items[] }. Validates items array non-empty, each item has productId, name, price (>=0), quantity (>=1). Computes total. Inserts into orders table. Returns 201 with { orderId, status, total }.
- [x] T014 [US2] Add checkout button to storefront in src/components/CartDrawer.tsx — "Thanh toán" button visible when cart has items. On click, calls POST /api/orders with cart items + session ID. On success, clears cart and shows confirmation toast/message. On failure, shows error.
- [x] T015 [P] [US2] Create OrderTable component in src/components/dashboard/OrderTable.tsx — paginated table with columns: Order ID (truncated), Session ID, Items (count), Total (VND formatted), Status (badge), Created At. Click row to expand item detail (name, qty, unit price). Status filter dropdown. Empty state: "No orders yet".
- [x] T016 [P] [US2] Create API route for orders list in src/app/dashboard/api/orders/route.ts — GET handler accepting query params: page, limit, status (optional filter). Returns JSON with orders array, totalCount, page, limit.
- [x] T017 [US2] Create Orders page in src/app/dashboard/orders/page.tsx — Server Component that fetches initial data. Renders OrderTable with status filter. Shows ErrorBanner on failure.

**Checkpoint**: User Story 2 complete — orders can be created and viewed

---

## Phase 5: User Story 3 — Dashboard Overview with Key Metrics (Priority: P3)

**Goal**: Admin sees key performance metrics at a glance on the Overview page

**Independent Test**: Open /dashboard, see 4 metric cards with real data, funnel chart, and category bars.

### Implementation for User Story 3

- [x] T018 [P] [US3] Create MetricCard component in src/components/dashboard/MetricCard.tsx — glass-card with icon (Material Symbol), label, value (large bold), trend badge (green/red with percentage or status text). Props: icon, label, value, trend?, trendDirection.
- [x] T019 [P] [US3] Create FunnelChart component in src/components/dashboard/FunnelChart.tsx — horizontal bar funnel with 4 steps: Chat Started, Product Click, Add to Cart, Purchase. Each bar shows label + count + percentage. Width proportional to count. Uses Stitch primary colors with decreasing opacity.
- [x] T020 [P] [US3] Create CategoryBarChart component in src/components/dashboard/CategoryBarChart.tsx — horizontal progress bars showing product categories with percentage labels. Props: categories[] with name and percentage.
- [x] T021 [P] [US3] Create API route for dashboard metrics in src/app/dashboard/api/metrics/route.ts — GET handler. Computes: totalConversations (count chat_sessions), avgResponseTimeMs (avg latency_ms from assistant messages), aiDeflectionRate (% sessions with ≤ 2 user messages), conversionRate (count orders / count sessions * 100). Returns JSON.
- [x] T022 [US3] Create Overview page in src/app/dashboard/page.tsx — Server Component fetching metrics. Renders 4 MetricCards (Total Conversations, Conversion Rate, AI Deflection Rate, Avg Response Time), FunnelChart, CategoryBarChart. Shows ErrorBanner on failure.

**Checkpoint**: All user stories complete — dashboard fully functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Error handling consistency, empty states, quickstart validation

- [x] T023 Add ErrorBanner integration to all dashboard pages — wrap data-fetching in try/catch, render ErrorBanner with Retry button that re-fetches data. Applies to: Conversations page, Orders page, Overview page.
- [x] T024 Verify empty states across all views — "No conversations yet" on empty ConversationTable, "No orders yet" on empty OrderTable, zero-value metric cards on Overview with no data.
- [x] T025 Run quickstart.md validation — execute all 5 scenarios from specs/002-dashboard-chat-order-history/quickstart.md. Fix any issues found.
- [x] T026 Run pnpm lint and npx tsc --noEmit — fix any lint or type errors introduced by dashboard code.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 (needs Order types, Tailwind config)
- **Phase 3 (US1)**: Depends on Phase 2 (needs DashboardLayout, dashboard.ts helpers)
- **Phase 4 (US2)**: Depends on Phase 2 (needs DashboardLayout, dashboard.ts helpers). T013/T014 can start after T001/T002.
- **Phase 5 (US3)**: Depends on Phase 2. Metric computations need chat_sessions + orders tables.
- **Phase 6 (Polish)**: Depends on all user stories complete

### User Story Dependencies

- **US1 (P1)**: Independent after Phase 2. Uses existing chat_sessions/chat_messages tables.
- **US2 (P2)**: Independent after Phase 2. Requires T001 (orders migration) + T002 (Order type).
- **US3 (P3)**: Depends on US1 + US2 data existing for meaningful metrics. Can build components in parallel but page needs both tables populated.

### Parallel Opportunities

- T003 + T004 can run in parallel (different files)
- T009 + T010 + T011 can run in parallel (different files, US1)
- T015 + T016 can run in parallel (different files, US2)
- T018 + T019 + T020 + T021 can run in parallel (different files, US3)
- US1 and US2 can be developed in parallel after Phase 2

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: Foundational (T005-T008)
3. Complete Phase 3: US1 — Chat History (T009-T012)
4. **STOP and VALIDATE**: Browse /dashboard/conversations, search, expand rows
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 → Test chat history browsing → Deploy/Demo (MVP!)
3. Add US2 → Test order creation + viewing → Deploy/Demo
4. Add US3 → Test metrics overview → Deploy/Demo
5. Polish → Error handling, empty states, validation → Final deploy

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story
- Each user story is independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
