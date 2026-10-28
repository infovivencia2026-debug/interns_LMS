// Browser checks for the public learning-pathway pages. No enquiries are sent.
// Usage: node scripts/verify-pathways.mjs (start Vite on port 8081 first).
import assert from "node:assert/strict";
import { mkdirSync, existsSync } from "node:fs";
import puppeteer from "puppeteer";

const base = process.env.PATHWAYS_BASE_URL || "http://127.0.0.1:8081";
const output = ".qa/pathways";
mkdirSync(output, { recursive: true });
const installed = [process.env.CHROME_PATH, "C:/Program Files/Google/Chrome/Application/chrome.exe", puppeteer.executablePath()].find(p => p && existsSync(p));
const browser = await puppeteer.launch({ headless: true, executablePath: installed });
const page = await browser.newPage();
const errors = [];
page.on("pageerror", error => errors.push(error.message));

async function visit(path, width = 1440) {
  await page.setViewport({ width, height: 1000 });
  await page.goto(`${base}${path}`, { waitUntil: "networkidle2" });
  await page.waitForSelector("h1");
  await page.waitForSelector(".spre", { hidden: true });
  await page.waitForSelector("#preloader", { hidden: true });
  await page.evaluate(() => document.fonts.ready);
}
async function clickText(selector, text) {
  const elements = await page.$$(selector);
  for (const element of elements) {
    if ((await element.evaluate(el => el.textContent)).includes(text)) {
      await element.click();
      return;
    }
  }
  throw new Error(`Cannot find ${text}`);
}
async function fits() {
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), "Page must not overflow horizontally");
}

try {
  await visit("/college-programs");
  assert.match(await page.title(), /College Programs/);
  await fits();
  await page.screenshot({ path: `${output}/college-desktop.png` });
  const pathways = await page.$$eval("#pathways .sx-card", cards => cards.map(card => card.textContent));
  assert.equal(pathways.length, 3);
  assert.match(pathways[1], /defender/);
  assert.match(pathways[2], /prototype/);
  assert.equal((await page.$$("#formats .sx-rows article")).length, 3);
  await clickText(".pw-faq summary", "coding experience");
  assert(await page.$eval(".pw-faq details:nth-child(2)", el => el.open));
  assert.equal(await page.$eval(".pw-form", el => el.checkValidity()), false);
  await page.type('input[name="name"]', "Browser Test");
  await page.type('input[name="email"]', "test@example.com");
  await page.type('input[name="context"]', "Example College, Hyderabad");
  await page.select('select[name="interest"]', "Campus workshop");
  // Intercept the external action: validate its destination without opening WhatsApp.
  await page.evaluate(() => { window.open = url => { window.__testWhatsApp = url; return null; }; });
  await page.click('.pw-form button[type="submit"]');
  const enquiryUrl = await page.evaluate(() => window.__testWhatsApp);
  assert.match(enquiryUrl, /^https:\/\/wa.me\/918121306701\?text=/);
  assert.match(decodeURIComponent(enquiryUrl), /Example College, Hyderabad/);

  await visit("/college-partnerships");
  await clickText(".sx-tabs button", "Internships");
  assert.match(await page.$eval(".sx-panel", el => el.textContent), /professional roles/);
  await clickText(".sx-tabs button", "Career readiness");
  assert.match(await page.$eval(".sx-panel", el => el.textContent), /resume/i);
  assert.equal((await page.$$("#delivery .sx-card")).length, 5);
  assert.equal((await page.$$("#process .sx-steps li")).length, 5);
  assert.equal(await page.$eval(".pw-form", el => el.checkValidity()), false);

  await visit("/international");
  assert.match(await page.title(), /International Learners/);
  assert.equal((await page.$$("#global-programs .pw-card")).length, 5);
  await clickText(".pw-filter-row button", "Cybersecurity");
  assert.equal((await page.$$("#global-programs .pw-card")).length, 2);
  await clickText(".pw-filter-row button", "All programs");
  await page.select(".pw-zone-controls>label select", "America/New_York");
  await page.select(".pw-zone-controls .pw-form-row select", "18");
  async function setDate(date) {
    await page.$eval('input[type="date"]', (el, value) => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(el, value);
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }, date);
  }
  await setDate("2026-01-15");
  assert.match(await page.$eval(".pw-zone-result strong", el => el.textContent), /07:30/);
  await setDate("2026-07-15");
  assert.match(await page.$eval(".pw-zone-result strong", el => el.textContent), /08:30/);
  await page.select(".pw-zone-controls>label select", "Australia/Sydney");
  await page.select(".pw-zone-controls .pw-form-row select", "20");
  await setDate("2026-01-15");
  assert.match(await page.$eval(".pw-zone-result strong", el => el.textContent), /16 Jan/);
  await fits();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: `${output}/international-desktop.png` });

  for (const path of ["/college-programs", "/college-partnerships", "/international"]) {
    for (const width of [375, 768, 1024]) {
      await visit(path, width);
      await fits();
      if (width === 375) {
        await page.click("#onrol-menu-toggle");
        assert.equal(await page.$eval("#onrol-menu-toggle", el => el.getAttribute("aria-expanded")), "true");
        await page.click("#onrol-menu-toggle");
        await page.screenshot({ path: `${output}/${path.slice(1)}-mobile.png` });
      }
    }
  }
  await visit("/college-programs", 375);
  await page.click("#onrol-menu-toggle");
  await clickText("#onrol-nav-links a", "Partnerships");
  await page.waitForFunction(() => location.pathname === "/college-partnerships");
  await page.waitForFunction(() => /Empowering colleges/.test(document.querySelector("h1")?.textContent ?? ""));
  assert.match(await page.$eval("h1", el => el.textContent), /Empowering colleges/);

  for (const path of ["/", "/programs"]) {
    for (const width of [375, 901, 1023, 1024, 1280, 1440]) {
      console.log(`Checking existing navigation: ${path} at ${width}px`);
      await visit(path, width);
      assert.equal((await page.$$('#onrol-nav-links a[href="/college-programs"]')).length, 1);
      assert.equal((await page.$$('#onrol-nav-links a[href="/college-partnerships"]')).length, 1);
      assert.equal((await page.$$('#onrol-nav-links a[href="/international"]')).length, 0);
      const overflow = await page.$eval("#onrol-navbar", el => el.scrollWidth > el.clientWidth);
      assert(!overflow, `${path} navigation must fit at ${width}px`);
      if (width < 1024) {
        await page.click("#onrol-menu-toggle");
        await page.waitForFunction(() => document.querySelector("#onrol-nav-links").classList.contains("is-open"));
      }
      assert(await page.$$eval("#onrol-nav-links a", links => links.every(link => {
        const bounds = link.getBoundingClientRect();
        return bounds.width > 0 && bounds.left >= 0 && bounds.right <= innerWidth;
      })), `${path} links must be visible and inside the viewport at ${width}px`);
      if (path === "/" && width === 1024) await page.screenshot({ path: `${output}/home-navigation-tablet.png` });
    }
  }
  let navbarTheme;
  for (const path of ["/", "/programs", "/programs/ai-generalist", "/about", "/contact", "/college-programs", "/college-partnerships", "/international", "/privacy-policy"]) {
    console.log(`Checking shared navbar theme: ${path}`);
    await visit(path);
    const theme = await page.$eval("#onrol-navbar", header => {
      const style = getComputedStyle(header);
      const link = getComputedStyle(header.querySelector('a[href="/college-partnerships"]'));
      const apply = getComputedStyle(header.querySelector(".onrol-nav-apply"));
      return { background: style.backgroundColor, height: style.height, position: style.position, font: link.fontFamily, fontSize: link.fontSize, applyBackground: apply.backgroundColor, applyColor: apply.color };
    });
    navbarTheme ??= theme;
    assert.deepEqual(theme, navbarTheme, `Navbar theme must match on ${path}`);
    assert.equal(await page.$$eval("header, nav.nav, a.site-logo", nodes => nodes.filter(node => node.matches('#onrol-navbar, #home-glydi .nav, #home-glydi .site-logo') && node.getBoundingClientRect().width > 0).length), 1);
  }
  await visit("/international", 375);
  await page.click("#onrol-menu-toggle");
  await page.keyboard.press("Escape");
  assert.equal(await page.$eval("#onrol-menu-toggle", button => button.getAttribute("aria-expanded")), "false");
  assert.deepEqual(errors, [], "No uncaught browser errors");
  console.log("PASS: desktop/mobile layouts, pathway selection, program filters, FAQ, form validation, WhatsApp message, DST/date rollover, route navigation and existing navigation links.");
  console.log(`Screenshots: ${output}`);
} finally {
  await browser.close();
}
