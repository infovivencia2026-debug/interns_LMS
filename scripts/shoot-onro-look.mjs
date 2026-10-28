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
const sayInBox = async (page, text) => { await page.$eval('#onro-mini form:not(#onro-lead) input', (el, t) => { el.value = t; }, text); await page.$eval('#onro-mini form:not(#onro-lead)', f => f.requestSubmit()); };

browser = await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const sizes=[[320,568,2,true,'small'],[390,844,2,true,'phone']];
for(const [w,h,dsf,mob,name] of sizes){
  const {page}=await open('/',{width:w,height:h,deviceScaleFactor:dsf,isMobile:mob,hasTouch:mob});
  await page.waitForFunction(()=>document.getElementById('onro-entrance')?.dataset.phase==='rest',{timeout:60000}).catch(()=>console.log(name,'never reached rest'));
  const geo=await page.evaluate(()=>{const a=document.getElementById('onro-entrance')?.getBoundingClientRect();return a&&{x:a.x|0,y:a.y|0,w:a.width|0,h:a.height|0,ow:document.documentElement.scrollWidth-innerWidth}});
  const ar=geo||{x:w-216,y:h-260,w:200,h:244};
  const clip={x:Math.max(0,ar.x-20),y:Math.max(0,ar.y-20),width:Math.min(w-Math.max(0,ar.x-20),ar.w+40),height:Math.min(h-Math.max(0,ar.y-20),ar.h+40)};
  const shot=async(x,y)=>{if(mob){await page.touchscreen.tap(x,y).catch(()=>{});}else await page.mouse.move(x,y);await new Promise(r=>setTimeout(r,1300));return page.screenshot({clip});};
  const a=await shot(Math.max(2,ar.x-(mob?60:Math.min(600,ar.x))),Math.max(2,ar.y));
  const b=await shot(Math.min(w-2,ar.x+ar.w+ (mob?0:Math.min(300,w-ar.x-ar.w-2))),Math.min(h-2,ar.y+ar.h*.6));
  console.log(name,JSON.stringify(geo),'look-differs:',Buffer.compare(a,b)!==0);
  await page.click('#onro-entrance .onro-hi').catch(()=>{});await new Promise(r=>setTimeout(r,1500));await page.screenshot({path:'scratch-size-'+name+'.png'});
  await page.close();
}
await browser.close();server.close();
