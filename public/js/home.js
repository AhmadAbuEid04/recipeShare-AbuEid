import { listRecipes } from './api.js';
import { CATEGORIES, CUISINES } from './recipes.js';
import { $, cardHtml, optionsHtml, showDemoBanner, showError, useImageFallback } from './ui.js';

showDemoBanner();

const form = $('#filters');
const container = $('#recipes');
const FILTER_KEYS = ['cuisine', 'category'];

// Filters live in the URL (?cuisine=Iranian&category=Main+Dish) so results can be shared and survive reloads.
function readFilters() {
  const params = new URLSearchParams(location.search);
  return Object.fromEntries(FILTER_KEYS.map((k) => [k, params.get(k) ?? '']));
}

function writeFilters(filters) {
  const params = new URLSearchParams();
  for (const k of FILTER_KEYS) if (filters[k]) params.set(k, filters[k]);
  const query = params.toString();
  history.replaceState(null, '', query ? `?${query}` : location.pathname);
}

function fillForm(filters) {
  $('#f-cuisine').innerHTML = optionsHtml(CUISINES, filters.cuisine, 'All cuisines');
  $('#f-category').innerHTML = optionsHtml(CATEGORIES, filters.category, 'All categories');
}

let requestId = 0;
async function render() {
  const filters = readFilters();
  const current = ++requestId;
  container.setAttribute('aria-busy', 'true');
  try {
    const recipes = await listRecipes(filters);
    if (current !== requestId) return; // a newer request finished first
    container.innerHTML = recipes.length
      ? recipes.map(cardHtml).join('')
      : '<p class="empty">No recipes found</p>';
    $('#result-count').textContent =
      recipes.length ? `${recipes.length} recipe${recipes.length === 1 ? '' : 's'}` : '';
    useImageFallback(container);
  } catch (error) {
    showError(container, error);
  } finally {
    container.removeAttribute('aria-busy');
  }
}

form.addEventListener('change', () => {
  writeFilters(Object.fromEntries(new FormData(form)));
  render();
});

form.addEventListener('reset', (event) => {
  event.preventDefault();
  writeFilters({});
  fillForm({});
  render();
});

fillForm(readFilters());
render();
