// S1/S2/S3: names, fair-rating rules, and ownership (the database enforces the same rules with RLS).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { displayName, isOwner, ratingBlockReason } from '../public/js/recipes.js';

const alice = { id: 'u-alice', email: 'alice@example.com', user_metadata: { full_name: 'Alice Smith' } };
const bob = { id: 'u-bob', email: 'bob.cook@example.com', user_metadata: {} };
const alicesRecipe = { id: 1, user_id: 'u-alice' };
const visitorRecipe = { id: 2, user_id: null };

test('display name uses the Google name, else the email prefix', () => {
  assert.equal(displayName(alice), 'Alice Smith');
  assert.equal(displayName(bob), 'bob.cook');
  assert.equal(displayName(null), '');
});

test('signed-out visitors cannot rate', () => {
  assert.equal(ratingBlockReason(null, alicesRecipe), 'signed-out');
});

test('authors cannot rate their own recipe', () => {
  assert.equal(ratingBlockReason(alice, alicesRecipe), 'own-recipe');
});

test('signed-in users can rate other people\'s and visitors\' recipes', () => {
  assert.equal(ratingBlockReason(bob, alicesRecipe), null);
  assert.equal(ratingBlockReason(alice, visitorRecipe), null);
});

test('only the author owns a recipe', () => {
  assert.equal(isOwner(alice, alicesRecipe), true);
  assert.equal(isOwner(bob, alicesRecipe), false);
  assert.equal(isOwner(null, alicesRecipe), false);
  assert.equal(isOwner(alice, visitorRecipe), false);
});
