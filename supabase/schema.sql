-- Run this in Supabase: SQL Editor → New query → Paste → Run

-- Profiles (one per athlete account)
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  slug text not null unique,
  full_name text not null default '',
  sport text not null default 'baseball' check (sport in ('baseball', 'softball')),
  grad_year int,
  position_primary text,
  position_secondary text,
  height text,
  weight text,
  throws text,
  bats text,
  school text,
  city text,
  state text,
  gpa_optional numeric,
  academic_interests text,
  recruiting_goals text,
  stats_json jsonb not null default '{}'::jsonb,
  bio text,
  contact_email text,
  contact_phone text,
  parent_email_optional text,
  social_links jsonb not null default '{}'::jsonb,
  headshot_path text,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.external_profiles (
  profile_id uuid primary key references public.profiles (id) on delete cascade,
  ncsa_url text,
  perfect_game_url text,
  linked_at timestamptz not null default now()
);

create index if not exists profiles_user_id_idx on public.profiles (user_id);
create index if not exists profiles_slug_idx on public.profiles (slug);

-- Auto-create profile when someone signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_profile_id uuid;
  base_slug text;
  final_slug text;
begin
  base_slug := coalesce(
    nullif(
      lower(
        regexp_replace(
          trim(coalesce(new.raw_user_meta_data->>'full_name', 'athlete')),
          '[^a-zA-Z0-9]+',
          '-',
          'g'
        )
      ),
      ''
    ),
    'athlete'
  );
  final_slug := base_slug || '-' || substr(replace(new.id::text, '-', ''), 1, 6);

  insert into public.profiles (user_id, slug, full_name, sport, contact_email)
  values (
    new.id,
    final_slug,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    'baseball',
    new.email
  )
  returning id into new_profile_id;

  insert into public.external_profiles (profile_id)
  values (new_profile_id);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.external_profiles enable row level security;

create policy "Users read own profile"
  on public.profiles for select
  using (auth.uid() = user_id);

create policy "Users update own profile"
  on public.profiles for update
  using (auth.uid() = user_id);

create policy "Public read published profiles"
  on public.profiles for select
  using (is_public = true);

create policy "Users read own external links"
  on public.external_profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = profile_id and p.user_id = auth.uid()
    )
  );

create policy "Users update own external links"
  on public.external_profiles for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = profile_id and p.user_id = auth.uid()
    )
  );

create policy "Public read external links for public profiles"
  on public.external_profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = profile_id and p.is_public = true
    )
  );
