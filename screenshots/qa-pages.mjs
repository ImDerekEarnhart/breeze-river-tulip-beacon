import { chromium } from "playwright";
const browser = await chromium.launch({ headless: true });
const pages = [
  ["/architecture", "architecture"],
  ["/tower", "tower"],
  ["/orbita", "orbita"],
  ["/traces", "traces"],
  ["/memory", "memory"],
];
for (const [path, name] of pages) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  await page.goto("http://127.0.0.1:8080" + path, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  await page.screenshot({ path: `/workspace/screenshots/${name}-desktop.png`, fullPage: false });
  const mob = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const mErr = [];
  mob.on("pageerror", (e) => mErr.push(String(e)));
  await mob.goto("http://127.0.0.1:8080" + path, { waitUntil: "networkidle" });
  await mob.waitForTimeout(300);
  await mob.screenshot({ path: `/workspace/screenshots/${name}-mobile.png` });
  const overflow = await mob.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  console.log(JSON.stringify({ name, errors, mErr, overflow }));
  await page.close();
  await mob.close();
}
await browser.close();
