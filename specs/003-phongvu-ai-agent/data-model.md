# Data Model: Phong Vu AI Agent

**Date**: 2026-07-12 | **Feature**: 003-phongvu-ai-agent

## Supabase Tables (already migrated)

### `chat_sessions`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PRIMARY KEY | Session ID |
| `user_agent` | `text` | NULL | Browser user agent |
| `started_at` | `timestamptz` | DEFAULT now() | Session start |
| `ended_at` | `timestamptz` | NULL | Session end |
| `metadata` | `jsonb` | DEFAULT '{}' | Extra context |

### `chat_messages`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PRIMARY KEY | Message ID |
| `session_id` | `uuid` | NOT NULL, FK | Parent session |
| `role` | `text` | NOT NULL, CHECK IN user/assistant/system/tool | Role |
| `content` | `text` | NOT NULL | Message text |
| `tool_calls` | `jsonb` | DEFAULT '[]' | Tool invocations |
| `tokens_used` | `integer` | NULL | Token count |
| `latency_ms` | `integer` | NULL | Response latency |
| `model` | `text` | NULL | Model used |
| `created_at` | `timestamptz` | DEFAULT now() | Timestamp |

### `documents`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PRIMARY KEY | Document ID |
| `title` | `text` | NOT NULL | Section title |
| `content` | `text` | NOT NULL | Full text |
| `category` | `text` | NOT NULL, CHECK | Category |
| `source_url` | `text` | NULL | Source URL |
| `metadata` | `jsonb` | DEFAULT '{}' | Extra metadata |
| `embedding` | `vector(1536)` | NULL | OpenAI embedding |
| `created_at` | `timestamptz` | DEFAULT now() | Created |
| `updated_at` | `timestamptz` | DEFAULT now() | Updated |

## Client-Side (Zustand)

```typescript
interface CartItem {
  productId: string; name: string; brand: string;
  price: number; image: string; quantity: number;
}
```

## MCP Tools

| Tool | Description | Key Params |
|------|-------------|------------|
| `search_products` | Search products | query, price_lte/gte, brands, sort |
| `get_product_detail` | Details by SKU | sku |
| `compare_products` | Compare 2-3 | skus[] |
| `get_recommendations` | Related products | sku |
| `check_stock` | Stock status | sku |
| `get_popular_keywords` | Popular terms | limit |
