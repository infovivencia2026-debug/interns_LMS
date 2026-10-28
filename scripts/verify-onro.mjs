import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import handler from 'serve-handler';
import puppeteer from 'puppeteer';
import {actions,moods,gestures} from '../public/onro-studio/actions.js';

// Local-only preview server and a real browser: no production calls or credentials.
const server=createServer((req,res)=>handler(req,res,{public:resolve('public')}));
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}/onro-studio/`;
const out=resolve('output/onro');await mkdir(out,{recursive:true});
let browser;
try {
  browser=await puppeteer.launch({executablePath:process.env.PUPPETEER_EXECUTABLE_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const page=await browser.newPage();
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  page.on('response',response=>{if(response.status()>=400&&!response.url().endsWith('favicon.ico'))errors.push(`${response.status()} ${response.url()}`);});
  await page.setViewport({width:1440,height:1100});await page.goto(`${base}studio.html`,{waitUntil:'networkidle0'});
  assert.equal(await page.$eval('#error',el=>el.hidden),true,'WebGL should initialize');
  await page.waitForSelector('canvas');await page.click('#pause');
  const frames=new Set();
  const samples=[...moods.map(mood=>({mood,gesture:'Explain'})),...gestures.filter(gesture=>gesture!=='Explain').map(gesture=>({mood:'Happy',gesture}))];
  for(const action of samples){
    await page.click(`[data-mood="${action.mood}"]`);await page.click(`[data-gesture="${action.gesture}"]`);
    await page.waitForFunction(text=>document.getElementById('playing').textContent===text,{},`${action.mood} · ${action.gesture}`);
    await new Promise(resolve=>setTimeout(resolve,160));
    frames.add((await (await page.$('canvas')).screenshot()).toString('base64'));
  }
  assert.equal(frames.size,samples.length,'Every expression and movement should render differently');
  await page.click('[data-mood="Happy"]');await page.click('[data-gesture="Wave"]');await new Promise(resolve=>setTimeout(resolve,400));
  await page.screenshot({path:resolve(out,'studio.png'),fullPage:true});
  await page.click('[data-prompt="confused"]');await page.waitForFunction(()=>document.getElementById('playing').textContent==='Empathetic · Explain');
  await page.click('[data-prompt="success"]');await page.waitForFunction(()=>document.getElementById('playing').textContent==='Excited · Celebrate');
  assert.match(await page.$eval('#answer',el=>el.textContent),/made something real/);
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('onro:reaction',{detail:{phase:'thinking'}})));
  assert.equal(await page.$eval('#playing',el=>el.textContent),'Thinking · Turn');
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('onro:reaction',{detail:{mood:'<script>',gesture:'no'}})));
  assert.equal(await page.$eval('#playing',el=>el.textContent),'Thinking · Turn');
  await page.click('#view');assert.equal(await page.$eval('#concept',el=>el.hidden),false);await page.click('#view');
  await page.setViewport({width:390,height:844});await new Promise(resolve=>setTimeout(resolve,200));
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'Mobile must not overflow');
  await page.screenshot({path:resolve(out,'mobile.png'),fullPage:true});
  await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
  await page.click('[data-mood="Curious"]');await page.click('[data-gesture="Explain"]');await new Promise(resolve=>setTimeout(resolve,500));
  const before=(await (await page.$('canvas')).screenshot()).toString('base64');await new Promise(resolve=>setTimeout(resolve,400));
  assert.equal((await (await page.$('canvas')).screenshot()).toString('base64'),before,'Reduced motion keeps the mascot still');
  assert.deepEqual(errors,[]);
  // The visitor preview has normal conversation UI and no animation controls.
  await page.goto(base,{waitUntil:'networkidle0'});
  assert.equal(await page.$$eval('button',els=>els.map(el=>el.textContent).join(',')),'Send');
  await page.type('#question','I haven’t finished my project');await page.click('button[type="submit"]');
  await page.waitForFunction(()=>document.getElementById('stage').dataset.phase==='answering');
  assert.equal(await page.$eval('#stage',el=>el.dataset.mood),'Empathetic');
  await page.type('#question','I built my first project!');await page.click('button[type="submit"]');
  await page.waitForFunction(()=>document.getElementById('stage').dataset.mood==='Proud'&&document.getElementById('stage').dataset.phase==='answering'&&!document.querySelector('button[type="submit"]').disabled);
  assert.equal(await page.$eval('#stage',el=>el.dataset.gesture),'Clap');
  await page.type('#question','<img src=x onerror=alert(1)>');await page.click('button[type="submit"]');
  await page.waitForFunction(()=>document.querySelectorAll('#messages .assistant').length===4);
  assert.equal(await page.$$eval('#messages img',els=>els.length),0,'Chat text must never become HTML');
  await page.waitForFunction(()=>document.getElementById('stage').dataset.phase==='idle');
  await page.screenshot({path:resolve(out,'mobile.png'),fullPage:true});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await page.setViewport({width:1440,height:1000});await page.screenshot({path:resolve(out,'desktop.png'),fullPage:true});
  assert.deepEqual(errors,[]);
  // Force the WebGL constructor failure to verify the concept fallback.
  const fallback=await browser.newPage();
  await fallback.evaluateOnNewDocument(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return type.startsWith('webgl')?null:original.call(this,type,...args);};});
  await fallback.goto(base,{waitUntil:'networkidle0'});assert.equal(await fallback.$eval('#concept',el=>el.hidden),false);assert.equal(await fallback.$eval('#error',el=>el.hidden),false);
  console.log(`Verified ${moods.length} expressions, ${gestures.length} movements, ${actions.length} combinations, automatic conversation reactions, no visitor animation controls, safe text, mobile, reduced motion and WebGL fallback.`);
  console.log(`Screenshots: ${out}`);
} finally {await browser?.close();await new Promise(resolve=>server.close(resolve));}
