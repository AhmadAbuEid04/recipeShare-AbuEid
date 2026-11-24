// Profile page (S1): the signed-in user's recipes and rating history.
import { DEMO_MODE, listMyRatings, listMyRecipes } from './api.js';
import { renderNav, signIn } from './auth.js';
import { displayName, escapeHtml } from './recipes.js';
import { $, cardHtml, showDemoBanner, showError, useImageFallback } from './ui.js';

showDemoBanner();
const container = $('#profile');

const stars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);
const date = (iso) => new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

function ratingsTable(ratings) {
  if (!ratings.length) return '<p class="rating">You haven\'t rated any recipes yet.</p>';
  return `<div class="overflow-auto"><table class="striped">
    <thead><tr><th>Recipe</th><th>Your rating</th><th>Rated on</th></tr></thead>
    <tbody>${ratings.map((r) => `<tr>
      <td>${r.recipe ? `<a href="recipe.html?id=${encodeURIComponent(r.recipe.id)}">${escapeHtml(r.recipe.title)}</a>
        <br><small class="rating">${escapeHtml(r.recipe.cuisine)} · ${escapeHtml(r.recipe.category)}</small>` : '<em>Deleted recipe</em>'}</td>
      <td class="stars-text" aria-label="${r.stars} of 5 stars">${stars(r.stars)}</td>
      <td>${date(r.updated_at)}</td></tr>`).join('')}
    </tbody></table></div>`;
}

async function load() {
  try {
    const user = await renderNav();
    if (DEMO_MODE || !user) {
      container.innerHTML = `<h1>My profile</h1>
        <p>Sign in with Google to see your recipes and your rating history.</p>
        ${DEMO_MODE ? '' : '<button type="button" id="profile-sign-in">Sign in with Google</button>'}`;
      $('#profile-sign-in')?.addEventListener('click', () => signIn());
      return;
    }

    const [recipes, ratings] = await Promise.all([listMyRecipes(user.id), listMyRatings(user.id)]);
    const avatar = user.user_metadata?.avatar_url;
    container.innerHTML = `
      <hgroup class="profile-head">
        ${avatar ? `<img class="avatar" src="${escapeHtml(avatar)}" alt="" referrerpolicy="no-referrer">` : ''}
        <div><h1>${escapeHtml(displayName(user))}</h1><p>${escapeHtml(user.email ?? '')}</p></div>
      </hgroup>

      <h2>My recipes <small class="rating">(${recipes.length})</small></h2>
      ${recipes.length
        ? `<section class="recipe-grid">${recipes.map(cardHtml).join('')}</section>`
        : '<p class="rating">You haven\'t added any recipes yet. <a href="add.html">Add your first recipe</a>.</p>'}

      <h2 class="section-gap">My ratings <small class="rating">(${ratings.length})</small></h2>
      ${ratingsTable(ratings)}`;
    useImageFallback(container);
  } catch (error) {
    showError(container, error);
  }
}

load();
