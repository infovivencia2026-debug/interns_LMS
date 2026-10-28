// Keeps the live-only pages (the ~1,850 /sites/* SEO pages, /programs/aica, extra glydi/lifeatonrol
// files, ...) from being lost when the site is rebuilt from src/.
//
//   live-site/  = exact mirror of the live web root (/home/onrol.in/public_html), pulled read-only.
//   dist/       = what `vite build` produces from src/ (it does NOT contain the live-only pages).
//
// Usage (run after `npm run build`, before deploying):
//   node scripts/sync-live-pages.mjs            # dry run: prints what would be added/left alone
//   node scripts/sync-live-pages.mjs --apply    # copy live-only pages into dist/
//
// Rules: never overwrites a file that exists in dist (the fresh build wins); never copies
// live `assets/` (hashed bundles that belong to the live build, not the new one) or `.htaccess`
// (server config - reviewed separately); never deletes anything.
import {readdirSync, statSync, mkdirSync, copyFileSync, existsSync} from 'node:fs';
import {join, relative, dirname, resolve} from 'node:path';

const live = resolve('live-site'), dist = resolve('dist');
const apply = process.argv.includes('--apply');
if (!existsSync(live)) { console.error('live-site/ not found - pull it first.'); process.exit(2); }
if (!existsSync(dist)) { console.error('dist/ not found - run `npm run build` first.'); process.exit(2); }

const SKIP = [/^assets\//, /^\.htaccess$/];
function walk(root, dir = root, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(root, p, out); else out.push(relative(root, p).replaceAll('\\', '/'));
  }
  return out;
}
const added = [], present = [];
for (const rel of walk(live)) {
  if (SKIP.some(re => re.test(rel))) continue;
  if (existsSync(join(dist, rel))) { present.push(rel); continue; }
  added.push(rel);
  if (apply) { mkdirSync(dirname(join(dist, rel)), {recursive: true}); copyFileSync(join(live, rel), join(dist, rel)); }
}
const top = {};
for (const rel of added) { const k = rel.split('/')[0]; top[k] = (top[k] ?? 0) + 1; }
console.log(`${apply ? 'COPIED' : 'WOULD COPY'} ${added.length} live-only files into dist/ ; ${present.length} already in dist (left untouched).`);
console.log('by top folder:', Object.entries(top).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([k, v]) => `${k}=${v}`).join(', '));
if (!apply) console.log('Dry run only. Re-run with --apply to copy.');
