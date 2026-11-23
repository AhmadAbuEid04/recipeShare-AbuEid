// M4: cuisine + category filter.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { filterRecipes } from '../public/js/recipes.js';

const recipes = [
  { id: 1, title: 'Saffron Chicken Rice', ingredients: 'rice, chicken', cuisine: 'Iranian', category: 'Main Dish' },
  { id: 2, title: 'Ash Reshteh', ingredients: 'noodles, beans', cuisine: 'Iranian', category: 'Soup' },
  { id: 3, title: 'Chickpea Curry', ingredients: 'chickpeas, rice', cuisine: 'Indian', category: 'Main Dish' },
  { id: 4, title: 'Margherita Pizza', ingredients: 'dough, cheese', cuisine: 'Italian', category: 'Fast Food' },
];
const ids = (list) => list.map((r) => r.id);

test('Iranian + Main Dish shows only recipes matching both', () => {
  assert.deepEqual(ids(filterRecipes(recipes, { cuisine: 'Iranian', category: 'Main Dish' })), [1]);
});

test('one filter alone matches on that field only', () => {
  assert.deepEqual(ids(filterRecipes(recipes, { cuisine: 'Iranian' })), [1, 2]);
  assert.deepEqual(ids(filterRecipes(recipes, { category: 'Main Dish' })), [1, 3]);
});

test('cleared filters show all recipes', () => {
  assert.deepEqual(ids(filterRecipes(recipes, { cuisine: '', category: '' })), [1, 2, 3, 4]);
  assert.deepEqual(ids(filterRecipes(recipes)), [1, 2, 3, 4]);
});

test('no matches returns an empty list (page shows "No recipes found")', () => {
  assert.deepEqual(filterRecipes(recipes, { cuisine: 'Mexican', category: 'Drink' }), []);
});
