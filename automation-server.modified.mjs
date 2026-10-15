import http from 'node:http';
import { chromium } from 'playwright';
let browser;
async function fill(values, options=[]) {
  browser ??= await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('science.sparx-learning.com'));
  if (!page) throw Error('未找到 Sparx 页面');
  const fields = page.locator('input[data-ref]:visible, textarea:visible');
  let fieldIndex=0;
  for (const value of values) {
    const text=String(value);
    const field=fields.nth(fieldIndex);
    if (await field.count() && await field.isVisible()) {
      await field.click({force:true});
      if (!(await field.getAttribute('readonly'))) {
        await page.evaluate(async (v) => { try { await navigator.clipboard.writeText(v); } catch {} }, text);
        await field.click({force:true});
        await page.keyboard.press('Control+A');
        await page.keyboard.press('Control+V');
        await page.waitForTimeout(500);
      } else {
        const ref=await field.getAttribute('data-ref');
        const panel=page.locator(`[data-numeric-keypad="${ref}"]`); await panel.waitFor({state:'visible'});
        for (const ch of text) { const id={0:'zero',1:'one',2:'two',3:'three',4:'four',5:'five',6:'six',7:'seven',8:'eight',9:'nine'}[ch]; if(!id) continue; const key = page.locator("#button-" + id).last(); await key.waitFor({state:"visible"}); await key.click({force:true}); await page.waitForTimeout(180); }
      }
      fieldIndex++; continue;
    }
    const option=page.getByRole('button',{name:text,exact:true}).first();
    if (await option.count() && await option.isVisible()) await option.click();
    else { const fallback=page.getByText(text,{exact:true}).first(); if(await fallback.count()&&await fallback.isVisible()) await fallback.click(); }
  }
  return {ok:true, values:await fields.evaluateAll(es=>es.map(e=>e.value)), processed:values};
}
http.createServer(async(req,res)=>{res.setHeader('Access-Control-Allow-Origin','*');res.setHeader('Access-Control-Allow-Headers','content-type');if(req.method==='OPTIONS'){res.writeHead(204);return res.end()}try{browser ??= await chromium.connectOverCDP('http://127.0.0.1:9222');const page=browser.contexts()[0].pages().find(p=>p.url().includes('science.sparx-learning.com'));if(!page)throw Error('未找到 Sparx 页面');if(req.method==='GET'&&req.url==='/screenshot'){const shot=await page.screenshot({type:'png'});return res.end(JSON.stringify({dataUrl:`data:image/png;base64,${shot.toString('base64')}`}))}if(req.method==='POST'&&req.url==='/fill'){let b='';for await(const c of req)b+=c;const body=JSON.parse(b);const out=await fill(body.values||[],body.options||[]);return res.end(JSON.stringify(out))}res.writeHead(404);res.end()}catch(e){res.writeHead(500);res.end(JSON.stringify({error:e.message}))}}).listen(8788,()=>console.log('Automation server on http://127.0.0.1:8788'));






