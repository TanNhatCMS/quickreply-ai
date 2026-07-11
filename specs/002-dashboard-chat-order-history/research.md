# Research: Dashboard Architecture Decisions

## 1. Dashboard Data Fetching Strategy

### Decision
Use Next.js Server Components for initial page load (server-side Supabase queries), with client-side `fetch()` for interactive operations (search, pagination, expand-row detail).

### Rationale
- Server Components render the initial table on the server, sending pre-fetched HTML — fast first paint (< 2s target).
- Client-side `fetch()` for search/pagination avoids full page reloads while keeping the API simple.
- Supabase anon key is safe to use in Server Components (it's already exposed via `NEXT_PUBLIC_` prefix).

### Alternatives Considered
- **Full client-side fetching (React Query / SWR)**: Rejected — adds loading spinners on initial load, slower first paint.
- **Server Actions only**: Rejected — Server Actions don't support streaming responses or easy error boundary patterns for tables.
- **tRPC**: Overkill for 2-3 read endpoints in a solo MVP.

---

## 2. Order Creation Flow

### Decision
POST `/api/orders` — a Next.js API route that receives cart items from the storefront checkout button, validates them, and inserts into the `orders` table.

### Rationale
- Follows the existing pattern (`/api/chat` is also an API route).
- Keeps the storefront cart client-side (Zustand) — only persists to DB on explicit checkout.
- Simple request/response — no streaming needed.

### Alternatives Considered
- **Server Action**: Would work but less explicit for a write-heavy operation. API route is more testable.
- **Supabase direct insert from client**: Rejected — bypasses server validation, exposes DB schema to client.

---

## 3. Dashboard Metric Computation

### Decision
Compute metrics server-side in the Overview page's Server Component using Supabase aggregate queries.

### Rationale
- Supabase supports `count`, `avg`, and custom RPC functions.
- Server-side computation avoids shipping raw data to the client just to calculate totals.
- Results are lightweight JSON — fast to render.

### Key Metrics Implementation
- **Total Conversations**: `SELECT count(*) FROM chat_sessions`
- **Avg Response Time**: `SELECT avg(latency_ms) FROM chat_messages WHERE role = 'assistant' AND latency_ms IS NOT NULL`
- **AI Deflection Rate**: Count sessions where user sent ≤ 1 message after AI's first response. Requires a custom RPC or two queries: (1) count sessions, (2) count sessions with ≤ 2 user messages.
- **Conversion Rate**: `count(orders) / count(chat_sessions) * 100`

### Alternatives Considered
- **Pre-computed materialized views**: Overkill for MVP — data volume is low.
- **Client-side computation**: Rejected — would need to send all messages to client.

---

## 4. Chat Message Search

### Decision
Use Supabase `ilike` filter on `chat_messages.content` for keyword search.

### Rationale
- Simple, no additional extensions needed.
- `ilike '%keyword%'` works for the MVP's expected data volume (< 10k messages).
- Can be upgraded to full-text search (`tsvector`) later if needed.

### Alternatives Considered
- **PostgreSQL full-text search (`to_tsvector` / `tsquery`)**: Better performance at scale, but adds migration complexity. Deferred.
- **Supabase full-text search RPC**: Same as above — deferred to post-MVP.
- **Client-side filtering**: Rejected — requires loading all messages into memory.

---

## 5. Dashboard Styling Approach

### Decision
Use Tailwind CSS with the Stitch design system tokens defined in `DESIGN.md`. Add Google Material Symbols Outlined via CDN link. Configure custom Tailwind theme extension with the Stitch color palette, typography, and spacing tokens.

### Rationale
- The project already uses Tailwind CSS.
- The Stitch design provides explicit tokens (colors, spacing, typography) that map directly to Tailwind config.
- Material Symbols Outlined provides the icon set matching the design reference.
- No additional npm packages needed — CDN link for fonts/icons.

### Alternatives Considered
- **shadcn/ui**: Could work but the Stitch design has its own component style (glassmorphism, specific border-radius). Direct Tailwind is more precise.
- **CSS Modules**: Rejected — inconsistent with existing codebase which uses Tailwind utility classes.

---

## 6. Pagination Implementation

### Decision
Offset-based pagination (page number + limit) with `range()` on Supabase queries.

### Rationale
- Simple to implement and understand.
- Supabase JS client supports `.range(from, to)` natively.
- Sufficient for MVP data volume.
- Admin dashboard doesn't need cursor-based real-time pagination (no concurrent inserts during viewing).

### Alternatives Considered
- **Cursor-based pagination**: Better for real-time feeds, but overkill for admin dashboard with static data.
- **Infinite scroll**: UX option, but the spec says "scroll to bottom" — can be implemented as a "Load more" button triggering next offset.
