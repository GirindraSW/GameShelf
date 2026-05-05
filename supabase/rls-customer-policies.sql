-- ============================================================
-- RLS Policies untuk Customer (orders, order_items, profiles)
-- Jalankan di Supabase SQL Editor
-- ============================================================

-- ORDERS: customer bisa baca & buat order sendiri
CREATE POLICY "Users can read own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ORDER ITEMS: customer bisa baca & buat item dari order sendiri
CREATE POLICY "Users can read own order items"
  ON order_items FOR SELECT
  USING (
    order_id IN (SELECT id FROM orders WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create order items"
  ON order_items FOR INSERT
  WITH CHECK (
    order_id IN (SELECT id FROM orders WHERE user_id = auth.uid())
  );

-- PAYMENT LOGS: customer hanya bisa baca log order sendiri
CREATE POLICY "Users can read own payment logs"
  ON payment_logs FOR SELECT
  USING (
    order_id IN (SELECT id FROM orders WHERE user_id = auth.uid())
  );

-- PROFILES: customer bisa baca & update profile sendiri
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
