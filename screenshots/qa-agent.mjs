import { chromium } from "playwright";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on("pageerror", (e) => errors.push("page:" + String(e)));
page.on("console", (m) => { if (m.type() === "error") errors.push("console:" + m.text()); });
await page.goto("http://127.0.0.1:8080/", { waitUntil: "networkidle" });
await page.waitForTimeout(500);
const sample = page.getByRole("button", { name: /Why shouldn't the agent live inside vLLM/i });
await sample.click();
await page.waitForTimeout(500);
await page.screenshot({ path: "/workspace/screenshots/console-running.png" });
try {
  await page.waitForSelector("text=Worker is running", { timeout: 5000 }).catch(() => {});
  // wait for an assistant badge or error
  await page.waitForFunction(() => {
    const t = document.body.innerText;
    return /student|teacher|governed|xAI API|Agent failed|not available/i.test(t) && !/Worker is running/.test(t);
  }, { timeout: 90000 });
} catch (e) {
  console.log("wait failed", e.message);
}
await page.waitForTimeout(800);
await page.screenshot({ path: "/workspace/screenshots/console-result.png" });
const text = await page.evaluate(() => document.body.innerText.slice(0, 2500));
console.log(JSON.stringify({ errors, text }, null, 2));
await browser.close();
