import {createServer} from 'node:http';
import {readFile, stat} from 'node:fs/promises';
import {resolve, join, extname, normalize} from 'node:path';
import puppeteer from 'puppeteer';
const root = p => resolve(p);
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
await browser.close();
