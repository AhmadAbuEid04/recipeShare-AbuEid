// All data access lives here. With Supabase configured (dist/js/config.js), data goes to the database.
// Without it (local demo), data is kept in this browser's localStorage, seeded from sample-data.js.
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';
import { SAMPLE_RECIPES } from './sample-data.js';
import { average, cleanKeyword, filterRecipes, sortRecipes } from './recipes.js';

export const DEMO_MODE = !(SUPABASE_URL && SUPABASE_ANON_KEY);

let clientPromise;
export function supabase() {
  clientPromise ??= import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm')
    .then(({ createClient }) => createClient(SUPABASE_URL, SUPABASE_ANON_KEY));
  return clientPromise;
}

function check({ data, error }) {
  if (error) throw new Error(error.message);
  return data;
}

// ---------- demo-mode store ----------
const DEMO_KEY = 'recipeshare-demo';
function demoLoad() {
  try {
    const saved = JSON.parse(localStorage.getItem(DEMO_KEY));
    if (Array.isArray(saved)) return saved;
  } catch { /* fall through to sample data */ }
  return structuredClone(SAMPLE_RECIPES);
}
function demoSave(list) {
  try { localStorage.setItem(DEMO_KEY, JSON.stringify(list)); } catch { /* ignore */ }
}
function withStats(r) {
  return { ...r, avg_rating: average(r.ratings), rating_count: r.ratings.length };
}

// ---------- public API ----------

/** List recipe cards (with avg_rating and rating_count) matching the filters. */
export async function listRecipes({ cuisine = '', category = '', keyword = '', sort = 'newest' } = {}) {
  if (DEMO_MODE) {
    return sortRecipes(filterRecipes(demoLoad().map(withStats), { cuisine, category, keyword }), sort);
  }
  const db = await supabase();
  let query = db.from('recipe_cards').select('*');
  if (cuisine) query = query.eq('cuisine', cuisine);
  if (category) query = query.eq('category', category);
  const kw = cleanKeyword(keyword);
  if (kw) query = query.or(`title.ilike.%${kw}%,ingredients.ilike.%${kw}%`);
  query = sort === 'rating'
    ? query.order('avg_rating', { ascending: false, nullsFirst: false })
        .order('rating_count', { ascending: false })
    : query.order('created_at', { ascending: false });
  return check(await query);
}

/** One recipe with avg_rating and rating_count, or null if it does not exist. */
export async function getRecipe(id) {
  if (DEMO_MODE) {
    const r = demoLoad().find((x) => String(x.id) === String(id));
    return r ? withStats(r) : null;
  }
  const db = await supabase();
  return check(await db.from('recipe_cards').select('*').eq('id', id).maybeSingle());
}

/** Insert a validated recipe and return its id. */
export async function createRecipe(recipe) {
  if (DEMO_MODE) {
    const list = demoLoad();
    const id = Math.max(0, ...list.map((r) => r.id)) + 1;
    list.push({ ...recipe, id, ratings: [], created_at: new Date().toISOString() });
    demoSave(list);
    return id;
  }
  const db = await supabase();
  const row = check(await db.from('recipes').insert(recipe).select('id').single());
  return row.id;
}

/** The signed-in user, or null (always null in demo mode). */
export async function currentUser() {
  if (DEMO_MODE) return null;
  const db = await supabase();
  const { data } = await db.auth.getSession();
  return data.session?.user ?? null;
}

/**
 * Save a 1–5 star rating. Signed-in users have one rating per recipe: rating again replaces it (S3).
 * The database rejects ratings from visitors and from the recipe's own author.
 */
export async function rateRecipe(recipeId, stars) {
  if (DEMO_MODE) {
    const list = demoLoad();
    list.find((r) => String(r.id) === String(recipeId)).ratings.push(stars);
    demoSave(list);
    return;
  }
  const db = await supabase();
  const user = await currentUser();
  if (!user) throw new Error('Please sign in to rate recipes.');
  check(await db.from('ratings')
    .upsert({ recipe_id: Number(recipeId), stars, user_id: user.id }, { onConflict: 'recipe_id,user_id' }));
}

/** The signed-in user's stars for a recipe, or null. */
export async function getMyRating(recipeId) {
  const user = await currentUser();
  if (!user) return null;
  const db = await supabase();
  const row = check(await db.from('ratings').select('stars')
    .eq('recipe_id', recipeId).eq('user_id', user.id).maybeSingle());
  return row?.stars ?? null;
}

/** Recipes written by a user, newest first. */
export async function listMyRecipes(userId) {
  const db = await supabase();
  return check(await db.from('recipe_cards').select('*')
    .eq('user_id', userId).order('created_at', { ascending: false }));
}

/** A user's rating history, most recently rated first. */
export async function listMyRatings(userId) {
  const db = await supabase();
  return check(await db.from('ratings')
    .select('stars, updated_at, recipe:recipes(id, title, image_url, cuisine, category)')
    .eq('user_id', userId).order('updated_at', { ascending: false }));
}
