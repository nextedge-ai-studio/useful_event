alter table public.works
add column if not exists image_urls text[] not null default '{}';
