-- RecipeShare database schema. Run in the Supabase SQL editor (safe to re-run).

create table if not exists public.recipes (
  id           bigint generated always as identity primary key,
  author_name  text not null check (length(trim(author_name)) > 0),
  title        text not null check (length(trim(title)) > 0),
  cuisine      text not null check (cuisine in
                 ('American','Arabic','Chinese','German','Indian','Iranian','Italian','Japanese','Mexican','Other')),
  category     text not null check (category in
                 ('Breakfast','Main Dish','Fast Food','Soup','Salad','Dessert','Snack','Drink')),
  ingredients  text not null check (length(trim(ingredients)) > 0),
  steps        text not null check (length(trim(steps)) > 0),
  prep_minutes integer not null check (prep_minutes > 0),
  image_url    text not null check (image_url ~ '^https?://'),
  user_id      uuid references auth.users (id) on delete set null,   -- set when signed in (S1)
  created_at   timestamptz not null default now()
);

create table if not exists public.ratings (
  id         bigint generated always as identity primary key,
  recipe_id  bigint not null references public.recipes (id) on delete cascade,
  stars      smallint not null check (stars between 1 and 5),
  user_id    uuid references auth.users (id) on delete cascade,       -- set when signed in (S3)
  created_at timestamptz not null default now()
);

create index if not exists ratings_recipe_id_idx on public.ratings (recipe_id);
create index if not exists recipes_created_at_idx on public.recipes (created_at desc);

-- One row per recipe with its average rating (1 decimal) and number of ratings.
-- security_invoker makes the view respect the RLS policies of the person querying it.
create or replace view public.recipe_cards with (security_invoker = true) as
select r.*,
       round(avg(rt.stars)::numeric, 1)::float8 as avg_rating,
       count(rt.id)::int                         as rating_count
from public.recipes r
left join public.ratings rt on rt.recipe_id = r.id
group by r.id;

grant select on public.recipe_cards to anon, authenticated;
