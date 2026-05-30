-- Run in Supabase SQL Editor if you already ran schema.sql (M1)

create table if not exists public.awards (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  year_optional text,
  sort_order int not null default 0
);

create index if not exists awards_profile_id_idx on public.awards (profile_id);

alter table public.awards enable row level security;

drop policy if exists "Users manage own awards" on public.awards;
create policy "Users manage own awards"
  on public.awards for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = profile_id and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = profile_id and p.user_id = auth.uid()
    )
  );

drop policy if exists "Public read awards for public profiles" on public.awards;
create policy "Public read awards for public profiles"
  on public.awards for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = profile_id and p.is_public = true
    )
  );

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "Avatar upload own folder" on storage.objects;
create policy "Avatar upload own folder"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Avatar update own folder" on storage.objects;
create policy "Avatar update own folder"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Avatar read public" on storage.objects;
create policy "Avatar read public"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "Avatar delete own folder" on storage.objects;
create policy "Avatar delete own folder"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
