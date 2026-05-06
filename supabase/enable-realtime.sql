-- =============================================================
-- Enable Supabase Realtime for user-facing live updates.
-- Safe to run when the tables are not in the publication yet.
-- =============================================================

do $$
begin
  alter publication supabase_realtime add table public.orders;
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.products;
exception
  when duplicate_object then null;
end $$;
