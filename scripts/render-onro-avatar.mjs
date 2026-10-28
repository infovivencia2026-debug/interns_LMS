// Renders ONRO's transparent avatar (public/onro-studio/onro-avatar.webp) from the real 3D mascot:
// the same model, palette and pose as the live assistant, so the corner character matches. Local only.
//   node scripts/render-onro-avatar.mjs
import {createServer} from 'node:http';
import {resolve} from 'node:path';
import {writeFile} from 'node:fs/promises';
import handler from 'serve-handler';
import puppeteer from 'puppeteer';
import sharp from 'sharp';

const server = createServer((req, res) => handler(req, res, {public: resolve('public'), cleanUrls: false}));
await new Promise(d => server.listen(0, '127.0.0.1', d));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await puppeteer.launch({executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--enable-webgl', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']});
const page = await browser.newPage();
page.on('pageerror', e => console.log('pageerror', e.message));
await page.setViewport({width: 400, height: 488, deviceScaleFactor: 2});
// Serve a throw-away page from the same origin so the module import is allowed (nothing is written to disk).
await page.setRequestInterception(true);
page.on('request', r => r.url().endsWith('/__avatar.html')
  ? r.respond({status: 200, contentType: 'text/html', body: '<!doctype html><body style="margin:0;background:transparent"><div id="s" style="width:400px;height:488px"></div><script type="module">import {createMascot} from "/onro-studio/mascot.js"; const m = createMascot(document.getElementById("s"), e => console.error(e), {transparent: true}); m.setAction({mood: "Happy", gesture: "Wave"}); window.__ready = true;</script></body>'})
  : r.continue());
await page.goto(base + '/__avatar.html');
await page.waitForFunction(() => window.__ready === true, {timeout: 20000});
await new Promise(d => setTimeout(d, 2500));                       // let the wave settle into a friendly pose
const png = await (await page.$('#s canvas')).screenshot({omitBackground: true});
await browser.close(); server.close();
const webp = await sharp(png).trim({threshold: 8}).resize({height: 244, withoutEnlargement: true}).webp({quality: 88, alphaQuality: 100}).toBuffer();
await writeFile(resolve('public/onro-studio/onro-avatar.webp'), webp);
const meta = await sharp(webp).metadata();
console.log(`wrote onro-avatar.webp ${meta.width}x${meta.height}, ${(webp.length / 1024).toFixed(0)} KB, alpha=${meta.hasAlpha}`);
