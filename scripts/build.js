// Build: copy public/ to dist/ and write dist/js/config.js from environment variables.
// Locally, values may come from a git-ignored .env file. On Vercel, set them in Project Settings.
import { cpSync, existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';

if (existsSync('.env')) {
  for (const line of readFileSync('.env', 'utf8').split('\n')) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^["']|["']$/g, '');
  }
}

const url = process.env.SUPABASE_URL ?? '';
const key = process.env.SUPABASE_ANON_KEY ?? '';

rmSync('dist', { recursive: true, force: true });
cpSync('public', 'dist', { recursive: true });
writeFileSync('dist/js/config.js',
  `export const SUPABASE_URL = ${JSON.stringify(url)};\nexport const SUPABASE_ANON_KEY = ${JSON.stringify(key)};\n`);

console.log(url && key
  ? `Built dist/ (Supabase: ${new URL(url).host})`
  : 'Built dist/ in DEMO MODE (SUPABASE_URL / SUPABASE_ANON_KEY not set)');
