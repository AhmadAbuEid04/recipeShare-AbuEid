import { getRecipe } from './api.js';
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
      <h2>Ingredients</h2>
      <ul>${lines(r.ingredients).map((l) => `<li>${escapeHtml(l)}</li>`).join('')}</ul>
      <h2>Steps</h2>
      <ol>${lines(r.steps).map((l) => `<li>${escapeHtml(l)}</li>`).join('')}</ol>
    </article>`;
  useImageFallback(container);
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
