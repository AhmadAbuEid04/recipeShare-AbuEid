// Pure recipe logic: no DOM, no network. Everything here is unit-tested in tests/.

export const CUISINES = [
  'American', 'Arabic', 'Chinese', 'German', 'Indian',
  'Iranian', 'Italian', 'Japanese', 'Mexican', 'Other',
];

export const CATEGORIES = [
  'Breakfast', 'Main Dish', 'Fast Food', 'Soup', 'Salad', 'Dessert', 'Snack', 'Drink',
];

export const SORTS = { newest: 'Newest', rating: 'Highest rated' };

// Form fields in display order, with the label used in error messages.
export const FIELDS = [
  ['author_name', 'Author name'],
  ['title', 'Title'],
  ['cuisine', 'Cuisine'],
  ['category', 'Category'],
  ['ingredients', 'Ingredients'],
  ['steps', 'Steps'],
  ['prep_minutes', 'Prep time (minutes)'],
  ['image_url', 'Image link (URL)'],
];

/**
 * Validate raw form input.
 * @returns {{ ok: boolean, errors: Record<string,string>, recipe: object }}
 *   errors maps field name -> message; recipe holds the cleaned values.
 */
export function validateRecipe(input = {}) {
  const errors = {};
  const recipe = {};

  for (const [field, label] of FIELDS) {
    const value = String(input[field] ?? '').trim();
    if (value === '') errors[field] = `${label} is required`;
    recipe[field] = value;
  }

  if (!errors.cuisine && !CUISINES.includes(recipe.cuisine)) {
    errors.cuisine = 'Choose a cuisine from the list';
  }
  if (!errors.category && !CATEGORIES.includes(recipe.category)) {
    errors.category = 'Choose a category from the list';
  }
  if (!errors.prep_minutes) {
    const minutes = Number(recipe.prep_minutes);
    if (!Number.isInteger(minutes) || minutes <= 0) {
      errors.prep_minutes = 'Prep time must be a whole number of minutes greater than 0';
    } else {
      recipe.prep_minutes = minutes;
    }
  }
  if (!errors.image_url && !isHttpUrl(recipe.image_url)) {
    errors.image_url = 'Image link must be a web address starting with http:// or https://';
  }

  return { ok: Object.keys(errors).length === 0, errors, recipe };
}

export function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/** Average of 1–5 star ratings, rounded to 1 decimal. Returns null when there are none. */
export function average(stars = []) {
  if (stars.length === 0) return null;
  const sum = stars.reduce((total, s) => total + Number(s), 0);
  return Math.round((sum / stars.length) * 10) / 10;
}

/** Human-readable rating text used on cards and the detail page. */
export function formatRating(avg, count) {
  if (!count) return 'No ratings yet';
  const word = count === 1 ? 'rating' : 'ratings';
  return `★ ${Number(avg).toFixed(1)} (${count} ${word})`;
}

/**
 * Filter recipes by cuisine, category, and keyword (title or ingredients).
 * Empty values mean "no filter". Mirrors the database query in api.js.
 */
export function filterRecipes(recipes, { cuisine = '', category = '', keyword = '' } = {}) {
  const kw = keyword.trim().toLowerCase();
  return recipes.filter((r) =>
    (!cuisine || r.cuisine === cuisine) &&
    (!category || r.category === category) &&
    (!kw || r.title.toLowerCase().includes(kw) || r.ingredients.toLowerCase().includes(kw)));
}

/** Sort a copy of the list: 'rating' = highest average first (unrated last), otherwise newest first. */
export function sortRecipes(recipes, sort = 'newest') {
  const copy = [...recipes];
  if (sort === 'rating') {
    return copy.sort((a, b) =>
      (b.avg_rating ?? -1) - (a.avg_rating ?? -1) ||
      (b.rating_count ?? 0) - (a.rating_count ?? 0));
  }
  return copy.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

/** Remove characters that have special meaning in Supabase .or() filters. */
export function cleanKeyword(keyword = '') {
  return keyword.replace(/[,()%*\\]/g, ' ').trim();
}

/** Split a multi-line text field into non-empty lines. */
export function lines(text = '') {
  return text.split('\n').map((l) => l.trim()).filter(Boolean);
}

export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/** Name to show for a signed-in Supabase user (Google full name, else email prefix). */
export function displayName(user) {
  if (!user) return '';
  const meta = user.user_metadata ?? {};
  return (meta.full_name || meta.name || (user.email ?? '').split('@')[0] || 'Cook').trim();
}

/**
 * Why a user may not rate a recipe (S3), or null when they may.
 * 'signed-out' – visitors must sign in; 'own-recipe' – authors cannot rate their own recipes.
 */
export function ratingBlockReason(user, recipe) {
  if (!user) return 'signed-out';
  if (recipe?.user_id && recipe.user_id === user.id) return 'own-recipe';
  return null;
}

/** True when the signed-in user wrote this recipe (S2: may edit/delete it). */
export function isOwner(user, recipe) {
  return Boolean(user && recipe?.user_id && recipe.user_id === user.id);
}
