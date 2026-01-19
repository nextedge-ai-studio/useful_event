alter table public.works
add column if not exists status text not null default 'pending',
add column if not exists reviewed_by uuid references auth.users (id) on delete set null,
add column if not exists reviewed_at timestamptz,
add column if not exists review_note text;

alter table public.works
drop constraint if exists works_status_check;

alter table public.works
add constraint works_status_check
check (status in ('pending', 'approved', 'rejected'));

create policy "Approved works are viewable by everyone"
on public.works
for select
using (status = 'approved');

create policy "Owners can view their own submissions"
on public.works
for select
using (created_by = auth.uid());
