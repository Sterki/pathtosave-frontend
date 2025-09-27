-- Supabase PostgreSQL schema, RLS policies, helper views/RPCs, and seed data
-- Safe to run on a fresh database. Re-run guarded by IF NOT EXISTS where possible.

-- Extensions ---------------------------------------------------------------
create extension if not exists pgcrypto;
create extension if not exists citext;

-- Schema ------------------------------------------------------------------
create schema if not exists public;

-- Users/profile model
-- If you use Supabase Auth, prefer linking to auth.users and store profile in public.profiles
create table if not exists public.profiles (
  user_id uuid primary key,
  email citext not null unique,
  display_name text,
  currency char(3) default 'USD',
  timezone text default 'UTC',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint fk_profiles_user foreign key (user_id) references auth.users(id) on delete cascade
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  type text not null check (type in ('expense','income')),
  color text,
  icon text,
  is_archived boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, name, type),
  constraint fk_categories_user foreign key (user_id) references auth.users(id) on delete cascade
);

create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  amount numeric(12,2) not null check (amount >= 0),
  period text not null check (period in ('monthly','weekly','yearly','custom')),
  start_date date not null,
  end_date date,
  notes text,
  category_id uuid references public.categories(id) on delete set null,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, name, start_date, period),
  constraint fk_budgets_user foreign key (user_id) references auth.users(id) on delete cascade
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  budget_id uuid references public.budgets(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,
  amount numeric(12,2) not null check (amount > 0),
  currency char(3) default 'USD',
  occurred_at date not null,
  description text,
  merchant text,
  payment_method text check (payment_method in ('cash','card','transfer','other')),
  tags text[],
  receipt_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint fk_expenses_user foreign key (user_id) references auth.users(id) on delete cascade
);

create table if not exists public.incomes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  category_id uuid references public.categories(id) on delete set null,
  amount numeric(12,2) not null check (amount > 0),
  currency char(3) default 'USD',
  received_at date not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint fk_incomes_user foreign key (user_id) references auth.users(id) on delete cascade
);

-- Indexes -----------------------------------------------------------------
create index if not exists idx_profiles_email on public.profiles (email);
create index if not exists idx_categories_user on public.categories(user_id);
create index if not exists idx_budgets_user_period on public.budgets(user_id, period, start_date);
create index if not exists idx_expenses_user_date on public.expenses(user_id, occurred_at);
create index if not exists idx_expenses_user_category on public.expenses(user_id, category_id);
create index if not exists idx_expenses_user_budget on public.expenses(user_id, budget_id);
create index if not exists idx_incomes_user_date on public.incomes(user_id, received_at);

-- updated_at trigger -------------------------------------------------------
create or replace function public.set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end; $$ language plpgsql;

do $$ begin
  if not exists (select 1 from pg_trigger where tgname = 'trg_profiles_updated_at') then
    create trigger trg_profiles_updated_at before update on public.profiles
    for each row execute function public.set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'trg_categories_updated_at') then
    create trigger trg_categories_updated_at before update on public.categories
    for each row execute function public.set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'trg_budgets_updated_at') then
    create trigger trg_budgets_updated_at before update on public.budgets
    for each row execute function public.set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'trg_expenses_updated_at') then
    create trigger trg_expenses_updated_at before update on public.expenses
    for each row execute function public.set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'trg_incomes_updated_at') then
    create trigger trg_incomes_updated_at before update on public.incomes
    for each row execute function public.set_updated_at();
  end if;
end $$;

-- Row Level Security (RLS) ------------------------------------------------
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.budgets enable row level security;
alter table public.expenses enable row level security;
alter table public.incomes enable row level security;

-- Helper: current authenticated user id (from Supabase JWT)
create or replace function public.current_user_id() returns uuid language sql stable as $$
  select coalesce(nullif(current_setting('request.jwt.claim.sub', true), ''), null) :: uuid;
$$;

-- Policies: users can see and mutate only their own rows
do $$ begin
  -- profiles
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='profiles_select_own') then
    create policy profiles_select_own on public.profiles for select using (user_id = public.current_user_id());
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='profiles_insert_self') then
    create policy profiles_insert_self on public.profiles for insert with check (user_id = public.current_user_id());
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='profiles_update_own') then
    create policy profiles_update_own on public.profiles for update using (user_id = public.current_user_id());
  end if;

  -- categories
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='categories' and policyname='categories_all_own') then
    create policy categories_all_own on public.categories for all using (user_id = public.current_user_id()) with check (user_id = public.current_user_id());
  end if;

  -- budgets
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='budgets' and policyname='budgets_all_own') then
    create policy budgets_all_own on public.budgets for all using (user_id = public.current_user_id()) with check (user_id = public.current_user_id());
  end if;

  -- expenses
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='expenses' and policyname='expenses_all_own') then
    create policy expenses_all_own on public.expenses for all using (user_id = public.current_user_id()) with check (user_id = public.current_user_id());
  end if;

  -- incomes
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='incomes' and policyname='incomes_all_own') then
    create policy incomes_all_own on public.incomes for all using (user_id = public.current_user_id()) with check (user_id = public.current_user_id());
  end if;
end $$;

-- RPCs / Views ------------------------------------------------------------
-- Daily spend for calendar
create or replace function public.daily_spend(month_date date)
returns table (date date, total numeric, count int)
language plpgsql stable as $$
declare
  d1 date := date_trunc('month', month_date)::date;
  d2 date := (date_trunc('month', month_date) + interval '1 month' - interval '1 day')::date;
  uid uuid := public.current_user_id();
begin
  return query
  with days as (
    select dd::date as day
    from generate_series(d1, d2, interval '1 day') dd
  )
  select days.day as date,
         coalesce(sum(e.amount), 0)::numeric as total,
         count(e.id)::int as count
  from days
  left join public.expenses e on e.user_id = uid and e.occurred_at = days.day
  group by days.day
  order by days.day;
end; $$;

-- Budgets progress (current period computed)
create or replace function public.budget_progress(budget_uuid uuid)
returns table (budget_id uuid, name text, period text, spent numeric, budget_limit numeric, progress numeric, remaining numeric)
language plpgsql stable as $$
declare
  b record;
  from_date date;
  to_date date;
  uid uuid := public.current_user_id();
begin
  select * into b from public.budgets where id = budget_uuid and user_id = uid;
  if not found then
    return;
  end if;

  if b.period = 'monthly' then
    from_date := date_trunc('month', now())::date;
    to_date := (date_trunc('month', now()) + interval '1 month' - interval '1 day')::date;
  elsif b.period = 'weekly' then
    from_date := date_trunc('week', now())::date;
    to_date := (from_date + interval '6 days')::date;
  elsif b.period = 'yearly' then
    from_date := date_trunc('year', now())::date;
    to_date := (date_trunc('year', now()) + interval '1 year' - interval '1 day')::date;
  else
    from_date := b.start_date;
    to_date := coalesce(b.end_date, b.start_date);
  end if;

  return query
  select b.id, b.name, b.period,
         coalesce(sum(e.amount),0)::numeric as spent,
         b.amount as budget_limit,
         case when b.amount > 0 then (coalesce(sum(e.amount),0) / b.amount) else 0 end as progress,
         (b.amount - coalesce(sum(e.amount),0)) as remaining
  from public.budgets b
  left join public.expenses e on e.budget_id = b.id and e.user_id = uid and e.occurred_at between from_date and to_date
  where b.id = budget_uuid and b.user_id = uid
  group by b.id, b.name, b.period, b.amount;
end; $$;

-- Summary (income/expense/balance and top categories)
create or replace function public.summary(from_date date, to_date date)
returns table (
  total_income numeric,
  total_expense numeric,
  balance numeric
) language plpgsql stable as $$
declare
  uid uuid := public.current_user_id();
begin
  return query
  select
    coalesce((select sum(i.amount) from public.incomes i where i.user_id = uid and i.received_at between from_date and to_date), 0)::numeric as total_income,
    coalesce((select sum(e.amount) from public.expenses e where e.user_id = uid and e.occurred_at between from_date and to_date), 0)::numeric as total_expense,
    coalesce((select sum(i.amount) from public.incomes i where i.user_id = uid and i.received_at between from_date and to_date), 0)::numeric
    - coalesce((select sum(e.amount) from public.expenses e where e.user_id = uid and e.occurred_at between from_date and to_date), 0)::numeric as balance;
end; $$;

-- Expenses grouped by category within a range
create or replace function public.expenses_by_category(from_date date, to_date date)
returns table (category_id uuid, name text, amount numeric, percent numeric)
language plpgsql stable as $$
declare
  uid uuid := public.current_user_id();
  total numeric;
begin
  select coalesce(sum(amount),0) into total from public.expenses where user_id = uid and occurred_at between from_date and to_date;
  return query
  select c.id, c.name, coalesce(sum(e.amount),0)::numeric as amount,
         case when total > 0 then (coalesce(sum(e.amount),0) / total) else 0 end as percent
  from public.categories c
  left join public.expenses e on e.category_id = c.id and e.user_id = uid and e.occurred_at between from_date and to_date
  where c.user_id = uid and c.type = 'expense'
  group by c.id, c.name
  order by amount desc;
end; $$;

-- Seeds -------------------------------------------------------------------
-- Seed default categories for each user via trigger on signup (optional)
create or replace function public.seed_default_categories() returns trigger as $$
begin
  insert into public.categories (user_id, name, type, color, icon, sort_order)
  values
    (new.id, 'Comida', 'expense', '#ef4444', 'utensils', 1),
    (new.id, 'Transporte', 'expense', '#3b82f6', 'car', 2),
    (new.id, 'Salud', 'expense', '#10b981', 'heart', 3),
    (new.id, 'Entretenimiento', 'expense', '#f59e0b', 'film', 4),
    (new.id, 'Salario', 'income', '#22c55e', 'banknote', 1),
    (new.id, 'Otros Ingresos', 'income', '#84cc16', 'plus', 2);

  insert into public.profiles (user_id, email, display_name)
  values (new.id, new.email, split_part(new.email, '@', 1))
  on conflict (user_id) do nothing;

  return new;
end; $$ language plpgsql;

do $$ begin
  if not exists (select 1 from pg_trigger where tgname = 'trg_auth_user_seed_categories') then
    create trigger trg_auth_user_seed_categories
    after insert on auth.users
    for each row execute function public.seed_default_categories();
  end if;
end $$;

-- End of file


