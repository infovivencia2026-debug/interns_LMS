// Replaces the wrong "5 AI systems and 7+ projects" claim with "5 projects chosen from 20+ real-world projects"
// on the LIVE site, without a site rebuild:
//   - patches the text in the pre-rendered pages and in the JS bundles that are actually reachable from the live entry chunk
//   - because the server caches /assets/* for a year, every patched bundle (and every bundle that imports one) gets a NEW file name
//     (-p2 suffix) and all references to it are rewritten, so returning visitors fetch the fixed code
//   - the old files are left untouched (they are the rollback, and cached pages may still ask for them)
//
//   node scripts/fix-project-copy.mjs            dry run: prints what would change
//   node scripts/fix-project-copy.mjs --apply    writes ONLY changed/new files into deploy-staging/sitefix/ (same relative paths)
import {readdirSync, readFileSync, writeFileSync, mkdirSync, statSync, existsSync} from 'node:fs';
import {join, relative, dirname, basename} from 'node:path';

const apply = process.argv.includes('--apply');
const LIVE = 'live-site', PAGES = 'deploy-staging/pages', OUT = 'deploy-staging/sitefix';
const ENTRY = 'index-8lmdw4b_.js';
const SUFFIX = '-p2';

const SUB = '5 projects chosen from 20+ real-world projects';
function patch(text) {
  return text
    .replace(/5 (?:shipped )?AI systems(?:,| and) 7\+ projects, real, working products/g, `${SUB}: real, working products`)
    .replace(/5 (shipped )?AI systems(?:,| and) 7\+ (?:real |deployable )?projects?/g, (_, shipped) => shipped ? '5 shipped projects chosen from 20+' : SUB)
    .replace(/<span>7\+ projects<\/span>/g, '<span>5 projects from 20+</span>')
    .replace(/\b7\+ projects\b/g, '5 projects from 20+');
}
const STILL_WRONG = /7\+ (?:real |deployable )?projects?/;

const walk = (dir, acc = []) => { for (const n of readdirSync(dir)) { const p = join(dir, n); statSync(p).isDirectory() ? walk(p, acc) : acc.push(p); } return acc; };
const assetsDir = join(LIVE, 'assets');
const assetNames = new Set(readdirSync(assetsDir).filter(n => /\.(js|css)$/.test(n)));
const NAME_RE = /[A-Za-z0-9_.-]+\.(?:js|css)/g;
const refsIn = text => [...new Set((text.match(NAME_RE) ?? []).filter(n => assetNames.has(n)))];

// 1. chunks reachable from the live entry
const text = new Map(), reach = new Set();
const queue = [ENTRY];
while (queue.length) {
  const n = queue.pop(); if (reach.has(n)) continue; reach.add(n);
  const t = readFileSync(join(assetsDir, n), 'utf8'); text.set(n, t);
  for (const r of refsIn(t)) if (r !== n) queue.push(r);
}
// 2. which of them change, then everything that imports a changed chunk changes too (its reference gets a new name)
const changed = new Set([...reach].filter(n => patch(text.get(n)) !== text.get(n)));
let grew = true;
while (grew) {
  grew = false;
  for (const n of reach) {
    if (changed.has(n)) continue;
    if (refsIn(text.get(n)).some(r => changed.has(r))) { changed.add(n); grew = true; }
  }
}
const rename = new Map([...changed].map(n => [n, n.replace(/(\.(?:js|css))$/, `${SUFFIX}$1`)]));
const rewriteNames = t => t.replace(NAME_RE, m => rename.get(m) ?? m);

// 3. pages (the tagged copies we deploy)
const pageFiles = walk(PAGES).filter(f => f.endsWith('.html'));
const pageChanges = [];
for (const f of pageFiles) {
  const t = readFileSync(f, 'utf8');
  const u = rewriteNames(patch(t));
  if (u !== t) pageChanges.push([relative(PAGES, f).replaceAll('\\', '/'), u]);
}
// non-tagged live pages that never got into deploy-staging/pages (should be none)
const missing = walk(LIVE).filter(f => f.endsWith('.html') && !f.includes(`${LIVE}\\assets`)).map(f => relative(LIVE, f).replaceAll('\\', '/'))
  .filter(rel => !existsSync(join(PAGES, rel)) && STILL_WRONG.test(readFileSync(join(LIVE, rel), 'utf8')));

console.log(`reachable chunks: ${reach.size}; chunks to rewrite+rename: ${changed.size}; pages to change: ${pageChanges.length}; live pages with the claim but not in staging: ${missing.length}`);
for (const [o, n] of rename) console.log(`  ${o} -> ${n}`);

const outFiles = [];
for (const n of changed) outFiles.push([`assets/${rename.get(n)}`, rewriteNames(patch(text.get(n)))]);
for (const [rel, u] of pageChanges) outFiles.push([rel, u]);
const leftovers = outFiles.filter(([, t]) => STILL_WRONG.test(t)).map(([r]) => r);
console.log(leftovers.length ? `STILL CONTAINS the old claim: ${leftovers.join(', ')}` : 'no old claim left in any output file');

if (apply) {
  for (const [rel, t] of outFiles) { const dest = join(OUT, rel); mkdirSync(dirname(dest), {recursive: true}); writeFileSync(dest, t); }
  console.log(`WROTE ${outFiles.length} files into ${OUT}/`);
}
