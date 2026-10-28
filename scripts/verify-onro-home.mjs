// Checks ONRO on the real onrol.in HOME page, locally, before anything is deployed.
//   Serves   deploy-staging/onro-studio  at /onro-studio/*   (the files about to be deployed)
//            deploy-staging/pages        (pages tagged with the launcher)  then
//            live-site                   (exact mirror of the live web root) for everything else.
// Every request that is not localhost is blocked EXCEPT the read-only chat call (forwarded to the live
// assistant); the lead call is MOCKED so no enquiry is ever created. Screenshots: output/onro/.
// Behaviour under test: no separate button and no separate modal. ONRO walks in on EVERY home load, waves,
// then a mini chat box beside ONRO says "Hi!" by default; the visitor replies in that same box.
import {createServer} from 'node:http';
import {readFile, stat, mkdir} from 'node:fs/promises';
import {resolve, join, extname, normalize} from 'node:path';
import puppeteer from 'puppeteer';

const root = p => resolve(p);
const OVERLAYS = [(u) => u.startsWith('/onro-studio/') ? join(root('deploy-staging'), u) : null,
  (u) => join(root('deploy-staging/pages'), u), (u) => join(root('live-site'), u)];
const TYPES = {'.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.woff2': 'font/woff2', '.woff': 'font/woff', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.avif': 'image/avif', '.mp4': 'video/mp4'};
async function resolveFile(urlPath) {
  const clean = normalize(decodeURIComponent(urlPath.split('?')[0])).replaceAll('\\', '/');
  const candidates = [clean, clean.endsWith('/') ? clean + 'index.html' : clean + '/index.html', clean + '.html'];
  for (const c of candidates) for (const o of OVERLAYS) {
    const p = o(c); if (!p) continue;
    try { if ((await stat(p)).isFile()) return p; } catch { /* next */ }
  }
  return null;
}
const server = createServer(async (req, res) => {
  const file = await resolveFile(req.url) ?? (req.url.startsWith('/assets/') ? null : await resolveFile('/index.html'));
  if (!file) { res.writeHead(404); return res.end('not found'); }
  res.writeHead(200, {'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream'});
  res.end(await readFile(file));
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
const base = `http://127.0.0.1:${server.address().port}`;
const out = resolve('output/onro'); await mkdir(out, {recursive: true});
const sleep = ms => new Promise(d => setTimeout(d, ms));
let failures = 0, browser;
const check = (name, ok, detail = '') => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`); if (!ok) failures++; };

async function open(path, viewport, reducedMotion = false, existing = null) {
  const page = existing ?? await browser.newPage();
  const errors = [], chat = [], leads = [];
  if (!existing) {
    page.on('pageerror', e => errors.push(e.message.slice(0, 160)));
    page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push('console: ' + m.text().slice(0, 160)); });
    if (reducedMotion) await page.emulateMediaFeatures([{name: 'prefers-reduced-motion', value: 'reduce'}]);
    await page.setRequestInterception(true);
    page.on('request', async req => {
      const u = req.url();
      if (u.startsWith('http://127.0.0.1:3100/')) {
        if (req.method() === 'OPTIONS') return req.respond({status: 204, headers: {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'content-type'}});
        if (u.includes('/api/public/leads')) { leads.push(JSON.parse(req.postData() || '{}')); return req.respond({status: 200, contentType: 'application/json', headers: {'Access-Control-Allow-Origin': '*'}, body: '{"ok":true,"saved":true}'}); }
        if (u.includes('/api/public/assistant')) {
          chat.push(u);
          try {
            const r = await fetch('https://go.onrol.in/api/public/assistant', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: req.postData() ?? '{}'});
            return req.respond({status: r.status, contentType: 'application/json', headers: {'Access-Control-Allow-Origin': '*'}, body: await r.text()});
          } catch { return req.abort(); }
        }
        return req.abort();
      }
      if (/^(http:\/\/127\.0\.0\.1|data:|blob:)/.test(u)) return req.continue();
      req.abort();
    });
  }
  await page.setViewport(viewport);
  await page.goto(base + path, {waitUntil: 'domcontentloaded'});
  return {page, errors, chat, leads};
}
const visible = (page, sel) => page.$eval(sel, el => { const s = getComputedStyle(el); const r = el.getBoundingClientRect(); return !el.hidden && s.display !== 'none' && s.visibility !== 'hidden' && r.width > 0 && r.height > 0; }).catch(() => false);
const logText = page => page.$eval('#onro-log', el => el.innerText).catch(() => '');
const openByClick = async (page, sel) => { await page.waitForSelector(sel, {visible: true, timeout: 40000}); await page.waitForFunction(() => { const e = document.getElementById('onro-entrance'); return !e || e.dataset.phase === 'rest'; }, {timeout: 40000}); await new Promise(r => setTimeout(r, 400)); const early = await page.$eval('#onro-mini', el => !el.hidden).catch(() => false); await page.click(sel); await page.waitForSelector('#onro-mini:not([hidden])', {timeout: 8000}); await page.waitForFunction(() => /pick one below|reply with a number/i.test(document.getElementById('onro-log')?.textContent ?? ''), {timeout: 15000}).catch(() => {}); await new Promise(r => setTimeout(r, 1500)); return !early; };
const waitAsk = page => page.waitForFunction(() => /Ask me anything/.test(document.querySelector('.onro-hi')?.textContent ?? ''), {timeout: 15000}).then(() => true).catch(() => false);
const sayInBox = async (page, text) => { const sel = '#onro-mini form:not(#onro-lead) input'; await page.click(sel); await page.type(sel, text); await page.keyboard.press('Enter'); };

try {
  browser = await puppeteer.launch({executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--enable-webgl', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']});

  // ================= HOME, desktop =================
  const home = await open('/', {width: 1440, height: 900});
  await home.page.waitForSelector('#onro-launcher', {timeout: 20000});
  check('home: NO separate "Ask ONRO" button, and no separate modal/panel exists', (await home.page.$('.onro-btn')) === null && (await home.page.$('#onro-panel')) === null && (await home.page.$('#onro-panel iframe')) === null);
  check('home: ONRO walks in', await home.page.waitForSelector('#onro-entrance', {timeout: 30000}).then(() => true).catch(() => false));
  check('home: ONRO waves and says "Hi! I\'m ONRO."', await home.page.waitForFunction(() => /Hi! I.m ONRO/.test(document.querySelector('.onro-hi')?.textContent ?? ''), {timeout: 12000}).then(() => true).catch(() => false));
  check('home: after the intro ONRO shows "Ask me anything" and the box stays CLOSED until clicked', await waitAsk(home.page) && await openByClick(home.page, '#onro-entrance .onro-hi'));
  const boxShown = true;
  check('home: a mini chat box says "Hi!" by default (nobody clicked anything)', boxShown && /(Hi!|Hey there!).*ONRO/s.test(await logText(home.page)));
  check('home: the box sits BESIDE ONRO (left of the character), not covering it', await home.page.evaluate(() => { const m = document.getElementById('onro-mini').getBoundingClientRect(), a = document.getElementById('onro-entrance').getBoundingClientRect(); return m.right <= a.left + 8 && m.width > 200; }));
  check('home: quick-reply choices are offered (Courses / Certification / Batch timings / counsellor)', (await home.page.$$eval('#onro-chips button', b => b.length)) === 4);
  await sleep(1500);
  await home.page.screenshot({path: resolve(out, 'home-desktop.png')});
  await home.page.evaluate(() => { window.__reacts = 0; window.addEventListener('onro:react', () => window.__reacts++); });
  await sayInBox(home.page, 'do you teach python');
  await home.page.waitForFunction(() => /Python from the basics/.test(document.getElementById('onro-log').textContent), {timeout: 25000}).catch(async e => { console.log('LOG>>', await logText(home.page), await home.page.evaluate(() => JSON.stringify({forms: [...document.querySelectorAll('#onro-mini form')].map(f => f.id + ':' + f.hidden), inp: document.querySelector('#onro-mini form:not(#onro-lead) input')?.value, errs: window.__errs}))); throw e; });
  check('home: the visitor replies IN THE SAME BOX and ONRO answers there', true);
  check('home: ONRO body reacted to the conversation (thinking and reply reactions)', await home.page.waitForFunction(() => window.__reacts >= 2, {timeout: 8000}).then(() => true).catch(() => false));
  await home.page.screenshot({path: resolve(out, 'home-chat.png')});
  await home.page.click('#onro-chips button').catch(() => {});             // chips are gone after the first message
  check('home: after an answer the quick replies come back with a "Main menu" button', (await home.page.$$eval('#onro-chips button', b => b.map(x => x.textContent))).includes('Main menu'));
  await home.page.click('#onro-mini .onro-x');
  check('home: × collapses the box; ONRO stays', !(await visible(home.page, '#onro-mini')) && await visible(home.page, '#onro-entrance'));
  await home.page.click('#onro-entrance');
  check('home: clicking ONRO brings the box back with the conversation kept', await visible(home.page, '#onro-mini') && /Python from the basics/.test(await logText(home.page)));
  await home.page.keyboard.press('Escape');
  check('home: Escape collapses the box and focus returns to ONRO', !(await visible(home.page, '#onro-mini')) && await home.page.evaluate(() => document.activeElement?.id === 'onro-entrance'));
  check('home: no uncaught ONRO errors', !home.errors.some(e => /onro|mascot|three|launcher|entrance/i.test(e)), home.errors.join(' | ').slice(0, 200));
  // ---- the regression: the walk-in must play AGAIN on a reload in the same session ----
  await home.page.reload({waitUntil: 'domcontentloaded'});
  check('home: RELOAD in the same session - ONRO walks in again (intro is not "once per session")', await home.page.waitForSelector('#onro-entrance', {timeout: 30000}).then(() => true).catch(() => false));
  check('home: ...and after the reload the box stays closed until "Ask me anything" is clicked', await waitAsk(home.page) && await openByClick(home.page, '#onro-entrance .onro-hi'));

  // counsellor hand-off inside the same box (lead call is mocked)
  await home.page.evaluate(() => document.querySelectorAll('#onro-chips button')[3]?.click());
  await home.page.waitForSelector('#onro-lead:not([hidden])', {timeout: 25000});
  await home.page.$eval('#onro-lead-name', el => { el.value = 'Asha Rao'; }); await home.page.$eval('#onro-lead-phone', el => { el.value = '+44 7911 123456'; });
  await home.page.$eval('#onro-lead', f => f.requestSubmit());
  await home.page.waitForFunction(() => /counsellor will call you/.test(document.getElementById('onro-log').textContent), {timeout: 15000});
  check('home: counsellor request is collected inside the same box (country-code phone, idempotent id, mocked intake)', home.leads.length === 1 && home.leads[0].phone === '+44 7911 123456' && /^onro-/.test(home.leads[0].submissionId));
  await home.page.close();

  // ================= inner page =================
  const prog = await open('/programs/ai-generalist', {width: 1280, height: 800});
  await prog.page.waitForFunction(() => document.getElementById('onro-entrance')?.dataset.phase === 'rest', {timeout: 40000});
  check('inner page: the ANIMATED 3D ONRO is shown (not the flat portrait), no old button', (await prog.page.$('.onro-btn')) === null && await visible(prog.page, '#onro-entrance canvas') && !(await visible(prog.page, '#onro-launcher .onro-char')));
  check('inner page: box stays closed until the ONRO bubble is clicked, then says Hi', await openByClick(prog.page, '#onro-entrance .onro-hi') && /(Hi!|Hey there!)/.test(await logText(prog.page)));
  await prog.page.screenshot({path: resolve(out, 'inner-desktop.png')});
  await sayInBox(prog.page, 'what is your contact number');
  await prog.page.waitForFunction(() => /info@onrol\.in/.test(document.getElementById('onro-log').textContent) && /\+91 96093 12345/.test(document.getElementById('onro-log').textContent), {timeout: 25000});
  check('inner page: reply in the same box; contact details shown', true);
  await prog.page.close();

  // ================= mobile home =================
  const mob = await open('/', {width: 390, height: 844, isMobile: true, deviceScaleFactor: 2});
  await waitAsk(mob.page); await openByClick(mob.page, '#onro-entrance .onro-hi');
  const geo = await mob.page.evaluate(() => { const m = document.getElementById('onro-mini').getBoundingClientRect(); const a = document.getElementById('onro-entrance')?.getBoundingClientRect(); return {fits: m.left >= 0 && m.right <= innerWidth && m.top >= 0 && m.bottom <= innerHeight, clearOfOnro: !a || m.bottom <= a.top + 8, overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth}; });
  check('mobile home: box fits the screen, sits above ONRO, no horizontal overflow', geo.fits && geo.clearOfOnro && geo.overflow <= 1, JSON.stringify(geo));
  await mob.page.screenshot({path: resolve(out, 'home-mobile.png')});
  await mob.page.close();

  // ================= reduced motion =================
  const rm = await open('/', {width: 1280, height: 800}, true);
  check('reduced motion: ONRO appears (no roll-in) and the box still says Hi', await waitAsk(rm.page) && await openByClick(rm.page, '#onro-entrance .onro-hi') && (await rm.page.$('#onro-entrance')) !== null);
  await rm.page.close();
} finally { await browser?.close(); server.close(); }
console.log(failures ? `\n${failures} check(s) FAILED` : '\nAll home-page checks passed.');
process.exit(failures ? 1 : 0);
