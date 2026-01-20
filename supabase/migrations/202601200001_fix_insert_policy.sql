drop policy if exists "Authenticated can submit works" on public.works;

create policy "Authenticated can submit works"
on public.works
for insert
with check (created_by = auth.uid());
