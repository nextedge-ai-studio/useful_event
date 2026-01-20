-- 新增 youtube_url 欄位到 works 表
alter table public.works
add column if not exists youtube_url text;

-- 重新建立 view 以包含 youtube_url
drop view if exists public.works_with_votes;

create view public.works_with_votes as
select
  w.id,
  w.title,
  w.author_name,
  w.description,
  w.image_url,
  w.image_urls,
  w.youtube_url,
  w.demo_url,
  w.created_by,
  w.created_at,
  w.status,
  w.reviewed_by,
  w.reviewed_at,
  w.review_note,
  coalesce(count(v.id), 0)::int as vote_count
from public.works w
left join public.votes v on v.work_id = w.id
group by
  w.id,
  w.title,
  w.author_name,
  w.description,
  w.image_url,
  w.image_urls,
  w.youtube_url,
  w.demo_url,
  w.created_by,
  w.created_at,
  w.status,
  w.reviewed_by,
  w.reviewed_at,
  w.review_note;

-- 授權
grant select on public.works_with_votes to anon, authenticated;
