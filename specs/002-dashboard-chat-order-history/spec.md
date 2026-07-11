# Feature Specification: Admin Dashboard — Chat History & Order History

**Feature Branch**: `002-dashboard-chat-order-history`

**Created**: 2026-07-12

**Status**: Draft

**Input**: User description: "Based on the Stitch design (Premium Tech Retail System), add a dashboard that lets admins view chat history and order history. The dashboard follows the design system from `tmp/stitch_quickreply_ai_shopping_assistant/` — side navigation, metric cards, data tables, and the Material Symbols + Inter typography stack."

## User Scenarios & Testing *(mandatory)*

### User Story 1 — View Chat Conversation History (Priority: P1)

As an admin, I want to browse all past AI chat conversations so that I can review customer interactions, inspect message details, and identify common questions or issues.

**Why this priority**: The existing `chat_sessions` and `chat_messages` tables already store this data — the dashboard just needs to surface it. This is the highest-value read-only view for an admin.

**Independent Test**: Navigate to the Conversations page, see a paginated list of sessions with timestamps and user-agent summaries. Click a session to expand the full message thread.

**Acceptance Scenarios**:

1. **Given** the admin opens the Conversations page, **When** the page loads, **Then** a paginated table of chat sessions is displayed with columns: Session ID, Started At, Ended At, Message Count, User Agent.
2. **Given** the admin clicks a session row, **When** the detail view opens, **Then** the full message thread is shown with role (user/assistant/system/tool), content, timestamp, and any tool calls.
3. **Given** the admin enters a keyword in the search box, **When** they submit the search, **Then** sessions whose messages contain the keyword are filtered and displayed.
4. **Given** there are more than 20 sessions, **When** the admin scrolls to the bottom, **Then** the next page of results loads (cursor-based or offset pagination).

---

### User Story 2 — View Order History (Priority: P2)

As an admin, I want to see a list of all orders placed through the storefront so that I can track purchases, order statuses, and revenue.

**Why this priority**: Order data currently lives only in the client-side Zustand cart — there is no persisted order record yet. This story requires a new `orders` table and a server-side checkout flow.

**Independent Test**: After placing an order via the storefront, navigate to the Orders page and see the order with items, total, status, and timestamp.

**Acceptance Scenarios**:

1. **Given** a customer has completed checkout, **When** the admin opens the Orders page, **Then** the order appears with Order ID, Session ID, Items (name, qty, price), Total, Status, and Created At.
2. **Given** the admin wants to find a specific order, **When** they filter by status, **Then** only matching orders are shown (status is `pending` for MVP; filter reserved for future statuses).
3. **Given** the admin clicks an order row, **When** the detail view opens, **Then** the full item list, quantities, unit prices, total, and order status (`pending`) are displayed.

---

### User Story 3 — Dashboard Overview with Key Metrics (Priority: P3)

As an admin, I want an overview dashboard that shows key performance metrics (total conversations, conversion rate, avg response time, top queried categories) so that I can monitor system health at a glance.

**Why this priority**: The Stitch design already shows this layout — metric cards, funnel chart, category bars, and live AI logs. This is a visual polish layer on top of the data from Stories 1 and 2.

**Independent Test**: Open the dashboard Overview page and see metric cards populated from real chat_sessions and orders data.

**Acceptance Scenarios**:

1. **Given** the admin opens the Overview page, **When** the page loads, **Then** four metric cards are displayed: Total Conversations, Website Conversion Rate, AI Deflection Rate, and Avg Response Time.
2. **Given** there is chat and order data, **When** the admin views the Sales Conversion Funnel, **Then** the funnel shows Chat Started → Product Click → Add to Cart → Purchase counts derived from real data.
3. **Given** the admin views the Top AI-Queried Product Categories section, **When** the page loads, **Then** a horizontal bar chart shows the top queried categories with percentage breakdowns.

---

### Edge Cases

- What happens when there are zero conversations or orders? → Display an empty state with a helpful message ("No conversations yet" / "No orders yet").
- What happens when a chat session has no messages (e.g., created but abandoned)? → Show the session in the list with "0 messages" but disable the detail view.
- What happens when the admin searches for a keyword that matches no messages? → Show "No results found" with a clear-filters action.
- What happens when order data is inconsistent (e.g., item no longer exists in catalog)? → Display the stored order data as-is; the dashboard is a read-only historical view.
- What happens when a Supabase query fails (network error, timeout)? → Show an inline error banner in the affected data table area with a "Retry" button. Do not block the entire page.

## Technical Implementation Flow *(mandatory)*

- **Step 1 (Trigger)**: Admin navigates to `/dashboard`, `/dashboard/conversations`, or `/dashboard/orders`.
- **Step 2 (API Route)**: Next.js server-side page or API route queries Supabase tables (`chat_sessions`, `chat_messages`, `orders`) with pagination, filtering, and search parameters.
- **Step 3 (Data Display)**: Server-fetched data is rendered in the dashboard layout using the Stitch design system (side nav, metric cards, data tables).
- **Step 4 (Order Creation — storefront)**: Customer clicks "Checkout" in the storefront → POST `/api/orders` with cart items → order persisted to `orders` table with initial status `pending`.

## UI/UX Impact & Streamable React Components *(mandatory)*

- **Component**: `DashboardLayout` — side navigation bar (Analytics, Overview, Conversations, Product RAG Manager, Settings) + top header bar with search and date picker.
- **Component**: `MetricCard` — glass-card with icon, label, value, and trend indicator (green/red badge).
- **Component**: `ConversationTable` — paginated data table with session list; expandable row for message thread detail.
- **Component**: `OrderTable` — paginated data table with order list; expandable row for item detail and status.
- **Component**: `FunnelChart` — horizontal bar funnel showing Chat Started → Product Click → Add to Cart → Purchase.
- **Component**: `CategoryBarChart` — horizontal progress bars showing top queried product categories.
- **Layout**: Side nav fixed left (256px), main content area with 24px gutters, max-width 1280px. Uses Material Symbols Outlined for icons, Inter font family.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a dashboard layout with a fixed side navigation and top header bar, accessible at `/dashboard`.
- **FR-002**: System MUST display a paginated list of chat sessions on the Conversations page (`/dashboard/conversations`), sourced from the `chat_sessions` table.
- **FR-003**: System MUST allow admins to expand a session row to view the full message thread from `chat_messages`, including role, content, timestamp, and tool call data.
- **FR-004**: System MUST support keyword search across chat message content.
- **FR-005**: System MUST display a paginated list of orders on the Orders page (`/dashboard/orders`), sourced from a new `orders` table.
- **FR-006**: System MUST allow filtering orders by status (pending for MVP; other statuses reserved for future use).
- **FR-007**: System MUST display the Overview page with four metric cards: Total Conversations, Conversion Rate, AI Deflection Rate, Avg Response Time. AI Deflection Rate = % of sessions where user sent ≤ 1 message after the AI's first response.
- **FR-008**: System MUST display a Sales Conversion Funnel derived from chat and order data.
- **FR-009**: System MUST display Top AI-Queried Product Categories as horizontal bar charts.
- **FR-010**: System MUST use the Stitch design system tokens (colors, typography, spacing, elevation) from the provided design reference.
- **FR-011**: System MUST handle empty states gracefully for all data views.
- **FR-012**: System MUST display an inline error banner with a "Retry" button when a data-fetching query fails, without blocking the rest of the page.

### Key Entities

- **Order**: A completed purchase. Attributes: ID, Session ID (FK to chat_sessions), Items (JSONB array of {productId, name, brand, price, quantity, image}), Total (VND), Status (always `pending` for MVP; reserved enum: pending/confirmed/shipped/completed/cancelled), Created At, Updated At.
- **ChatSession** (existing): Already tracked. Dashboard adds a read-only view layer.
- **ChatMessage** (existing): Already tracked. Dashboard adds a read-only view layer with search.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admin can load the Conversations page and see the first 20 sessions in under 2 seconds.
- **SC-002**: Admin can expand a session and see the full message thread without a page reload.
- **SC-003**: Admin can search chat messages by keyword and see filtered results in under 1 second.
- **SC-004**: Admin can load the Orders page and see the first 20 orders in under 2 seconds.
- **SC-005**: Dashboard Overview metric cards display real data derived from actual chat and order records.

## Clarifications

### Session 2026-07-12

- Q: How should orders be created in the system? → A: Add a POST `/api/orders` endpoint called by a "Checkout" button in the storefront; order is saved to Supabase.
- Q: How should order status transitions work? → A: Status is always `pending` for MVP — no transitions; dashboard is read-only.
- Q: How should "AI Deflection Rate" be calculated? → A: % of sessions where user sent ≤ 1 message after the AI's first response (proxy for "resolved without human escalation").
- Q: How should dashboard access be controlled for the MVP? → A: No auth — dashboard is a public route at `/dashboard/*`; rely on URL obscurity for MVP.
- Q: How should the dashboard handle data-fetching errors? → A: Inline error banner with "Retry" button in the table area.

## Assumptions

- The dashboard is public at `/dashboard/*` — no authentication for MVP. Access is controlled by URL obscurity only.
- Order data requires a new Supabase `orders` table and a server-side checkout API endpoint; the current client-side-only cart does not persist orders.
- The Stitch design (`tmp/stitch_quickreply_ai_shopping_assistant/`) provides the visual reference; implementation uses Tailwind CSS + the design tokens defined in `DESIGN.md`.
- Existing `chat_sessions` and `chat_messages` tables are sufficient for the Conversations page — no schema changes needed for chat history.
- Pagination uses offset-based (page/limit) for simplicity in the MVP; cursor-based pagination is a future optimization.
