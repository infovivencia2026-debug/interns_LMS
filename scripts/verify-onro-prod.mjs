// Smoke test of ONRO on the REAL https://onrol.in (after deploy). Read-only: chat messages only, NO forms,
// NO lead capture (the counsellor button is never clicked). Third-party scripts and the site's own
// visit-tracking beacon are blocked so this does not skew analytics. Screenshots go to output/onro/.
import {mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import puppeteer from 'puppeteer';

const SITE = process.env.SITE || 'https://onrol.in';
const out = resolve('output/onro'); await mkdir(out, {recursive: true});
const sleep = ms => new Promise(d => setTimeout(d, ms));
let failures = 0;
const check = (name, ok, detail = '') => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`); if (!ok) failures++; };

const browser = await puppeteer.launch({executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--enable-webgl', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']});
async function open(path, viewport) {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message.slice(0, 160)));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|net::ERR_FAILED/.test(m.text())) errors.push('console: ' + m.text().slice(0, 160)); });
  await page.setRequestInterception(true);
  page.on('request', r => {
    const u = r.url();
    if (/\/api\/public\/(track|leads)/.test(u)) return r.abort();            // never create a visit or a lead
    if (/^https:\/\/(onrol\.in|www\.onrol\.in|go\.onrol\.in)\//.test(u) || /^(data|blob):/.test(u)) return r.continue();
    r.abort();                                                                 // fonts / analytics / third parties
  });
  await page.setViewport(viewport);
  await page.goto(SITE + path, {waitUntil: 'domcontentloaded'});
  return {page, errors};
}
const visible = (page, sel) => page.$eval(sel, el => { const s = getComputedStyle(el); const r = el.getBoundingClientRect(); return !el.hidden && s.display !== 'none' && s.visibility !== 'hidden' && r.width > 0 && r.height > 0; }).catch(() => false);
const log = page => page.$eval('#onro-log', el => el.innerText).catch(() => '');
const openBy = async (page, sel) => { await page.waitForSelector(sel, {visible: true, timeout: 45000}); await page.waitForFunction(() => { const e = document.getElementById('onro-entrance'); return !e || e.dataset.phase === 'rest'; }, {timeout: 45000}); const closedFirst = await page.$eval('#onro-mini', el => el.hidden).catch(() => true); await page.click(sel); await page.waitForSelector('#onro-mini:not([hidden])', {timeout: 8000}); await new Promise(r => setTimeout(r, 2500)); return closedFirst; };
const sayInBox = async (page, text) => { await page.$eval('#onro-mini form:not(#onro-lead) input', (el, t) => { el.value = t; }, text); await page.$eval('#onro-mini form:not(#onro-lead)', f => f.requestSubmit()); };

try {
  const home = await open('/', {width: 1440, height: 900});
  check('home: no separate button and no separate panel on the live site', await home.page.waitForSelector('#onro-launcher', {timeout: 30000}).then(() => true).catch(() => false) && (await home.page.$('.onro-btn')) === null && (await home.page.$('#onro-panel')) === null && !/ask onro/i.test(await home.page.evaluate(() => document.body.innerText)));
  check('home: ONRO walks in on the live home page', await home.page.waitForSelector('#onro-entrance', {timeout: 45000}).then(() => true).catch(() => false));
  check('home: a mini chat box says "Hi!" by default, beside ONRO', await openBy(home.page, '#onro-entrance .onro-hi').catch(() => false) && /(Hi!|Hey there!).*ONRO/s.test(await log(home.page)) && await home.page.evaluate(() => { const m = document.getElementById('onro-mini').getBoundingClientRect(), a = document.getElementById('onro-entrance').getBoundingClientRect(); return m.right <= a.left + 8; }));
  await sleep(1500);
  await home.page.screenshot({path: resolve(out, 'prod-home.png')});
  await sayInBox(home.page, 'what is your contact number');
  const answered = await home.page.waitForFunction(() => /info@onrol\.in/.test(document.getElementById('onro-log').textContent) && /\+91 96093 12345/.test(document.getElementById('onro-log').textContent), {timeout: 30000}).then(() => true).catch(() => false);
  check('home: the visitor replies in the SAME box; the live assistant answers with the ONROL contact details', answered, answered ? '' : (await log(home.page)).slice(-160));
  await sayInBox(home.page, 'do you teach python');
  check('home: knowledge-base answer in the same box', await home.page.waitForFunction(() => /Python from the basics/.test(document.getElementById('onro-log').textContent), {timeout: 30000}).then(() => true).catch(() => false));
  await home.page.screenshot({path: resolve(out, 'prod-chat.png')});
  await home.page.click('#onro-mini .onro-x');
  check('home: x collapses the box, ONRO stays; clicking ONRO brings it back with the conversation', !(await visible(home.page, '#onro-mini')) && await visible(home.page, '#onro-entrance') && await (async () => { await home.page.click('#onro-entrance'); return (await visible(home.page, '#onro-mini')) && /contact/i.test(await log(home.page)); })());
  check('home: no uncaught ONRO errors', !home.errors.some(e => /onro|mascot|three|launcher|entrance/i.test(e)), home.errors.join(' | ').slice(0, 220));
  await home.page.reload({waitUntil: 'domcontentloaded'});
  check('home: RELOAD - ONRO walks in again (the intro plays on every load)', await home.page.waitForSelector('#onro-entrance', {timeout: 45000}).then(() => true).catch(() => false));
  await home.page.close();

  const inner = await open('/programs/ai-generalist', {width: 1280, height: 800});
  check('inner page: the animated 3D ONRO is shown, no old button, and clicking its "Ask me anything" opens the box with Hi', await inner.page.waitForFunction(() => document.getElementById('onro-entrance')?.dataset.phase === 'rest', {timeout: 45000}).then(() => true).catch(() => false) && (await inner.page.$('.onro-btn')) === null && await openBy(inner.page, '#onro-entrance .onro-hi').catch(() => false));
  await inner.page.close();

  const seo = await open('/sites/ai-course-in-bangalore', {width: 1280, height: 800});
  check('SEO page (/sites/ai-course-in-bangalore): animated 3D ONRO present', await seo.page.waitForFunction(() => document.getElementById('onro-entrance')?.dataset.phase === 'rest', {timeout: 45000}).then(() => true).catch(() => false));
  await seo.page.close();

  const mob = await open('/', {width: 390, height: 844, isMobile: true, deviceScaleFactor: 2});
  await openBy(mob.page, '#onro-entrance .onro-hi');
  const geo = await mob.page.evaluate(() => { const m = document.getElementById('onro-mini').getBoundingClientRect(); const a = document.getElementById('onro-entrance')?.getBoundingClientRect(); return {fits: m.left >= 0 && m.right <= innerWidth && m.top >= 0 && m.bottom <= innerHeight, clear: !a || m.bottom <= a.top + 8, overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth}; });
  check('mobile home: box fits the screen above ONRO, no horizontal overflow', geo.fits && geo.clear && geo.overflow <= 1, JSON.stringify(geo));
  await mob.page.screenshot({path: resolve(out, 'prod-mobile.png')});
  await mob.page.close();
} finally { await browser.close(); }
console.log(failures ? `\n${failures} check(s) FAILED` : '\nProduction smoke test passed.');
process.exit(failures ? 1 : 0);
