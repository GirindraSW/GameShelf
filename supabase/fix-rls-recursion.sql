-- =============================================================
-- Fix RLS recursion on profiles admin checks
-- Run this in Supabase SQL Editor for an existing database.
-- =============================================================

begin;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

grant execute on function public.is_admin() to anon, authenticated, service_role;

drop policy if exists "Admin bisa lihat semua profil" on public.profiles;
drop policy if exists "Hanya admin yang bisa kelola kategori" on public.categories;
drop policy if exists "Admin bisa lihat semua produk" on public.products;
drop policy if exists "Hanya admin yang bisa kelola produk" on public.products;
drop policy if exists "Admin bisa lihat semua order" on public.orders;
drop policy if exists "Admin bisa update order" on public.orders;
drop policy if exists "Admin bisa lihat semua order items" on public.order_items;
drop policy if exists "Admin bisa lihat semua payment logs" on public.payment_logs;

create policy "Admin bisa lihat semua profil"
  on public.profiles for select
  using (public.is_admin());

create policy "Hanya admin yang bisa kelola kategori"
  on public.categories for all
  using (public.is_admin());

create policy "Admin bisa lihat semua produk"
  on public.products for select
  using (public.is_admin());

create policy "Hanya admin yang bisa kelola produk"
  on public.products for all
  using (public.is_admin());

create policy "Admin bisa lihat semua order"
  on public.orders for select
  using (public.is_admin());

create policy "Admin bisa update order"
  on public.orders for update
  using (public.is_admin());

create policy "Admin bisa lihat semua order items"
  on public.order_items for select
  using (public.is_admin());

create policy "Admin bisa lihat semua payment logs"
  on public.payment_logs for all
  using (public.is_admin());

commit;
