create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  body text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

alter table public.notifications enable row level security;

create policy "Users can read their own notifications"
on public.notifications
for select
using (auth.uid() = user_id);

create policy "Users can create their own notifications"
on public.notifications
for insert
with check (auth.uid() = user_id);

create policy "Users can update their own notifications"
on public.notifications
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
