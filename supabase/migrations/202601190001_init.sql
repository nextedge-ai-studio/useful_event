create extension if not exists "pgcrypto";

create table if not exists public.works (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author_name text not null,
  description text not null,
  image_url text,
  demo_url text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  work_id uuid not null references public.works (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (work_id, user_id)
);

create or replace view public.works_with_votes as
select
  w.*,
  coalesce(count(v.id), 0)::int as vote_count
from public.works w
left join public.votes v on v.work_id = w.id
group by w.id;

alter table public.works enable row level security;
alter table public.votes enable row level security;

create policy "Works are viewable by everyone"
on public.works
for select
using (true);

create policy "Authenticated can submit works"
on public.works
for insert
with check (auth.uid() is not null);

create policy "Owners can update their works"
on public.works
for update
using (created_by = auth.uid())
with check (created_by = auth.uid());

create policy "Owners can delete their works"
on public.works
for delete
using (created_by = auth.uid());

create policy "Votes are viewable by everyone"
on public.votes
for select
using (true);

create policy "Authenticated can vote"
on public.votes
for insert
with check (auth.uid() = user_id);

create policy "Users can unvote their own votes"
on public.votes
for delete
using (auth.uid() = user_id);
