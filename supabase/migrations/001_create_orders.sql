create table if not exists public.orders (
  id uuid primary key,
  order_number text not null unique,
  customer jsonb not null,
  items jsonb not null check (jsonb_array_length(items) > 0),
  subtotal numeric(10, 2) not null check (subtotal >= 0),
  delivery_fee numeric(10, 2) not null check (delivery_fee >= 0),
  tax numeric(10, 2) not null check (tax >= 0),
  total numeric(10, 2) not null check (total >= 0),
  status text not null default 'ORDER_RECEIVED' check (
    status in ('ORDER_RECEIVED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_status_idx on public.orders (status);

alter table public.orders enable row level security;

-- No public policies are created. The application accesses this table only
-- through server-side Route Handlers using the Supabase service role key.
