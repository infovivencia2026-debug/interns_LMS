import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import puppeteer from 'puppeteer';

const base=process.argv[2];if(!base)throw new Error('Pass the local homepage URL.');
const url=new URL(base);if(!['localhost','127.0.0.1'].includes(url.hostname))throw new Error('This verification runs only against a local preview.');
const out=resolve('output/onro-entrance');await mkdir(out,{recursive:true});
const browser=await puppeteer.launch({executablePath:process.env.PUPPETEER_EXECUTABLE_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try {
  for(const mobile of [false,true]) {
    const page=await browser.newPage();await page.setViewport(mobile?{width:390,height:844}:{width:1440,height:1000});
    if(mobile)await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
    await page.setRequestInterception(true);
    page.on('request',request=>{if(request.method()!=='GET'||/go\.onrol\.in\/api\//.test(request.url()))request.abort();else request.continue();});
    const errors=[];page.on('pageerror',error=>errors.push(error.message));
    await page.goto(base,{waitUntil:'domcontentloaded'});
    try {
      await page.waitForFunction(()=>document.getElementById('onro-entrance')?.dataset.phase==='greeting',{timeout:45000});
      assert.equal(await page.$eval('.onro-hi',el=>el.textContent),'Hi! I’m ONRO.');
      assert.equal(await page.evaluate(()=>document.body.classList.contains('loading')),false);
      const stage=await page.$('#onro-entrance');const box=await stage.boundingBox();
      assert.ok(box.x>=0&&box.x+box.width<=(mobile?390:1440));
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
      assert.equal(await page.$eval('#onro-entrance canvas',el=>getComputedStyle(el).backgroundColor),'rgba(0, 0, 0, 0)');
      await page.screenshot({path:resolve(out,mobile?'mobile.png':'desktop.png')});
      await page.click('#onro-launcher .onro-btn');
      await page.waitForFunction(()=>!document.getElementById('onro-entrance'));
      assert.equal(await page.$eval('#onro-panel',el=>el.dataset.open),'true');
      const newErrors=errors.filter(message=>/entrance|mascot|onro/i.test(message));assert.deepEqual(newErrors,[]);
      console.log(`${mobile?'Mobile/reduced motion':'Desktop'}: greeting after intro, transparency, viewport bounds and chat opening passed.`);
    } catch(error) {await page.screenshot({path:resolve(out,mobile?'mobile-failure.png':'desktop-failure.png')});console.log('Browser errors:',errors);throw error;}
    await page.close();
  }
} finally {await browser.close();}
