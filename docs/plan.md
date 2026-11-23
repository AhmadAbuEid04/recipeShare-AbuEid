# RecipeShare — 1-day build plan (HTML/CSS/JS + Supabase + Vercel)

## Context
ECE 35400 final activity: build RecipeShare (docs/spec.md), live on Vercel with a Supabase DB.
Deadline **Tue 11/24/2026 12:00 PM** (today 11/23); any push after it is penalized. Grading is on the live
app: Must 50%, Engineering 25%, Should/Could 25%. Strategy: deploy early, finish M1–M7 + E1–E7, then
Should features in point order. Java/JavaFX ruled out (Vercel can't run Java; JavaFX isn't a web app).

**Repo issue:** `/Users/ahmad0512/recipeshare-AbuEid` is empty and git there resolves to a repo rooted at
the *home directory*. Do not use it — Step 0 clones a fresh repo so the folder has its own `.git`.

## Stack
| Layer | Choice |
|---|---|
| Frontend | Plain HTML + CSS (Pico.css via CDN) + vanilla ES modules |
| Data/API | `@supabase/supabase-js@2` loaded from jsDelivr (pinned version), browser talks to Supabase directly |
| DB | Supabase Postgres; constraints + Row Level Security (RLS) enforce rules server-side |
| Auth (S1) | Supabase Auth Google provider |
| Uploads (S4) | Supabase Storage public bucket `recipe-images` |
| Tests | `node --test` (built into Node 20, zero deps) → `npm test` |
| Build | `npm run build`: `scripts/build.js` copies `public/` → `dist/` and writes `config.js` from env vars |
| CI | GitHub Actions: `npm ci` → `npm test` → `npm run build` |
| CD | Vercel GitHub integration; output dir `dist`, build cmd `npm run build` |

Supabase URL + **anon** key are public by design (they end up in the browser); they're still injected from
Vercel env vars at build time so nothing is committed. The service-role key is never used in the frontend.

## Layout
```
public/index.html      # cards, cuisine/category filters, keyword, sort
public/recipe.html     # detail (?id=), star rating, edit/delete for owner
public/add.html        # add + edit form (?id= for edit)
public/profile.html    # my recipes (S1)
public/css/style.css
public/js/recipes.js   # PURE: CUISINES, CATEGORIES, validateRecipe(), filterRecipes(), average(), formatRating()
public/js/api.js       # Supabase calls (list, get, insert, update, delete, rate, upload)
public/js/auth.js      # sign in/out, current user, header widget
public/js/{home,detail,form,profile}.js  # page controllers
scripts/build.js
sql/schema.sql  sql/seed.sql  sql/policies.sql
tests/validation.test.js tests/filter.test.js tests/rating.test.js
package.json  .env.example  .gitignore  CLAUDE.md  docs/spec.md  docs/plan.md  README.md
.github/workflows/ci.yml
```

## Database (sql/schema.sql)
- `recipes(id bigserial pk, author_name text not null, title text not null, cuisine text not null check in (...10),
  category text not null check in (...8), ingredients text not null, steps text not null,
  prep_minutes int not null check > 0, image_url text not null, user_id uuid null references auth.users,
  created_at timestamptz default now())`
- `ratings(id, recipe_id fk on delete cascade, stars int check 1..5, user_id uuid null, created_at)`
- view `recipe_cards` = recipes + `round(avg(stars),1) avg_rating` + `count(ratings) rating_count`
  (used by home and detail, so card and detail always agree — M5).
- Filtering/sort done in the query: `.eq('cuisine')`, `.eq('category')`, `.or('title.ilike.%kw%,ingredients.ilike.%kw%')`,
  `.order('created_at' | 'avg_rating', {nullsFirst:false})`.

## Build order (commit + push after every step)

**Step 0 — Setup (20 min) — E1, E2, E6**
New public GitHub repo `recipeshare-AbuEid` → `git clone` into a fresh folder. Add `docs/spec.md`,
`.gitignore` (`node_modules`, `dist`, `.env`), `.env.example` (`SUPABASE_URL`, `SUPABASE_ANON_KEY`),
`package.json` scripts (`test`, `build`), `CLAUDE.md` (purpose, stack, commands, rules: no secrets, env vars,
test per feature, spec is source of truth), `docs/plan.md` (this plan). Push.

**Step 1 — M1 + M2 with in-memory sample array, deploy (1 h) — E5**
Home card grid (photo, title, cuisine, category, avg rating), card links to `recipe.html?id=`, detail shows
every field + author. Import repo into Vercel (Hobby). Confirm `*.vercel.app` works.

**Step 2 — Supabase + M6 + M7 (1 h)**
Create Supabase project (free, no card). Run schema + seed (≥4 recipes with different cuisines/categories,
incl. Iranian/Main Dish; free-license food photo links). Set env vars locally and in Vercel. Swap array for
`api.js`. Initial RLS: public select; public insert on recipes/ratings (tightened in S1–S3).
Check: add on laptop → visible on phone; redeploy → still there.

**Step 3 — M3 add form (1 h)**
Dropdowns rendered from `CUISINES`/`CATEGORIES`. `validateRecipe()` returns `{field: "Title is required", ...}`;
show messages next to fields; don't call insert when errors exist. DB NOT NULL/CHECKs are the backstop.
On success redirect to home. Test: `validation.test.js`.

**Step 4 — M4 filters (45 min)**
Two selects + Clear button; state in URL query (`?cuisine=Iranian&category=Main+Dish`); show
"No recipes found" on empty. Test: `filter.test.js` on pure `filterRecipes()` (also used for in-memory fallback).

**Step 5 — M5 rating (45 min)**
5 clickable stars on detail; insert rating, re-fetch from `recipe_cards`, update avg + count.
Test: `rating.test.js` for `average()` ([5,4,3]→4.0, []→no ratings).

**Step 6 — CI + README (30 min) — E3, E4, E7**
`ci.yml` on push/PR (Node 20): `npm ci && npm test && npm run build`. README: live URL, run locally
(`npm run build && npx serve dist`), tests (`npm test`), M/S/Could checklist. Confirm green check.

**Checkpoint: all Must + Engineering done (~5–6 h). Below is extra.**

**Step 7 — S5 keyword + S6 sort (45 min, 5 pts)** — keyword box + sort select (Newest / Highest rated).

**Step 8 — S1 Google sign-in (1 h, 6 pts)** — Google Cloud OAuth client; redirect URI = Supabase callback
(`https://<proj>.supabase.co/auth/v1/callback`); add `http://localhost:3000` and the vercel.app URL to
Supabase Auth → URL config. Header sign in/out; when signed in author name = Google name (field locked),
`user_id` saved; `profile.html` lists `user_id = me`.

**Step 9 — S2 edit/delete own (45 min, 4 pts)** — RLS: `update/delete using (auth.uid() = user_id)`.
Edit/Delete buttons only shown to owner; direct API calls by others are rejected by RLS.

**Step 10 — S3 fair ratings (45 min, 3 pts)** — RLS: insert/update ratings only when `auth.uid() is not null`
and user isn't the recipe author; `unique(recipe_id, user_id)`; client uses `upsert` so re-rating replaces.

**Step 11 — S4 upload (45 min, 3 pts)** — file input alternative to URL; upload to `recipe-images`
bucket (insert policy: authenticated), store public URL in `image_url`.

**Step 12 — Could (max 4 pts)** — phone-friendly layout (responsive grid) + dietary tags filter or servings
scaler; describe in README.

**Final (before ~10 AM Tue):** update README checklist + `docs/plan.md`, last push, verify live app, submit
on Brightspace.

## Verification
- `npm test` passes locally and in GitHub Actions (≥3 tests).
- On the live URL, walk each acceptance criterion: cards; detail; empty form shows missing field and saves
  nothing; Iranian + Main Dish filter; Clear shows all; "No recipes found"; rating updates card + detail;
  second device sees new recipe; redeploy keeps data.
- S2 check: call `supabase.from('recipes').delete().eq('id', <other user's>)` from the browser console as a
  different user → 0 rows affected.
- `git log -p | grep -iE "service_role|eyJ|password"` shows nothing (E6).
