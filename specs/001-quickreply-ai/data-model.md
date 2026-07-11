# Data Model: QuickReply AI Storefront

This document outlines the database schema in Supabase (PostgreSQL with `pgvector`) and the client-side state models for the mockup storefront shopping cart.

---

## 1. Relational Database Schema (Supabase / Postgres)

### `products` Table
Stores the catalogue of hardware items available in the storefront.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique product ID. |
| `name` | `text` | NOT NULL | Product display name. |
| `brand` | `text` | NOT NULL | Manufacturer (e.g., ASUS, Dell, Apple). |
| `price` | `numeric(12,2)` | NOT NULL, CHECK (price >= 0) | Selling price in VND. |
| `specifications` | `jsonb` | NOT NULL | JSON dictionary of CPU, RAM, Storage, GPU, Screen. |
| `stock` | `integer` | NOT NULL, DEFAULT 0, CHECK (stock >= 0) | Quantity available. |
| `embedding` | `vector(1536)` | NULL | Vector embedding of product specs for semantic search. |
| `created_at` | `timestamptz` | DEFAULT now() | Record creation date. |

*Index*: `CREATE INDEX ON products USING hnsw (embedding vector_cosine_ops);` for fast vector search.

---

### `promotions` Table
Stores running marketing campaigns and discounts.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique promotion ID. |
| `title` | `text` | NOT NULL | Campaign name. |
| `description` | `text` | NOT NULL | Description of the offer. |
| `discount_percentage` | `numeric(5,2)` | CHECK (discount_percentage >= 0 AND discount_percentage <= 100) | Discount amount. |
| `start_date` | `timestamptz` | NOT NULL | Start of promotion period. |
| `end_date` | `timestamptz` | NOT NULL | End of promotion period. |
| `embedding` | `vector(1536)` | NULL | Vector embedding of promotion text. |

*Index*: `CREATE INDEX ON promotions USING hnsw (embedding vector_cosine_ops);`

---

### `warranty_policies` Table
Stores warranty rules for brand products.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique policy ID. |
| `brand` | `text` | NOT NULL, UNIQUE | Associated hardware brand. |
| `policy_details` | `text` | NOT NULL | Detailed text describing coverage, exceptions, and centers. |
| `duration_months` | `integer` | NOT NULL, CHECK (duration_months >= 0) | Warranty term. |
| `embedding` | `vector(1536)` | NULL | Vector embedding of the policy details. |

*Index*: `CREATE INDEX ON warranty_policies USING hnsw (embedding vector_cosine_ops);`

---

### `chat_messages` Table
Persists user chat conversations associated with anonymous sessions.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PRIMARY KEY, DEFAULT gen_random_uuid() | Message ID. |
| `session_id` | `uuid` | NOT NULL | Link to anonymous user session identifier. |
| `role` | `text` | NOT NULL, CHECK (role IN ('user', 'assistant')) | Message author role. |
| `content` | `text` | NOT NULL | Text content. |
| `tool_calls` | `jsonb` | DEFAULT '[]'::jsonb | Store structural metadata of tools called. |
| `created_at` | `timestamptz` | DEFAULT now() | Message time. |

*Index*: `CREATE INDEX ON chat_messages (session_id, created_at ASC);`

---

## 2. Client-Side Store State (Zustand & LocalStorage)

### Cart Item State
Represents a single product added to the cart, stored client-side.

```typescript
interface CartItem {
  productId: string; // Maps to products.id
  name: string;      // Product name
  price: number;     // Selling price
  brand: string;     // Brand
  quantity: number;  // Selected amount
  image: string;     // Mockup image URL
}
```

### Cart Store State (`useCartStore`)
The Zustand global store interface managed on the client storefront.

```typescript
interface CartState {
  items: CartItem[];
  isOpen: boolean; // Controls whether CartDrawer is visible
  
  // Actions
  addItem: (product: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleDrawer: (open?: boolean) => void;
}
```
*Persistence*: The Zustand store will use the `persist` middleware configured with the name `phongvu-cart-store` to save/restore from `localStorage`.
