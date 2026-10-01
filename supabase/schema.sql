-- ============================================================
-- MenuQR — Supabase schema
-- Run this in your Supabase project: SQL Editor → New query
-- ============================================================

-- Restaurants
create table restaurants (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  slug        text not null unique,
  description text,
  logo_url    text,
  created_at  timestamptz default now()
);

-- Categories
create table categories (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  name          text not null,
  sort_order    int  not null default 0,
  created_at    timestamptz default now()
);

-- Menu items
create table menu_items (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  category_id   uuid references categories(id) on delete set null,
  name          text    not null,
  description   text,
  price         numeric(10,2) not null,
  image_url     text,
  available     boolean not null default true,
  created_at    timestamptz default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table restaurants enable row level security;
alter table categories   enable row level security;
alter table menu_items   enable row level security;

-- Restaurants: owner can do everything; anyone can read
create policy "owner_all" on restaurants
  for all using (auth.uid() = owner_id);

create policy "public_read_restaurants" on restaurants
  for select using (true);

-- Categories: owner can do everything; anyone can read
create policy "owner_all_categories" on categories
  for all using (
    auth.uid() = (select owner_id from restaurants where id = restaurant_id)
  );

create policy "public_read_categories" on categories
  for select using (true);

-- Menu items: owner can do everything; anyone can read available items
create policy "owner_all_items" on menu_items
  for all using (
    auth.uid() = (select owner_id from restaurants where id = restaurant_id)
  );

create policy "public_read_items" on menu_items
  for select using (true);
