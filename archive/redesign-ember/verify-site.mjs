// Smoke test for the public site pages in src/site (Ember design system).
// Usage: node scripts/verify-site.mjs   (SITE_BASE_URL defaults to http://127.0.0.1:8081)
import assert from "node:assert/strict";
import puppeteer from "puppeteer";

const base = process.env.SITE_BASE_URL || "http://127.0.0.1:8081";
const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const page = await browser.newPage();
const errors = [];
page.on("pageerror", error => errors.push(error.message));

async function visit(path, width = 1280) {
  await page.setViewport({ width, height: 900 });
  await page.goto(base + path, { waitUntil: "networkidle0" });
  await page.waitForSelector(".spre, #preloader", { hidden: true, timeout: 8000 }).catch(() => {});
}
const fits = () => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);

const routes = [
  ["/", /Build your first/],
  ["/programs", /Five programs/],
  ["/programs/ai", /Five programs/],
  ["/programs/cyber", /Five programs/],
  ["/programs/aica", /Accelerator/],
  ["/programs/ai-generalist", /Generalist/],
  ["/programs/ai-architect", /Architect/],
  ["/programs/cybersecurity", /Security/],
  ["/programs/soc-analyst", /Analyst/],
  ["/about", /Execution School/],
  ["/contact", /connect/],
];
for (const [path, heading] of routes) {
  for (const width of [375, 1280]) {
    await visit(path, width);
    assert.match(await page.$eval("h1", el => el.textContent), heading, `${path} heading`);
    assert(await fits(), `${path} must not overflow at ${width}px`);
    assert.equal(await page.$$eval("footer.ox-footer", f => f.length), 1, `${path} renders the footer`);
  }
}

// track filter: AI shows three programs, cyber two
await visit("/programs/cyber");
await page.waitForFunction(() => document.querySelectorAll(".ox-program").length === 2);
await visit("/");
await page.evaluate(() => [...document.querySelectorAll(".ox-filter button")].find(b => /AI track/.test(b.textContent)).click());
await page.waitForFunction(() => document.querySelectorAll(".ox-program").length === 3);

// the navbar Apply opens this page's dialog instead of navigating away
await page.click(".onrol-nav-apply");
await page.waitForSelector(".ox-modal [role=dialog]");
assert.equal(new URL(page.url()).pathname, "/");
assert.equal(await page.$eval(".ox-modal form", form => form.checkValidity()), false, "empty apply form is invalid");
await page.keyboard.press("Escape");
await page.waitForSelector(".ox-modal", { hidden: true });

// program pages pass their course into the dialog
await visit("/programs/soc-analyst");
await page.evaluate(() => [...document.querySelectorAll("button")].find(b => /Apply for this program/.test(b.textContent)).click());
await page.waitForSelector(".ox-modal [role=dialog]");
assert.match(await page.$eval(".ox-modal", el => el.textContent), /SOC Analyst Program/);

assert.deepEqual(errors, [], "No uncaught browser errors");
await browser.close();
console.log(`PASS: ${routes.length} routes at 375px and 1280px, track filter, Apply dialog (navbar + program course).`);
