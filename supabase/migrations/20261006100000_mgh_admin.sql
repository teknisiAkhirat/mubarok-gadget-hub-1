create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

drop policy if exists "admin can read own record" on public.admin_users;
create policy "admin can read own record" on public.admin_users
for select to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "public read active categories" on public.categories;
create policy "public read active categories" on public.categories for select to anon, authenticated using (active = true);

drop policy if exists "public read active products" on public.products;
create policy "public read active products" on public.products for select to anon, authenticated using (active = true);

drop policy if exists "public read active services" on public.services;
create policy "public read active services" on public.services for select to anon, authenticated using (active = true);

drop policy if exists "public create inquiries" on public.inquiries;
create policy "public create inquiries" on public.inquiries for insert to anon, authenticated with check (true);

drop policy if exists "admin manage categories" on public.categories;
create policy "admin manage categories" on public.categories for all to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())))
with check (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())));

drop policy if exists "admin manage products" on public.products;
create policy "admin manage products" on public.products for all to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())))
with check (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())));

drop policy if exists "admin manage services" on public.services;
create policy "admin manage services" on public.services for all to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())))
with check (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())));

drop policy if exists "admin manage inquiries" on public.inquiries;
create policy "admin manage inquiries" on public.inquiries for select, update, delete to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())))
with check (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())));

create index if not exists products_category_idx on public.products(category_id);
create index if not exists products_active_idx on public.products(active);
create index if not exists inquiries_status_idx on public.inquiries(status);
create index if not exists inquiries_created_idx on public.inquiries(created_at desc);
