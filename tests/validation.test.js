// M3: required-field check for the add-recipe form.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateRecipe } from '../public/js/recipes.js';

const complete = {
  author_name: 'Sara',
  title: 'Saffron Chicken Rice',
  cuisine: 'Iranian',
  category: 'Main Dish',
  ingredients: '2 cups rice\n1 onion',
  steps: 'Cook the rice.\nServe.',
  prep_minutes: '45',
  image_url: 'https://example.com/rice.jpg',
};

test('a fully filled form is valid and prep time becomes a number', () => {
  const { ok, errors, recipe } = validateRecipe(complete);
  assert.equal(ok, true);
  assert.deepEqual(errors, {});
  assert.equal(recipe.prep_minutes, 45);
});

test('an empty form reports every missing field', () => {
  const { ok, errors } = validateRecipe({});
  assert.equal(ok, false);
  assert.deepEqual(Object.keys(errors).sort(), [
    'author_name', 'category', 'cuisine', 'image_url', 'ingredients', 'prep_minutes', 'steps', 'title',
  ]);
});

test('a missing field is named in the error message (whitespace counts as empty)', () => {
  const { ok, errors } = validateRecipe({ ...complete, title: '   ' });
  assert.equal(ok, false);
  assert.deepEqual(errors, { title: 'Title is required' });
});

test('cuisine and category must come from the fixed lists', () => {
  const { errors } = validateRecipe({ ...complete, cuisine: 'Persian', category: 'Brunch' });
  assert.ok(errors.cuisine);
  assert.ok(errors.category);
});

test('prep time must be a positive whole number', () => {
  for (const bad of ['0', '-5', '2.5', 'abc']) {
    assert.ok(validateRecipe({ ...complete, prep_minutes: bad }).errors.prep_minutes, bad);
  }
});

test('image link must be an http(s) URL', () => {
  assert.ok(validateRecipe({ ...complete, image_url: 'not a url' }).errors.image_url);
  assert.ok(validateRecipe({ ...complete, image_url: 'javascript:alert(1)' }).errors.image_url);
});
