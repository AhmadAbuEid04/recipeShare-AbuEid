-- Accounts (S1), fair ratings (S3), and owner-only edit/delete (S2). Run after policies.sql. Safe to re-run.

-- ---------- recipes: link to the signed-in author ----------
alter table public.recipes alter column user_id set default auth.uid();

drop policy if exists "anyone can add a recipe" on public.recipes;
drop policy if exists "add a recipe as yourself or as a visitor" on public.recipes;
create policy "add a recipe as yourself or as a visitor" on public.recipes
  for insert with check (user_id is null or user_id = auth.uid());

-- S2: only the author can change or delete a recipe (enforced even for direct API requests).
grant update, delete on public.recipes to authenticated;
drop policy if exists "authors update own recipes" on public.recipes;
create policy "authors update own recipes" on public.recipes
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "authors delete own recipes" on public.recipes;
create policy "authors delete own recipes" on public.recipes
  for delete to authenticated using (user_id = auth.uid());

-- ---------- ratings: one per user per recipe, signed-in only, not on your own recipe ----------
alter table public.ratings add column if not exists updated_at timestamptz not null default now();

do $$ begin
  alter table public.ratings add constraint ratings_one_per_user unique (recipe_id, user_id);
exception when duplicate_table or duplicate_object then null; end $$;

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end $$;
drop trigger if exists ratings_touch on public.ratings;
create trigger ratings_touch before update on public.ratings
  for each row execute function public.touch_updated_at();

-- True when the current user wrote the recipe (security definer so the check always sees the row).
create or replace function public.is_own_recipe(p_recipe_id bigint) returns boolean
  language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.recipes where id = p_recipe_id and user_id = auth.uid());
$$;

revoke insert on public.ratings from anon;
grant insert, update on public.ratings to authenticated;

drop policy if exists "anyone can rate" on public.ratings;
drop policy if exists "signed-in users rate others' recipes" on public.ratings;
create policy "signed-in users rate others' recipes" on public.ratings
  for insert to authenticated
  with check (user_id = auth.uid() and not public.is_own_recipe(recipe_id));

drop policy if exists "users change their own rating" on public.ratings;
create policy "users change their own rating" on public.ratings
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid() and not public.is_own_recipe(recipe_id));
