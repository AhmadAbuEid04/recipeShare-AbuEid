import { listRecipes } from './api.js';
import { $, cardHtml, showDemoBanner, showError, useImageFallback } from './ui.js';

showDemoBanner();

async function render() {
  const container = $('#recipes');
  try {
    const recipes = await listRecipes();
    container.innerHTML = recipes.length
      ? recipes.map(cardHtml).join('')
      : '<p class="empty">No recipes found</p>';
    useImageFallback(container);
  } catch (error) {
    showError(container, error);
  }
}

render();
