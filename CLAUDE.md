# CLAUDE.md

## Purpose
RecipeShare: a website to share recipes from cuisines around the world, filter them by cuisine and
category, and rate them 1–5 stars. **`docs/spec.md` is the source of truth** for requirements and
acceptance criteria; `docs/plan.md` is the build plan. Keep both up to date as the project changes.

## Stack
- Frontend: plain HTML + CSS (Pico.css from CDN) + vanilla JavaScript ES modules. No framework, no bundler.
- Data: Supabase (Postgres + Auth + Storage) called from the browser with `@supabase/supabase-js`
  (pinned version from jsDelivr). Security rules live in the database (constraints + Row Level Security).
- Hosting: Vercel (static). Push to `main` deploys automatically.
- Tests: Node's built-in test runner (`node --test`). No test dependencies.

## Commands
- `npm run build` – copy `public/` to `dist/` and generate `dist/js/config.js` from env vars
  (`SUPABASE_URL`, `SUPABASE_ANON_KEY`; read from the environment or a local `.env`).
- `npm start` – build and serve `dist/` at http://localhost:3000.
- `npm test` – run all tests in `tests/`.
- Database: run `sql/schema.sql`, `sql/policies.sql`, then `sql/seed.sql` in the Supabase SQL editor.

## Layout
- `public/js/recipes.js` – pure logic (fixed lists, validation, filtering, averages). No DOM, no network.
  Anything testable belongs here.
- `public/js/api.js` – every Supabase call. Falls back to in-memory sample data when no config is set.
- `public/js/<page>.js` – one controller per HTML page.

## Rules
- Never commit secrets. Read them from environment variables; `.env` is git-ignored and
  `.env.example` lists names only. Never use the Supabase service-role key in frontend code.
- Cuisine and category are always drop-downs using the fixed lists in `recipes.js` (mirrored by CHECK
  constraints in `sql/schema.sql`).
- Enforce permissions in the database (RLS), not only in the UI.
- Add a test for each feature once it works, then run `npm test`.
- Small commits with clear messages; build Must features (M1–M7) before Should features.
