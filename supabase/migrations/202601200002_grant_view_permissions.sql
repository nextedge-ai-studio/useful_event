-- 給 anon 和 authenticated 角色查看 view 的權限
grant select on public.works_with_votes to anon, authenticated;

-- 給 votes 表的查詢權限（view 需要）
grant select on public.votes to anon, authenticated;
grant select on public.works to anon, authenticated;
