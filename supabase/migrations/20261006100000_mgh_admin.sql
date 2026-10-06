create extension if not exists pgcrypto;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(), slug text unique not null, name text not null,
  icon text default '🔧', description text default '', sort_order integer not null default 0,
  active boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(), category_id uuid references public.categories(id) on delete set null,
  name text not null, slug text unique not null, brand text default '', model text default '', part_type text default '',
  condition text not null default 'original' check (condition in ('original','compatible')), grade text default '',
  status_test text default '', compatibility text default '', price bigint not null default 0 check (price >= 0),
  stock integer not null default 0 check (stock >= 0), warranty text default '', description text default '',
  image_url text default '', tags text[] not null default '{}', featured boolean not null default false,
  active boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(), title text not null, description text default '',
  price_label text default '', icon text default '🔧', sort_order integer not null default 0,
  active boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(), name text not null, phone text not null, message text not null,
  product_id uuid references public.products(id) on delete set null,
  status text not null default 'new' check (status in ('new','contacted','done','cancelled')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.services enable row level security;
alter table public.inquiries enable row level security;
alter table public.admin_users enable row level security;

drop policy if exists "admin can read own record" on public.admin_users;
create policy "admin can read own record" on public.admin_users for select to authenticated
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
