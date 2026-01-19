drop view if exists public.works_with_votes;

create view public.works_with_votes as
select
  w.*,
  coalesce(count(v.id), 0)::int as vote_count
from public.works w
left join public.votes v on v.work_id = w.id
group by w.id;
