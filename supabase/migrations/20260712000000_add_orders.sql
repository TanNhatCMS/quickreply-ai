-- ============================================================
-- QuickReply AI - Add Orders Table
-- Migration: 20260712000000_add_orders
-- ============================================================

-- 1. orders table
CREATE TABLE IF NOT EXISTS orders (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  uuid        REFERENCES chat_sessions(id) ON DELETE SET NULL,
  items       jsonb       NOT NULL DEFAULT '[]',
  total       bigint      NOT NULL CHECK (total >= 0),
  status      text        NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'confirmed', 'shipped', 'completed', 'cancelled')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS orders_created_at_idx
  ON orders (created_at DESC);

CREATE INDEX IF NOT EXISTS orders_status_idx
  ON orders (status);

CREATE INDEX IF NOT EXISTS orders_session_id_idx
  ON orders (session_id);

-- 2. Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon insert on orders"
  ON orders FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anon select on orders"
  ON orders FOR SELECT USING (true);

-- 3. Auto-update updated_at trigger
CREATE TRIGGER set_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
