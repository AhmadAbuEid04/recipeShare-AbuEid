import { DEMO_MODE, getMyRating, getRecipe, rateRecipe } from './api.js';
import { renderNav, signIn } from './auth.js';
import { escapeHtml, formatRating, lines, ratingBlockReason } from './recipes.js';
import { $, showDemoBanner, showError, useImageFallback } from './ui.js';

showDemoBanner();

const id = new URLSearchParams(location.search).get('id');
const container = $('#recipe');
const starLabel = (n) => `${n} star${n > 1 ? 's' : ''}`;

function render(r) {
  document.title = `${r.title} · RecipeShare`;
  container.innerHTML = `
    <p><a href="index.html">← All recipes</a></p>
    <article class="recipe-detail">
      <img data-recipe-img class="hero" src="${escapeHtml(r.image_url)}" alt="${escapeHtml(r.title)}">
      <hgroup>
        <h1>${escapeHtml(r.title)}</h1>
        <p>by <strong>${escapeHtml(r.author_name)}</strong></p>
      </hgroup>
      <dl class="facts">
        <div><dt>Cuisine</dt><dd>${escapeHtml(r.cuisine)}</dd></div>
        <div><dt>Category</dt><dd>${escapeHtml(r.category)}</dd></div>
        <div><dt>Prep time</dt><dd>${escapeHtml(r.prep_minutes)} min</dd></div>
        <div><dt>Rating</dt><dd id="rating-summary">${formatRating(r.avg_rating, r.rating_count)}</dd></div>
      </dl>
      <section class="rate-box" id="rate-box">
        <h2>Rate this recipe</h2>
        <p class="rating" aria-busy="true">Checking your account…</p>
      </section>
      <h2>Ingredients</h2>
      <ul>${lines(r.ingredients).map((l) => `<li>${escapeHtml(l)}</li>`).join('')}</ul>
      <h2>Steps</h2>
      <ol>${lines(r.steps).map((l) => `<li>${escapeHtml(l)}</li>`).join('')}</ol>
    </article>`;
  useImageFallback(container);
}

/** Show the right rating control: sign-in prompt, "your own recipe" note, or the stars (S3). */
async function renderRateBox(recipe, user) {
  const box = $('#rate-box');
  const reason = DEMO_MODE ? null : ratingBlockReason(user, recipe);

  if (reason === 'signed-out') {
    box.innerHTML = `<h2>Rate this recipe</h2>
      <p>Sign in to rate. Each person can rate a recipe once (rating again changes it).</p>
      <button type="button" id="rate-sign-in" class="outline">Sign in with Google to rate</button>`;
    $('#rate-sign-in').addEventListener('click', () => signIn());
    return;
  }
  if (reason === 'own-recipe') {
    box.innerHTML = `<h2>Rate this recipe</h2><p class="rating">This is your recipe, so you can't rate it.</p>`;
    return;
  }

  let mine = DEMO_MODE ? null : await getMyRating(id);
  box.innerHTML = `<h2>${mine ? 'Your rating' : 'Rate this recipe'}</h2>
    <div class="stars" id="stars" role="group" aria-label="Rate from 1 to 5 stars">
      ${[1, 2, 3, 4, 5].map((n) =>
        `<button type="button" data-stars="${n}" aria-label="${starLabel(n)}">★</button>`).join('')}
    </div>
    <p id="rate-message" class="rating">${mine ? `You rated this ${starLabel(mine)}. Click a star to change it.` : ''}</p>`;

  const buttons = [...box.querySelectorAll('#stars button')];
  const highlight = (n) => buttons.forEach((b) => b.classList.toggle('on', Number(b.dataset.stars) <= n));
  const message = $('#rate-message');
  highlight(mine ?? 0);

  buttons.forEach((button) => {
    const n = Number(button.dataset.stars);
    button.addEventListener('mouseenter', () => highlight(n));
    button.addEventListener('focus', () => highlight(n));
    button.addEventListener('click', async () => {
      buttons.forEach((b) => { b.disabled = true; });
      message.textContent = 'Saving…';
      try {
        await rateRecipe(id, n);
        const updated = await getRecipe(id);
        $('#rating-summary').textContent = formatRating(updated.avg_rating, updated.rating_count);
        message.textContent = mine
          ? `Updated! You now rate this ${starLabel(n)}.`
          : `Thanks! You rated this ${starLabel(n)}.`;
        mine = n;
      } catch (error) {
        message.textContent = `Could not save your rating: ${error.message}`;
      } finally {
        buttons.forEach((b) => { b.disabled = false; });
        highlight(mine ?? 0);
      }
    });
  });
  $('#stars').addEventListener('mouseleave', () => highlight(mine ?? 0));
}

async function load() {
  try {
    const [recipe, user] = await Promise.all([id ? getRecipe(id) : null, renderNav()]);
    if (!recipe) {
      container.innerHTML = '<h1>Recipe not found</h1><p><a href="index.html">← All recipes</a></p>';
      return;
    }
    render(recipe);
    await renderRateBox(recipe, user);
  } catch (error) {
    showError(container, error);
  }
}

load();
