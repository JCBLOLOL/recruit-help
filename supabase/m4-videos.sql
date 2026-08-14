-- Run in Supabase SQL Editor (M4 — videos)

create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  storage_path text not null,
  title text not null default 'Game footage',
  duration_sec int,
  created_at timestamptz not null default now()
);

create index if not exists videos_profile_id_idx on public.videos (profile_id);

alter table public.videos enable row level security;

drop policy if exists "Users manage own videos" on public.videos;
create policy "Users manage own videos"
  on public.videos for all
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

drop policy if exists "Public read videos for public profiles" on public.videos;
create policy "Public read videos for public profiles"
  on public.videos for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = profile_id and p.is_public = true
    )
  );

insert into storage.buckets (id, name, public)
values ('videos', 'videos', false)
on conflict (id) do nothing;

drop policy if exists "Video upload own folder" on storage.objects;
create policy "Video upload own folder"
  on storage.objects for insert
  with check (
    bucket_id = 'videos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Video update own folder" on storage.objects;
create policy "Video update own folder"
  on storage.objects for update
  using (
    bucket_id = 'videos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Video read own folder" on storage.objects;
create policy "Video read own folder"
  on storage.objects for select
  using (
    bucket_id = 'videos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Video delete own folder" on storage.objects;
create policy "Video delete own folder"
  on storage.objects for delete
  using (
    bucket_id = 'videos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
