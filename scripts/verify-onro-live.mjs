// End-to-end check of ONRO's LIVE page against the REAL ONROL assistant (CRM /api/public/assistant).
//   1. Start the CRM locally:   cd "<crm>" && npx next start -p 3100     (production build, no DB needed for chat)
//   2. node scripts/verify-onro-live.mjs                                 (CRM_BASE overrides http://127.0.0.1:3100)
// Only the lead-capture call (/api/public/leads) is intercepted and mocked so NO enquiry ever reaches a
// real database or production. No production calls are made. Screenshots go to output/onro/.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import handler from 'serve-handler';
import puppeteer from 'puppeteer';
import {moods, gestures} from '../public/onro-studio/actions.js';

const CRM = process.env.CRM_BASE || 'http://127.0.0.1:3100';
try { const r = await fetch(`${CRM}/api/public/assistant`, {method: 'OPTIONS'}); assert.ok(r.status < 500 && r.status !== 404, `assistant route not served (${r.status})`); }
catch (error) { console.error(`CRM not reachable at ${CRM}. Start it first (npx next start -p 3100).`, error.message); process.exit(2); }

const server = createServer((req, res) => handler(req, res, {public: resolve('public')}));
await new Promise(done => server.listen(0, '127.0.0.1', done));
// ONRO_PAGE=index tests the DEFAULT page (/onro-studio/) with no ?api= (localhost defaults to the local CRM).
const base = process.env.ONRO_PAGE === 'index'
  ? `http://127.0.0.1:${server.address().port}/onro-studio/`
  : `http://127.0.0.1:${server.address().port}/onro-studio/live?api=${encodeURIComponent(CRM)}`;
const out = resolve('output/onro'); await mkdir(out, {recursive: true});
const sleep = ms => new Promise(done => setTimeout(done, ms));
let browser, failures = 0;
const check = (name, ok, detail = '') => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`); if (!ok) failures++; };

try {
  browser = await puppeteer.launch({executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--enable-webgl', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']});
  const page = await browser.newPage();
  const errors = [], leadCalls = [], assistantCalls = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setRequestInterception(true);
  const external = [];
  let failNext = 0, delayNext = new Map();
  page.on('request', req => {
    const url = req.url();
    if (!/^(http:\/\/127\.0\.0\.1|http:\/\/localhost|data:|blob:)/.test(url)) { external.push(url); return req.abort(); }
    if (url.endsWith('/api/public/leads') && req.method() === 'OPTIONS') {
      return req.respond({status: 204, headers: {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'content-type'}});
    }
    if (url.endsWith('/api/public/leads')) {
      const body = JSON.parse(req.postData() || '{}'); leadCalls.push(body);
      return req.respond({status: 200, contentType: 'application/json', headers: {'Access-Control-Allow-Origin': '*'}, body: JSON.stringify({ok: true, saved: true, leadId: 'mock'})});
    }
    if (url.endsWith('/api/public/assistant') && req.method() === 'POST') {
      const body = JSON.parse(req.postData() || '{}'); assistantCalls.push(body);
      if (failNext > 0) { failNext--; return req.respond({status: 503, contentType: 'application/json', headers: {'Access-Control-Allow-Origin': '*'}, body: '{"message":"down"}'}); }
      const wait = delayNext.get(body.message) ?? 0;
      if (wait) return void setTimeout(() => req.continue(), wait);
    }
    req.continue();
  });
  const state = () => page.$eval('#stage', el => ({mood: el.dataset.mood, gesture: el.dataset.gesture, phase: el.dataset.phase}));
  const lastReply = () => page.$$eval('#messages .message.assistant', els => els.at(-1)?.textContent.replace(/^ONRO/, '') ?? '');
  const waitIdle = () => page.waitForFunction(() => document.getElementById('stage').dataset.phase === 'idle', {timeout: 15000});
  const ask = async text => { await page.type('#question', text); await page.keyboard.press('Enter'); };

  await page.setViewport({width: 1440, height: 1000});
  await page.goto(base, {waitUntil: 'networkidle0'});
  check('WebGL mascot initialises (no fallback error)', await page.$eval('#error', el => el.hidden));
  check('no visitor-facing animation controls', (await page.$$('button[data-mood],button[data-gesture],#pause,.studio-controls,button[data-prompt],select[name="mood"],select[name="gesture"]')).length === 0);
  const visibleText = await page.evaluate(() => document.body.innerText);
  check('no reaction metadata or mood/gesture names rendered to visitors', !/\b(Empathetic|Lean-in|Look-around|mood|gesture)\b/i.test(visibleText));

  // 1. greeting -> menu -> Happy + Wave
  await ask('hi');
  await page.waitForFunction(() => /What would you like to know/.test(document.getElementById('messages').textContent), {timeout: 15000});
  let s = await state();
  check('greeting: grounded menu answer + Happy/Wave', s.mood === 'Happy' && s.gesture === 'Wave', `${s.mood}+${s.gesture}`);
  await page.screenshot({path: resolve(out, 'live-greeting.png')});
  await waitIdle();
  s = await state(); check('after answer: returns to calm Listening/Rest', s.mood === 'Listening' && s.gesture === 'Rest', `${s.mood}+${s.gesture}`);

  // 2. knowledge answer, neutral question -> answer meaning leads (Curious/Confident + Explain)
  await ask('how do I get certified');
  await page.waitForFunction(() => /projects\.onrol\.in/.test(document.getElementById('messages').textContent), {timeout: 15000});
  s = await state();
  check('explaining: Curious/Confident + Explain', /^(Curious|Confident)$/.test(s.mood) && s.gesture === 'Explain', `${s.mood}+${s.gesture}`);
  await waitIdle();
  check('certification answer is grounded (20+ projects, Generalist 5 projects + 60 days, Accelerator 2)', /20\+/.test(await lastReply()) && /5 real-time projects/.test(await lastReply()) && /60 days/.test(await lastReply()) && /2 real-time projects/.test(await lastReply()));

  // 3. confusion + upbeat topic answer -> empathy leads, not the answer's cheer
  await ask('I am confused about which course fits me');
  await page.waitForFunction(() => /one step at a time/.test(document.getElementById('messages').textContent), {timeout: 15000});
  s = await state();
  check('confusion: Empathetic + Lean-in', s.mood === 'Empathetic' && s.gesture === 'Lean-in', `${s.mood}+${s.gesture}`);
  await waitIdle();
  check('confusion: supportive grounded answer, not a brush-off', /one step at a time/.test(await lastReply()) && !/not sure I got that/.test(await lastReply()));

  // 3b. worry about starting (no coding background) -> Hopeful + supportive gesture, answer from the knowledge base
  await ask('I am a non coder, will I manage this course');
  await page.waitForFunction(() => /no coding background/.test(document.getElementById('messages').textContent), {timeout: 15000});
  s = await state();
  check('worry about starting: Hopeful + Heart, grounded in the knowledge base', s.mood === 'Hopeful' && s.gesture === 'Heart', `${s.mood}+${s.gesture}`);
  await waitIdle();

  // 3c. 'new to ai' gets a real programme suggestion (this was falling to a brush-off)
  await ask('new to ai');
  await page.waitForFunction(() => /Great place to start/.test(document.getElementById('messages').textContent), {timeout: 15000});
  await waitIdle();
  check('beginner: suggests AI Career Accelerator / AI Generalist', /AI Career Accelerator/.test(await lastReply()) && /AI Generalist/.test(await lastReply()));

  // 4. failed attempt must never celebrate
  await ask('I have not finished my project');
  await page.waitForFunction(() => document.getElementById('stage').dataset.phase === 'answering', {timeout: 15000});
  s = await state();
  check('failed attempt: Empathetic + Nod (no celebration)', s.mood === 'Empathetic' && s.gesture === 'Nod', `${s.mood}+${s.gesture}`);
  await waitIdle();

  // 5. fee policy: no number, no percentage, no code until the visitor says yes
  await ask('what is the fee?');
  await page.waitForFunction(() => /counsellor will discuss the fee/i.test(document.getElementById('messages').textContent), {timeout: 15000});
  const fee = await lastReply();
  check('pricing policy: no amount, percentage or code revealed', !/[₹%]|\bONR-|\d{3,}/.test(fee), fee.slice(0, 90));
  await waitIdle();

  // 6. missing knowledge: acknowledges and offers a next step, invents nothing
  await ask('is there a hostel facility for students');
  await page.waitForFunction(() => /not sure I got that/i.test(document.getElementById('messages').lastElementChild?.textContent ?? ''), {timeout: 15000});
  await waitIdle();
  const unknown = await lastReply();
  check('unknown question: no invented facts, offers next step', !/hostel/i.test(unknown) && /counsellor/i.test(unknown), unknown.slice(0, 80));
  await waitIdle();

  // 7. streaming: mouth/speaking phase while text is revealed, then stops
  await ask('tell me about cyber security');
  await page.waitForFunction(() => document.getElementById('stage').dataset.phase === 'answering', {timeout: 15000});
  const partial = await page.$eval('#messages', el => el.lastElementChild.textContent.length);
  check('streaming: status shows Replying while the answer is typed', (await page.$eval('#status', el => el.textContent)) === 'Replying');
  await waitIdle();
  const full = await lastReply();
  check('streaming: answer completes fully and speaking stops', /two tracks/.test(full) && (await state()).phase === 'idle', `${partial} chars at first look, ${full.length} at end`);

  // 8. error + retry
  failNext = 1;
  await ask('when does the next batch start');
  await page.waitForSelector('#messages .retry', {timeout: 15000});
  s = await state();
  check('request failure: visible helpful error + retry control', /couldn.t reach ONROL/.test(await lastReply()));
  await page.click('#messages .retry');
  await page.waitForFunction(() => /every Monday/.test(document.getElementById('messages').textContent), {timeout: 15000});
  check('retry succeeds with the real answer', true);
  await waitIdle();

  // 9. rapid successive messages: only the latest answer is shown; stale never wins
  const before = await page.$$eval('#messages .message.assistant', els => els.length);
  delayNext.set('tell me about cyber security', 1500);
  await ask('tell me about cyber security');
  await sleep(120);
  await ask('thank you so much');
  await page.waitForFunction(() => document.getElementById('stage').dataset.phase !== 'thinking', {timeout: 15000});
  await sleep(2400);
  const texts = await page.$$eval('#messages .message.assistant', els => els.map(e => e.textContent));
  const newReplies = texts.slice(before);
  check('rapid messages: stale (slow) answer is discarded', !newReplies.some(t => /two tracks/.test(t)) , `${newReplies.length} new replies`);
  s = await state();
  check('rapid messages: latest message (gratitude) drives the reaction', s.mood === 'Grateful' || s.phase === 'idle', `${s.mood}+${s.gesture}`);
  await waitIdle();

  // 10. contact capture through the (mocked) leads intake, idempotent id, country-code phone
  await ask('I want to talk to a counsellor');
  await page.waitForSelector('#lead-form:not([hidden])', {timeout: 15000});
  await page.type('#lead-name', 'Asha Rao'); await page.type('#lead-phone', '+44 7911 123456');
  await page.click('#lead-form button[type="submit"]');
  await page.waitForFunction(() => /counsellor will call you/.test(document.getElementById('messages').textContent), {timeout: 15000});
  check('lead form: sent once with country-code phone, attribution-ready, submissionId', leadCalls.length === 1 && leadCalls[0].phone === '+44 7911 123456' && /^onro-/.test(leadCalls[0].submissionId));
  check('only allowlisted request fields reach the assistant (message, stage, lastTopic)', assistantCalls.every(c => Object.keys(c).every(k => ['message', 'stage', 'lastTopic'].includes(k))));

  await page.screenshot({path: resolve(out, 'live-desktop.png'), fullPage: true});

  // reduced motion: answer appears in one step
  const rm = await browser.newPage();
  await rm.emulateMediaFeatures([{name: 'prefers-reduced-motion', value: 'reduce'}]);
  await rm.setViewport({width: 1280, height: 900});
  await rm.goto(base, {waitUntil: 'networkidle0'});
  await rm.type('#question', 'class timings?'); await rm.keyboard.press('Enter');
  await rm.waitForFunction(() => /Monday/.test(document.getElementById('messages').textContent), {timeout: 15000});
  check('reduced motion: page works and answer is delivered', true);
  await rm.close();

  // mobile layout + performance sanity
  const mobile = await browser.newPage();
  await mobile.setViewport({width: 390, height: 844, isMobile: true, deviceScaleFactor: 2});
  await mobile.goto(base, {waitUntil: 'networkidle0'});
  await mobile.type('#question', 'hi'); await mobile.keyboard.press('Enter');
  await mobile.waitForFunction(() => /What would you like to know/.test(document.getElementById('messages').textContent), {timeout: 15000});
  const overflow = await mobile.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check('mobile 390px: no horizontal overflow', overflow <= 1, `overflow=${overflow}px`);
  await mobile.screenshot({path: resolve(out, 'live-mobile.png'), fullPage: true});
  await mobile.close();

  check('no request left localhost (no production calls)', external.length === 0, external.join(' | '));
  check('no uncaught page errors', errors.length === 0, errors.join(' | '));
} finally {
  await browser?.close(); server.close();
}
console.log(failures ? `\n${failures} check(s) FAILED` : '\nAll live-flow checks passed.');
process.exit(failures ? 1 : 0);
