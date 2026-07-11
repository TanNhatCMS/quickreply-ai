# Data Model: Dashboard — Chat History & Order History

## Existing Tables (no changes)

### `chat_sessions`
Already exists. Dashboard reads from this table.

| Column | Type | Description |
|--------|------|-------------|
| `id` | `uuid` | PK. Session UUID. |
| `user_agent` | `text` | Browser user agent. |
| `started_at` | `timestamptz` | Session start. |
| `ended_at` | `timestamptz` | Session end (nullable). |
| `metadata` | `jsonb` | Extra context. |

### `chat_messages`
Already exists. Dashboard reads from this table.

| Column | Type | Description |
|--------|------|-------------|
| `id` | `uuid` | PK. Message UUID. |
| `session_id` | `uuid` | FK → chat_sessions. |
| `role` | `text` | user / assistant / system / tool. |
| `content` | `text` | Message text. |
| `tool_calls` | `jsonb` | Tool invocations. |
| `tokens_used` | `int` | Token count (nullable). |
| `latency_ms` | `int` | Response latency (nullable). |
| `model` | `text` | Model name (nullable). |
| `created_at` | `timestamptz` | Message timestamp. |

---

## New Table: `orders`

Persists customer orders created via the storefront checkout flow.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, DEFAULT gen_random_uuid() | Order ID. |
| `session_id` | `uuid` | FK → chat_sessions.id, ON DELETE SET NULL | Associated chat session. |
| `items` | `jsonb` | NOT NULL, DEFAULT '[]' | Array of order items. |
| `total` | `bigint` | NOT NULL, CHECK (total >= 0) | Total in VND. |
| `status` | `text` | NOT NULL, DEFAULT 'pending', CHECK (status IN ('pending', 'confirmed', 'shipped', 'completed', 'cancelled')) | Order status. Always `pending` for MVP. |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT now() | Order creation time. |
| `updated_at` | `timestamptz` | NOT NULL, DEFAULT now() | Last update (auto-trigger). |

### `items` JSONB Structure

Each element in the `items` array:

```json
{
  "productId": "uuid-string",
  "name": "ASUS ROG Strix G16",
  "brand": "ASUS",
  "price": 32990000,
  "quantity": 1,
  "image": "https://..."
}
```

### Indexes

- `CREATE INDEX ON orders (created_at DESC)` — chronological listing.
- `CREATE INDEX ON orders (status)` — filter by status.
- `CREATE INDEX ON orders (session_id)` — join with chat_sessions.

### Row Level Security

- `orders`: Anon can insert (checkout) and select (dashboard read).

```sql
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon insert on orders"
  ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon select on orders"
  ON orders FOR SELECT USING (true);
```

---

## Client-Side Store State (existing, no changes)

### Cart Item (`useCartStore`)
Already defined. Cart items are serialized into the `orders.items` JSONB array on checkout.

---

## Dashboard Query Patterns

### Conversations List (paginated)
```sql
SELECT s.id, s.started_at, s.ended_at, s.user_agent,
       count(m.id) as message_count
FROM chat_sessions s
LEFT JOIN chat_messages m ON m.session_id = s.id
GROUP BY s.id
ORDER BY s.started_at DESC
LIMIT 20 OFFSET 0;
```

### Session Detail (message thread)
```sql
SELECT id, role, content, tool_calls, created_at
FROM chat_messages
WHERE session_id = $1
ORDER BY created_at ASC;
```

### Keyword Search (across messages)
```sql
SELECT DISTINCT s.id, s.started_at, s.user_agent
FROM chat_sessions s
JOIN chat_messages m ON m.session_id = s.id
WHERE m.content ILIKE '%' || $1 || '%'
ORDER BY s.started_at DESC
LIMIT 20 OFFSET 0;
```

### Orders List (paginated)
```sql
SELECT id, session_id, items, total, status, created_at
FROM orders
ORDER BY created_at DESC
LIMIT 20 OFFSET 0;
```

### Metric: Total Conversations
```sql
SELECT count(*) FROM chat_sessions;
```

### Metric: Avg Response Time
```sql
SELECT avg(latency_ms) FROM chat_messages
WHERE role = 'assistant' AND latency_ms IS NOT NULL;
```

### Metric: AI Deflection Rate
```sql
-- Sessions where user sent ≤ 1 message after AI's first response
-- Proxy: sessions with ≤ 2 total user messages
WITH session_user_counts AS (
  SELECT session_id, count(*) as user_msg_count
  FROM chat_messages
  WHERE role = 'user'
  GROUP BY session_id
)
SELECT
  CASE WHEN count(*) = 0 THEN 0
       ELSE round(100.0 * count(*) FILTER (WHERE user_msg_count <= 2) / count(*), 1)
  END as deflection_rate
FROM session_user_counts;
```

### Metric: Conversion Rate
```sql
SELECT
  CASE WHEN (SELECT count(*) FROM chat_sessions) = 0 THEN 0
       ELSE round(100.0 * (SELECT count(*) FROM orders) / (SELECT count(*) FROM chat_sessions), 1)
  END as conversion_rate;
```
