// Adds the ONRO launcher tag to HTML pages. Idempotent; never touches a page that already has it.
//
//   node scripts/inject-onro-launcher.mjs <srcDir> [--apply --out <dir>]
//
//   <srcDir>   a folder of built pages (dist/, or live-site/ = the mirror of the live web root)
//   (default)  dry run: counts the pages that would get the tag
//   --apply --out <dir>   writes ONLY the changed pages to <dir> (same relative paths), leaving <srcDir>
//                         pristine - so <srcDir> doubles as the rollback copy.
//
// The tag goes right before the last </body>. Skips onro-studio/ itself.
import {readdirSync, statSync, readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {join, relative, dirname, resolve} from 'node:path';

const args = process.argv.slice(2);
const src = resolve(args.find(a => !a.startsWith('--')) ?? 'dist');
const apply = args.includes('--apply');
const outArg = args.indexOf('--out');
const out = outArg >= 0 ? resolve(args[outArg + 1]) : null;
if (apply && !out) { console.error('--apply needs --out <dir> (originals are never modified in place).'); process.exit(2); }

const TAG = '<script src="/onro-studio/launcher.js?v=9" defer></script>';
const walk = (dir, acc = []) => { for (const n of readdirSync(dir)) { const p = join(dir, n); statSync(p).isDirectory() ? walk(p, acc) : acc.push(p); } return acc; };

let changed = 0, already = 0, noBody = 0;
for (const file of walk(src)) {
  const rel = relative(src, file).replaceAll('\\', '/');
  if (!rel.endsWith('.html') || rel.startsWith('onro-studio/')) continue;
  const html = readFileSync(file, 'utf8');
  if (html.includes('/onro-studio/launcher.js')) { already++; continue; }
  const i = html.lastIndexOf('</body>');
  if (i < 0) { noBody++; continue; }
  changed++;
  if (apply) {
    const dest = join(out, rel);
    mkdirSync(dirname(dest), {recursive: true});
    writeFileSync(dest, html.slice(0, i) + TAG + '\n' + html.slice(i));
  }
}
console.log(`${apply ? 'WROTE' : 'WOULD PATCH'} ${changed} pages${apply ? ` into ${out}` : ''}; ${already} already tagged; ${noBody} have no </body> (left alone).`);
