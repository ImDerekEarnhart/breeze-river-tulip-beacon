import { chromium } from "playwright";
const browser = await chromium.launch({ headless: true });

const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
await page.goto("http://127.0.0.1:8080/desktop", { waitUntil: "networkidle" });
await page.waitForTimeout(400);
await page.screenshot({ path: "/workspace/screenshots/desktop-stopped.png" });
await page.getByRole("button", { name: "Start" }).click();
await page.waitForTimeout(2000);
await page.screenshot({ path: "/workspace/screenshots/desktop-running.png" });
await page.getByRole("button", { name: "Try sudo" }).click();
await page.waitForTimeout(300);
const deny = await page.locator("text=deny").count();
await page.screenshot({ path: "/workspace/screenshots/desktop-deny.png" });

const mob = await browser.newPage({ viewport: { width: 390, height: 844 } });
const mErr = [];
mob.on("pageerror", (e) => mErr.push(String(e)));
await mob.goto("http://127.0.0.1:8080/desktop", { waitUntil: "networkidle" });
await mob.waitForTimeout(400);
const overflow = await mob.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
await mob.screenshot({ path: "/workspace/screenshots/desktop-mobile.png" });

const con = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await con.goto("http://127.0.0.1:8080/", { waitUntil: "networkidle" });
await con.getByRole("button", { name: /Clear/i }).click().catch(() => {});
await con.getByRole("button", { name: /^Desktop$/ }).first().click().catch(async () => {
  await con.getByRole("button", { name: /Take a PocketDesktop screenshot/i }).click();
});
await con.waitForTimeout(400);
const clicked = await con.locator("text=Take a PocketDesktop").count();
if (clicked) {
  await con.getByRole("button", { name: /Take a PocketDesktop screenshot/i }).click();
}
await con.waitForFunction(() => {
  const t = document.body.innerText;
  return /allow-list|chromium|PocketDesktop running|screenshot|Tailscale/i.test(t) && !/Worker is running/.test(t);
}, { timeout: 25000 });
await con.waitForTimeout(1200);
await con.screenshot({ path: "/workspace/screenshots/console-desktop.png" });
const text = await con.evaluate(() => document.body.innerText);
console.log(JSON.stringify({
  errors, mErr, overflow, deny,
  snippet: text.slice(text.indexOf("Take a PocketDesktop"), text.indexOf("FAST LOOP")).slice(0, 900),
}, null, 2));
await browser.close();
