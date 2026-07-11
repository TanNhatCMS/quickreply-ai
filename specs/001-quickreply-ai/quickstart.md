# Quickstart & Validation Guide

This document describes how to set up the local development environment, initialize the RAG database, run the storefront, and validate that the features work end-to-end.

---

## 1. Prerequisites & Environment Setup

### Local Dependencies
Ensure you have the following installed:
* Node.js v18+ & npm
* Supabase CLI (optional, for local DB development) or a Supabase Cloud account

### Environment Variables (`.env.local`)
Create a `.env.local` file in the root of the project with:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

---

## 2. Database Initialization (Supabase)

Run the following SQL commands in your Supabase SQL Editor to enable `pgvector`, create tables, set up vector indices, and insert seed hardware specs:

```sql
-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create tables
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  brand text NOT NULL,
  price numeric(12,2) NOT NULL,
  specifications jsonb NOT NULL,
  stock integer NOT NULL DEFAULT 0,
  embedding vector(1536),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.warranty_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand text NOT NULL UNIQUE,
  policy_details text NOT NULL,
  duration_months integer NOT NULL,
  embedding vector(1536)
);

CREATE TABLE IF NOT EXISTS public.promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  discount_percentage numeric(5,2),
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  embedding vector(1536)
);

-- 3. Insert mock product specs
INSERT INTO public.products (name, brand, price, specifications, stock)
VALUES 
('ASUS TUF Gaming A15', 'ASUS', 24990000, '{"cpu": "Ryzen 7 7735HS", "ram": "16GB", "storage": "512GB SSD", "gpu": "RTX 4060"}', 10),
('Dell XPS 13 Plus', 'Dell', 45000000, '{"cpu": "Intel Core i7-1360P", "ram": "32GB", "storage": "1TB SSD", "gpu": "Intel Iris Xe"}', 5),
('MacBook Air M2 13-inch', 'Apple', 26500000, '{"cpu": "Apple M2 (8-core)", "ram": "8GB", "storage": "256GB SSD", "gpu": "8-core GPU"}', 15);
```

---

## 3. Launching the Storefront

1. Install project dependencies:
   ```bash
   npm install
   ```
2. Start the local Next.js development server:
   ```bash
   npm run dev
   ```
3. Open your browser and navigate to `http://localhost:3000`.

---

## 4. End-to-End Feature Validation

### Test Scenario A: RAG Hardware Query
1. Click the chat bubble in the bottom right corner of the storefront mockup to open the widget.
2. Ask the assistant: *"Show me gaming laptops with RTX 4060 graphics."*
3. **Verify**:
   * The assistant returns a styled message highlighting the **ASUS TUF Gaming A15** specifications.
   * An interactive Product Card component containing the price, specs, and a direct "Add to Cart" button is rendered directly inside the chat window.

### Test Scenario B: Cart State Sync & LocalStorage Persistence
1. Locate the interactive Product Card within the chat window.
2. Click the **"Add to Cart"** button on the card.
3. **Verify**:
   * The cart count indicator on the header storefront navigation updates to show `1` item instantly (< 200ms).
   * Open the storefront side Cart Drawer; verify that the ASUS TUF Gaming A15 is displayed with correct quantity and price.
4. Refresh the web page.
5. **Verify**:
   * The Cart Drawer still contains the product, confirming Zustand and LocalStorage sync are functioning correctly.

### Test Scenario C: LLM Retry Fallback
1. To simulate a network/LLM failure, temporarily disconnect your internet connection or rename the `OPENAI_API_KEY` in `.env.local` to invalidate it.
2. Submit a message in the chat widget: *"What is the warranty for ASUS?"*
3. **Verify**:
   * The API endpoint silently retries the call.
   * After 3 retries fail, the widget displays a polite notification card: *"AI support is currently offline. Please try again in a moment or proceed directly to checkout."*
