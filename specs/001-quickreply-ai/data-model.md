# Data Model: QuickReply AI

This document outlines the database schema in Supabase (PostgreSQL with `pgvector`) for RAG knowledge base and chat trace history, plus the client-side state models.

---

## 1. Relational Database Schema (Supabase / Postgres)

### `documents` Table
RAG knowledge base — stores chunked content from `help.phongvu.vn/llms-full.txt` for semantic search.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PRIMARY KEY, DEFAULT gen_random_uuid() | Document ID. |
| `title` | `text` | NOT NULL | Section/chunk title. |
| `content` | `text` | NOT NULL | Full text content of the chunk. |
| `category` | `text` | NOT NULL, CHECK (IN company/policy/warranty/payment/delivery/faq/service/legal) | Document category. |
| `source_url` | `text` | NULL | Original source URL. |
| `metadata` | `jsonb` | NOT NULL, DEFAULT '{}' | Additional metadata (brand, tags, discount, etc.). |
| `embedding` | `vector(1536)` | NULL | OpenAI text-embedding-3-small vector for semantic search. |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT now() | Record creation date. |
| `updated_at` | `timestamptz` | NOT NULL, DEFAULT now() | Last update (auto-updated via trigger). |

*Indexes*:
- `CREATE INDEX ON documents USING hnsw (embedding vector_cosine_ops)` — fast vector search.
- `CREATE INDEX ON documents (category)` — filtered queries by category.

---

### `chat_sessions` Table
Tracks each chat consultation session for dashboard tracing.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PRIMARY KEY, DEFAULT gen_random_uuid() | Session ID (matches client-side anonymous UUID). |
| `user_agent` | `text` | NULL | Browser user agent string. |
| `started_at` | `timestamptz` | NOT NULL, DEFAULT now() | Session start time. |
| `ended_at` | `timestamptz` | NULL | Session end time. |
| `metadata` | `jsonb` | NOT NULL, DEFAULT '{}' | Extra context (referrer, page URL, etc.). |

---

### `chat_messages` Table
Persists every message in a chat session with trace metadata for dashboard replay.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PRIMARY KEY, DEFAULT gen_random_uuid() | Message ID. |
| `session_id` | `uuid` | NOT NULL, FK → chat_sessions.id (ON DELETE CASCADE) | Parent session. |
| `role` | `text` | NOT NULL, CHECK (role IN ('user', 'assistant', 'system', 'tool')) | Message author role. |
| `content` | `text` | NOT NULL | Message text content. |
| `tool_calls` | `jsonb` | NOT NULL, DEFAULT '[]' | Tool invocations (name, args, result). |
| `tokens_used` | `integer` | NULL, CHECK (>= 0) | Token count for this message. |
| `latency_ms` | `integer` | NULL, CHECK (>= 0) | Response latency in milliseconds. |
| `model` | `text` | NULL | Model used (e.g., gpt-4o-mini). |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT now() | Message timestamp. |

*Index*: `CREATE INDEX ON chat_messages (session_id, created_at ASC)` — ordered session replay.

---

## 2. Row Level Security (RLS)

- **documents**: Public read (RAG queries run server-side, but anon read allowed for flexibility).
- **chat_sessions**: Anon can insert and read (session creation + dashboard access).
- **chat_messages**: Anon can insert and read (trace saving + dashboard replay).

---

## 3. RPC Functions

### `match_documents`
Vector similarity search with optional category filter.

```sql
match_documents(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.4,
  match_count int DEFAULT 5,
  filter_category text DEFAULT NULL
) → TABLE (id, title, content, category, metadata, similarity)
```

---

## 4. Client-Side Store State (Zustand & LocalStorage)

### Cart Item State
Represents a single product added to the cart, stored client-side.

```typescript
interface CartItem {
  productId: string;
  name: string;
  price: number;
  brand: string;
  quantity: number;
  image: string;
}
```

### Cart Store State (`useCartStore`)
The Zustand global store interface managed on the client storefront.

```typescript
interface CartState {
  items: CartItem[];
  isOpen: boolean;

  addItem: (product: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleDrawer: (open?: boolean) => void;
}
```

*Persistence*: Zustand `persist` middleware with name `phongvu-cart-store` → `localStorage`.
