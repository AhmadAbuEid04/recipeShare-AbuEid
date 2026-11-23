// M1/M2: what cards and the detail page display.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatRating, lines, escapeHtml } from '../public/js/recipes.js';

test('card shows "No ratings yet" when a recipe has no ratings', () => {
  assert.equal(formatRating(null, 0), 'No ratings yet');
});

test('card shows average with one decimal and the rating count', () => {
  assert.equal(formatRating(4.5, 2), '★ 4.5 (2 ratings)');
  assert.equal(formatRating(5, 1), '★ 5.0 (1 rating)');
});

test('detail page splits ingredients/steps into lines and skips blanks', () => {
  assert.deepEqual(lines('2 cups rice\n\n  1 onion  \n'), ['2 cups rice', '1 onion']);
});

test('user text is HTML-escaped before display', () => {
  assert.equal(escapeHtml('<b>"Tom" & Jerry\'s</b>'), '&lt;b&gt;&quot;Tom&quot; &amp; Jerry&#39;s&lt;/b&gt;');
});
