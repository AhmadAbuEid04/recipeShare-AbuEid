# RecipeShare

A website where people share recipes from cuisines around the world, find them by cuisine and category,
and rate the recipes they try.

**Live app:** https://recipeshare-abueid.vercel.app

Built for ECE 35400 with an AI coding agent. Requirements are in [docs/spec.md](docs/spec.md) and the
build plan is in [docs/plan.md](docs/plan.md).

## Tech stack
- **Frontend:** plain HTML, CSS ([Pico.css](https://picocss.com)), and vanilla JavaScript modules
- **Database:** [Supabase](https://supabase.com) Postgres, called from the browser with `supabase-js`;
  rules are enforced in the database with constraints and Row Level Security
- **Hosting:** Vercel. Every push to `main` deploys automatically
- **Tests:** Node's built-in test runner. **CI:** GitHub Actions runs the tests and the build on every push

## Run locally
Requires [Node.js 20+](https://nodejs.org).

```bash
npm install
cp .env.example .env      # fill in SUPABASE_URL and SUPABASE_ANON_KEY (optional, see below)
npm start                 # builds to dist/ and serves http://localhost:3000
```

Without a `.env`, the app runs in **demo mode**: it uses built-in sample recipes and saves changes only in
your browser. A yellow banner shows when demo mode is on.

## Run the tests
```bash
npm test
```

## Set up the database (Supabase)
1. Create a free Supabase project.
2. In **SQL Editor**, run `sql/schema.sql`, then `sql/policies.sql`, then `sql/seed.sql`.
3. From **Project Settings → API**, copy the Project URL and the `anon` public key into `.env` locally
   and into **Vercel → Project → Settings → Environment Variables** as `SUPABASE_URL` and `SUPABASE_ANON_KEY`.

The `anon` key is designed to be used in browsers; access is controlled by Row Level Security.
The `service_role` key is never used and must never be committed.

## Project structure
```
public/          HTML pages, CSS, and JavaScript (copied to dist/ by the build)
  js/recipes.js  pure logic: fixed lists, validation, filtering, averages (unit-tested)
  js/api.js      all database calls (Supabase, or demo data)
scripts/build.js build: copies public/ to dist/ and writes config.js from env vars
sql/             database schema, security policies, sample data
tests/           unit tests (npm test)
```

## Feature checklist

### Must
| ID | Feature | Status |
|---|---|---|
| M1 | Browse recipe cards (photo, title, cuisine, category, average rating) | ✅ Done |
| M2 | Recipe detail page with all fields and author | ✅ Done |
| M3 | Add a recipe; missing fields are named and nothing is saved | ✅ Done |
| M4 | Filter by cuisine and category; Clear; "No recipes found" | ✅ Done |
| M5 | 1–5 star rating updates average and count on card and detail | ✅ Done |
| M6 | Data saved in a database (Supabase) | ✅ Done |
| M7 | Sample data in the live app (6 recipes, 6 cuisines) | ✅ Done |

### Should
| ID | Feature | Status |
|---|---|---|
| S1 | Google sign-in, profile page | ⬜ Not done |
| S2 | Edit/delete own recipes | ⬜ Not done |
| S3 | Fair ratings | ⬜ Not done |
| S4 | Photo upload | ⬜ Not done |
| S5 | Keyword search | ⬜ Not done |
| S6 | Sort by newest / highest rated | ⬜ Not done |

### Could
| Feature | Status |
|---|---|
| Phone-friendly layout | 🟡 Responsive grid and forms; to be checked on a phone |

## Tests
| File | Feature checked |
|---|---|
| `tests/display.test.js` | M1/M2: rating text, ingredient/step lines, HTML escaping |
| `tests/validation.test.js` | M3: required fields, fixed lists, prep time, image URL |
| `tests/filter.test.js` | M4: cuisine + category filter, cleared filters, no matches |
| `tests/rating.test.js` | M5: average rating calculation and display |
