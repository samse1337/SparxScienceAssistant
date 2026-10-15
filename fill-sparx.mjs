import { chromium } from "playwright";
const browser = await chromium.connectOverCDP(process.env.CDP_URL || "http://127.0.0.1:9222");
const context = browser.contexts()[0];
const pages = context.pages();
const page = pages.find(p => p.url().includes("science.sparx-learning.com"));
if (!page) throw new Error("未找到 Sparx 页面，请先打开题目页面");
const fields = page.locator('input[data-ref]');
if (await fields.count() < 2) throw new Error("未找到两个输入框");
async function keypad(field, value) {
  await field.click();
  const ref = await field.getAttribute("data-ref");
  const panel = page.locator(`[data-numeric-keypad="${ref}"]`);
  await panel.waitFor({state:"visible"});
  for (const ch of String(value)) {
    const id = {"0":"zero","1":"one","2":"two","3":"three","4":"four","5":"five","6":"six","7":"seven","8":"eight","9":"nine"}[ch];
    await panel.locator(`#button-${id}`).click();
  }
}
await keypad(fields.nth(0), "16");
await keypad(fields.nth(1), "3");
console.log("填写完成", await fields.nth(0).inputValue(), await fields.nth(1).inputValue());
