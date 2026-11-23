// M5: average rating calculation (the database view uses the same rule: round(avg, 1)).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { average, formatRating } from '../public/js/recipes.js';

test('average of several ratings', () => {
  assert.equal(average([5, 4, 3]), 4);
  assert.equal(average([5, 4]), 4.5);
});

test('average is rounded to one decimal', () => {
  assert.equal(average([5, 4, 4]), 4.3);
  assert.equal(average([1, 2, 2]), 1.7);
});

test('no ratings gives null, shown as "No ratings yet"', () => {
  assert.equal(average([]), null);
  assert.equal(formatRating(average([]), 0), 'No ratings yet');
});

test('adding a rating updates both the average and the count', () => {
  const stars = [4, 4];
  assert.equal(formatRating(average(stars), stars.length), '★ 4.0 (2 ratings)');
  stars.push(1);
  assert.equal(formatRating(average(stars), stars.length), '★ 3.0 (3 ratings)');
});
