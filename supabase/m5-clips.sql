-- Run in Supabase SQL Editor (M5 — highlight clips)

create table if not exists public.clips (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references public.videos (id) on delete cascade,
  label text not null default 'Highlight',
  start_sec double precision not null default 0,
  end_sec double precision not null default 5,
  sort_order int not null default 0,
  is_featured boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists clips_video_id_idx on public.clips (video_id);

alter table public.clips enable row level security;

drop policy if exists "Users manage own clips" on public.clips;
create policy "Users manage own clips"
  on public.clips for all
  using (
    exists (
      select 1
      from public.videos v
      join public.profiles p on p.id = v.profile_id
      where v.id = video_id and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.videos v
      join public.profiles p on p.id = v.profile_id
      where v.id = video_id and p.user_id = auth.uid()
    )
  );

drop policy if exists "Public read clips for public profiles" on public.clips;
create policy "Public read clips for public profiles"
  on public.clips for select
  using (
    exists (
      select 1
      from public.videos v
      join public.profiles p on p.id = v.profile_id
      where v.id = video_id and p.is_public = true
    )
  );

-- Let coaches play videos on public profiles
drop policy if exists "Public read videos of public profiles" on storage.objects;
create policy "Public read videos of public profiles"
  on storage.objects for select
  using (
    bucket_id = 'videos'
    and exists (
      select 1
      from public.videos v
      join public.profiles p on p.id = v.profile_id
      where v.storage_path = name
        and p.is_public = true
    )
  );
