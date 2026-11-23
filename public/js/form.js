import { createRecipe } from './api.js';
import { CATEGORIES, CUISINES, FIELDS, escapeHtml, validateRecipe } from './recipes.js';
import { $, optionsHtml, showDemoBanner } from './ui.js';

showDemoBanner();

const form = $('#recipe-form');
const summary = $('#form-summary');
const submitBtn = $('#submit-btn');

$('#cuisine').innerHTML = optionsHtml(CUISINES, '', 'Choose a cuisine…');
$('#category').innerHTML = optionsHtml(CATEGORIES, '', 'Choose a category…');

function showErrors(errors) {
  for (const [field] of FIELDS) {
    const message = errors[field] ?? '';
    form.querySelector(`[data-error-for="${field}"]`).textContent = message;
    form.elements[field].setAttribute('aria-invalid', message ? 'true' : 'false');
  }
  const messages = Object.values(errors);
  summary.hidden = messages.length === 0;
  summary.innerHTML = messages.length
    ? `<strong>Nothing was saved.</strong> Please fix: <ul>${messages.map((m) => `<li>${escapeHtml(m)}</li>`).join('')}</ul>`
    : '';
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const { ok, errors, recipe } = validateRecipe(Object.fromEntries(new FormData(form)));
  showErrors(errors);
  if (!ok) {
    summary.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }

  submitBtn.setAttribute('aria-busy', 'true');
  submitBtn.disabled = true;
  try {
    await createRecipe(recipe);
    location.href = 'index.html';
  } catch (error) {
    summary.hidden = false;
    summary.innerHTML = `<strong>Could not save the recipe:</strong> ${escapeHtml(error.message)}`;
    submitBtn.removeAttribute('aria-busy');
    submitBtn.disabled = false;
  }
});
