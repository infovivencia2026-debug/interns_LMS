import {createServer} from 'node:http';
import {readFile, stat} from 'node:fs/promises';
import {resolve, join, extname, normalize} from 'node:path';
import puppeteer from 'puppeteer';
const root = p => resolve(p);
const OVERLAYS = [(u) => join(root('deploy-staging/sitefix'), u),(u) => u.startsWith('/onro-studio/') ? join(root('deploy-staging'), u) : null,
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
const base = 'https://onrol.in';
const browser = await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
for (const path of ['/', '/programs/ai-generalist/', '/programs/', '/blog/ai-generalist-vs-ai-architect/', '/ai-course-in-hyderabad/', '/about/']) {
  const page = await browser.newPage(); await page.setViewport({width:1280,height:800});
  const errs=[]; page.on('pageerror',e=>errs.push(e.message.slice(0,140))); page.on('console',m=>{const t=m.text(); if(m.type()==='error'&&!/Failed to load resource|ERR_|net::/.test(t)) errs.push('console: '+t.slice(0,140));});
  await page.setRequestInterception(true);
  page.on('request',r=>{const u=r.url(); if(u.startsWith(base)||u.startsWith('https://go.onrol.in')||u.startsWith('data:')||u.startsWith('blob:')) r.continue(); else r.abort();});
  await page.goto(base+path,{waitUntil:'domcontentloaded'}); await new Promise(r=>setTimeout(r,9000));
  const info = await page.evaluate(()=>({h1:document.querySelector('h1')?.innerText.slice(0,50), body:document.body.innerText, root:document.querySelector('#root')?.children.length}));
  const bad=/7\+ ?(real |deployable )?projects?/.test(info.body), good=/5 projects chosen from 20\+|5 projects from 20\+/.test(info.body);
  console.log(path.padEnd(40),'h1=',JSON.stringify(info.h1),'| old claim visible:',bad,'| new claim visible:',good,'| errors:',errs.length?errs.join(' || '):'none');
  await page.close();
}
await browser.close(); server.close();
