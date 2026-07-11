# Quickstart: Dashboard Validation

## Prerequisites

- Supabase project running (local or remote)
- `OPENAI_API_KEY` set in `.env.local` (for existing chat feature)
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` set in `.env.local`

## Setup

### 1. Apply Database Migration

```bash
# Apply the new orders table migration
npx supabase db push
```

This adds the `orders` table and RLS policies to your Supabase project.

### 2. Install Dependencies

```bash
pnpm install
```

No new npm packages required — uses existing `@supabase/supabase-js`, `tailwindcss`, `lucide-react`.

### 3. Start Dev Server

```bash
pnpm dev
```

## Validation Scenarios

### Scenario 1: Dashboard Layout Loads

1. Navigate to `http://localhost:3000/dashboard`
2. **Expected**: Side navigation with links (Overview, Conversations, Orders) + top header bar with search input.
3. **Expected**: Overview page shows 4 metric cards (Total Conversations, Conversion Rate, AI Deflection Rate, Avg Response Time).

### Scenario 2: View Chat History

1. Navigate to `http://localhost:3000/dashboard/conversations`
2. **Expected**: Paginated table of chat sessions with columns: Session ID, Started At, Ended At, Message Count, User Agent.
3. Click a session row.
4. **Expected**: Expanded view shows full message thread with role badges, content, and timestamps.
5. Type a keyword in the search box and submit.
6. **Expected**: Table filters to sessions containing matching messages. "No results found" shown if no matches.

### Scenario 3: Place Order and View in Dashboard

1. Open storefront at `http://localhost:3000`
2. Add a product to cart via the chat widget or storefront.
3. Click "Checkout" button.
4. **Expected**: Order is created (POST `/api/orders` returns 201).
5. Navigate to `http://localhost:3000/dashboard/orders`
6. **Expected**: The new order appears in the table with items, total, and `pending` status.
7. Click the order row.
8. **Expected**: Expanded view shows item details (name, qty, price) and order total.

### Scenario 4: Empty States

1. With a fresh database (no chat sessions or orders), navigate to each dashboard page.
2. **Expected**: "No conversations yet" / "No orders yet" empty state messages.

### Scenario 5: Error Handling

1. Temporarily set `NEXT_PUBLIC_SUPABASE_URL` to an invalid value.
2. Navigate to any dashboard page.
3. **Expected**: Inline error banner appears with "Retry" button. Page does not crash.

## Test Commands

```bash
# Unit tests
pnpm test

# Type check
npx tsc --noEmit

# Lint
pnpm lint
```
