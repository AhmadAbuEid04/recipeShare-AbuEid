-- Row Level Security for the Must features: anyone can read, add recipes, and rate.
-- (Tightened later for S1–S3: signed-in authors, owner-only edit/delete, fair ratings.)

alter table public.recipes enable row level security;
alter table public.ratings enable row level security;

grant select, insert on public.recipes to anon, authenticated;
grant select, insert on public.ratings to anon, authenticated;

drop policy if exists "recipes are public" on public.recipes;
create policy "recipes are public" on public.recipes for select using (true);

drop policy if exists "anyone can add a recipe" on public.recipes;
create policy "anyone can add a recipe" on public.recipes for insert with check (true);

drop policy if exists "ratings are public" on public.ratings;
create policy "ratings are public" on public.ratings for select using (true);

drop policy if exists "anyone can rate" on public.ratings;
create policy "anyone can rate" on public.ratings for insert with check (true);
