
create table public.insights (
  id uuid primary key default gen_random_uuid(),
  end_year int,
  intensity int,
  sector text,
  topic text,
  insight text,
  url text,
  region text,
  start_year int,
  impact text,
  added timestamptz,
  published timestamptz,
  country text,
  relevance int,
  pestle text,
  source text,
  title text,
  likelihood int,
  city text,
  swot text,
  created_at timestamptz not null default now()
);

alter table public.insights enable row level security;

create policy "Insights are viewable by everyone"
  on public.insights for select
  using (true);

create policy "Authenticated users can insert insights"
  on public.insights for insert
  to authenticated
  with check (true);

create index idx_insights_country on public.insights(country);
create index idx_insights_region on public.insights(region);
create index idx_insights_topic on public.insights(topic);
create index idx_insights_sector on public.insights(sector);
