-- =============================================================
-- GameShop — Database Schema
-- Jalankan ini di Supabase SQL Editor (sekali saja)
-- =============================================================

-- ─── PROFILES ────────────────────────────────────────────────
-- Extend auth.users dengan data tambahan user
create table if not exists public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  full_name   text,
  phone       text,
  address     text,
  role        text not null default 'customer' check (role in ('customer', 'admin')),
  created_at  timestamptz not null default now()
);

-- Trigger: otomatis buat profil saat user baru signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ─── CATEGORIES ──────────────────────────────────────────────
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  description text
);

-- Data awal kategori platform
insert into public.categories (name, slug, description) values
  ('PlayStation 5',    'ps5',      'Game fisik untuk konsol PS5'),
  ('PlayStation 4',    'ps4',      'Game fisik untuk konsol PS4'),
  ('Xbox',             'xbox',     'Game fisik untuk Xbox Series & One'),
  ('Nintendo Switch',  'nintendo', 'Game fisik untuk Nintendo Switch'),
  ('PC / Steam',       'pc',       'Game PC dalam format fisik'),
  ('Retro / Klasik',   'retro',    'Koleksi game klasik & retro')
on conflict (slug) do nothing;


-- ─── PRODUCTS ────────────────────────────────────────────────
create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  description text,
  price       integer not null check (price >= 0),
  stock       integer not null default 0 check (stock >= 0),
  category_id uuid references public.categories(id) on delete set null,
  images      text[] not null default '{}',
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Trigger: auto-update updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();


-- ─── ORDERS ──────────────────────────────────────────────────
create table if not exists public.orders (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references auth.users(id) on delete restrict,
  status               text not null default 'pending'
                         check (status in ('pending','paid','processing','shipped','delivered','cancelled')),
  total_amount         integer not null check (total_amount >= 0),
  midtrans_order_id    text unique,
  midtrans_snap_token  text,
  shipping_address     jsonb not null,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

drop trigger if exists orders_updated_at on public.orders;
create trigger orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();


-- ─── ORDER ITEMS ─────────────────────────────────────────────
create table if not exists public.order_items (
  id                uuid primary key default gen_random_uuid(),
  order_id          uuid not null references public.orders(id) on delete cascade,
  product_id        uuid not null references public.products(id) on delete restrict,
  quantity          integer not null check (quantity > 0),
  price_at_purchase integer not null check (price_at_purchase >= 0)
);


-- ─── PAYMENT LOGS ────────────────────────────────────────────
create table if not exists public.payment_logs (
  id                        uuid primary key default gen_random_uuid(),
  order_id                  uuid not null references public.orders(id) on delete cascade,
  midtrans_transaction_id   text,
  status                    text not null,
  raw_response              jsonb not null,
  created_at                timestamptz not null default now()
);


-- =============================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================

alter table public.profiles     enable row level security;
alter table public.categories   enable row level security;
alter table public.products     enable row level security;
alter table public.orders       enable row level security;
alter table public.order_items  enable row level security;
alter table public.payment_logs enable row level security;


-- ─── PROFILES policies ───────────────────────────────────────
create policy "User bisa lihat profil sendiri"
  on public.profiles for select
  using (auth.uid() = id);

create policy "User bisa update profil sendiri"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admin bisa lihat semua profil"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );


-- ─── CATEGORIES policies ─────────────────────────────────────
create policy "Siapapun bisa lihat kategori"
  on public.categories for select
  using (true);

create policy "Hanya admin yang bisa kelola kategori"
  on public.categories for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );


-- ─── PRODUCTS policies ───────────────────────────────────────
create policy "Siapapun bisa lihat produk aktif"
  on public.products for select
  using (is_active = true);

create policy "Admin bisa lihat semua produk"
  on public.products for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Hanya admin yang bisa kelola produk"
  on public.products for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );


-- ─── ORDERS policies ─────────────────────────────────────────
create policy "User bisa lihat order sendiri"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "User bisa buat order"
  on public.orders for insert
  with check (auth.uid() = user_id);

create policy "Admin bisa lihat semua order"
  on public.orders for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admin bisa update order"
  on public.orders for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );


-- ─── ORDER ITEMS policies ────────────────────────────────────
create policy "User bisa lihat item order sendiri"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders
      where id = order_id and user_id = auth.uid()
    )
  );

create policy "User bisa insert item order sendiri"
  on public.order_items for insert
  with check (
    exists (
      select 1 from public.orders
      where id = order_id and user_id = auth.uid()
    )
  );

create policy "Admin bisa lihat semua order items"
  on public.order_items for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );


-- ─── PAYMENT LOGS policies ───────────────────────────────────
create policy "Admin bisa lihat semua payment logs"
  on public.payment_logs for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Service role (digunakan server-side untuk webhook Midtrans)
-- sudah bypass RLS secara default, tidak perlu policy khusus.


-- =============================================================
-- STORAGE BUCKET untuk gambar produk
-- Buat manual di Supabase Dashboard > Storage > New Bucket:
--   Name: product-images
--   Public: true
-- =============================================================
