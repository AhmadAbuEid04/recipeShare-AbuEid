// Small DOM helpers shared by all pages.
import { DEMO_MODE } from './api.js';
import { escapeHtml, formatRating } from './recipes.js';

export const $ = (selector) => document.querySelector(selector);

export const PLACEHOLDER_IMG =
  'data:image/svg+xml,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 3"><rect width="4" height="3" fill="#e9e4dc"/>' +
    '<text x="2" y="1.75" font-size=".6" text-anchor="middle" fill="#a89f91">🍽</text></svg>');

/** Replace broken recipe images with a neutral placeholder. */
export function useImageFallback(root = document) {
  root.querySelectorAll('img[data-recipe-img]').forEach((img) => {
    img.addEventListener('error', () => { img.src = PLACEHOLDER_IMG; }, { once: true });
  });
}

export function cardHtml(r) {
  return `
    <a class="recipe-card" href="recipe.html?id=${encodeURIComponent(r.id)}">
      <img data-recipe-img src="${escapeHtml(r.image_url)}" alt="${escapeHtml(r.title)}" loading="lazy">
      <div class="recipe-card-body">
        <h3>${escapeHtml(r.title)}</h3>
        <p class="tags"><span class="tag">${escapeHtml(r.cuisine)}</span><span class="tag">${escapeHtml(r.category)}</span></p>
        <p class="rating" data-rating>${formatRating(r.avg_rating, r.rating_count)}</p>
      </div>
    </a>`;
}

export function optionsHtml(values, selected = '', placeholder = '') {
  const first = placeholder ? `<option value="">${escapeHtml(placeholder)}</option>` : '';
  return first + values.map((v) =>
    `<option value="${escapeHtml(v)}"${v === selected ? ' selected' : ''}>${escapeHtml(v)}</option>`).join('');
}

export function showDemoBanner() {
  if (!DEMO_MODE) return;
  const banner = document.createElement('p');
  banner.className = 'demo-banner';
  banner.textContent = 'Demo mode: no database configured, so data is saved only in this browser.';
  document.body.prepend(banner);
}

export function showError(container, error) {
  container.innerHTML = `<p class="error-box">Something went wrong: ${escapeHtml(error.message)}</p>`;
}
