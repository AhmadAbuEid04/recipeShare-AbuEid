import { getRecipe, rateRecipe } from './api.js';
import { escapeHtml, formatRating, lines } from './recipes.js';
import { $, showDemoBanner, showError, useImageFallback } from './ui.js';

showDemoBanner();

const id = new URLSearchParams(location.search).get('id');
const container = $('#recipe');

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
      <section class="rate-box">
        <h2>Rate this recipe</h2>
        <div class="stars" id="stars" role="group" aria-label="Rate from 1 to 5 stars">
          ${[1, 2, 3, 4, 5].map((n) =>
            `<button type="button" data-stars="${n}" aria-label="${n} star${n > 1 ? 's' : ''}">★</button>`).join('')}
        </div>
        <p id="rate-message" class="rating"></p>
      </section>
      <h2>Ingredients</h2>
      <ul>${lines(r.ingredients).map((l) => `<li>${escapeHtml(l)}</li>`).join('')}</ul>
      <h2>Steps</h2>
      <ol>${lines(r.steps).map((l) => `<li>${escapeHtml(l)}</li>`).join('')}</ol>
    </article>`;
  useImageFallback(container);
  setUpStars();
}

function setUpStars() {
  const buttons = [...container.querySelectorAll('#stars button')];
  const highlight = (n) => buttons.forEach((b) => b.classList.toggle('on', Number(b.dataset.stars) <= n));
  const message = $('#rate-message');

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
        message.textContent = `Thanks! You rated this ${n} star${n > 1 ? 's' : ''}.`;
        highlight(n);
      } catch (error) {
        message.textContent = `Could not save your rating: ${error.message}`;
        buttons.forEach((b) => { b.disabled = false; });
      }
    });
  });
  $('#stars').addEventListener('mouseleave', () => {
    if (!buttons[0].disabled) highlight(0);
  });
}

async function load() {
  try {
    const recipe = id ? await getRecipe(id) : null;
    if (!recipe) {
      container.innerHTML = '<h1>Recipe not found</h1><p><a href="index.html">← All recipes</a></p>';
      return;
    }
    render(recipe);
  } catch (error) {
    showError(container, error);
  }
}

load();
