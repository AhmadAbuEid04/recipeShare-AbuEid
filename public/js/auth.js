// Google sign-in through Supabase Auth (S1), plus the header links that depend on it.
import { DEMO_MODE, currentUser, supabase } from './api.js';
import { displayName, escapeHtml } from './recipes.js';

/** Start Google sign-in; Google sends the user back to `returnTo` (default: this page). */
export async function signIn(returnTo = location.href) {
  const db = await supabase();
  const { error } = await db.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: returnTo } });
  if (error) alert(`Sign-in failed: ${error.message}`);
}

export async function signOut() {
  const db = await supabase();
  await db.auth.signOut();
  location.reload();
}

/**
 * Fill the header with "+ Add recipe" and the sign-in / profile / sign-out links.
 * Returns the signed-in user (or null) so pages can reuse it.
 */
export async function renderNav() {
  const nav = document.querySelector('#nav-links');
  const user = await currentUser();
  const addLink = '<li><a href="add.html" role="button">+ Add recipe</a></li>';

  if (DEMO_MODE) {
    nav.innerHTML = addLink;
  } else if (user) {
    nav.innerHTML = `${addLink}
      <li><a href="profile.html" title="My profile">👤 ${escapeHtml(displayName(user))}</a></li>
      <li><a href="#" id="sign-out">Sign out</a></li>`;
    nav.querySelector('#sign-out').addEventListener('click', (e) => { e.preventDefault(); signOut(); });
  } else {
    nav.innerHTML = `${addLink}
      <li><a href="#" id="sign-in" class="secondary">Sign in with Google</a></li>`;
    nav.querySelector('#sign-in').addEventListener('click', (e) => { e.preventDefault(); signIn(); });
  }
  return user;
}
