import http from 'node:http';
import { chromium } from 'playwright';
let browser;
async function fillTwoNumeric(page, values) {
  const nums=values.map(String), log=[];
  for (let i=0;i<nums.length;i++) {
    const field=page.locator('input[data-ref]:visible').nth(i);
    const ref=await field.getAttribute('data-ref');
    if(i>0){await page.evaluate(()=>{const k=document.querySelector('[data-entry-panel="keypad"]');if(k)k.style.pointerEvents='none'});await page.waitForTimeout(300);await field.evaluate(el=>{for(const t of ['pointerdown','mousedown','pointerup','mouseup','click'])el.dispatchEvent(new MouseEvent(t,{bubbles:true}))});}else await field.click({force:true});
    await page.waitForTimeout(500);
    const panel=page.locator('[data-entry-panel="keypad"]:visible [data-numeric-keypad="'+ref+'"]');
    await panel.waitFor({state:'visible',timeout:5000});
    for(const ch of nums[i]){const id={0:'zero',1:'one',2:'two',3:'three',4:'four',5:'five',6:'six',7:'seven',8:'eight',9:'nine'}[ch];const key=panel.locator('#button-'+id);const box=await key.boundingBox();await key.evaluate(el=>el.click());await page.waitForTimeout(500);log.push({i,ref,ch,box,value:await field.inputValue()});}
  }
  await page.keyboard.press('Escape'); await page.waitForTimeout(300);
  const valuesNow=await page.locator('input[data-ref]:visible').evaluateAll((es,n)=>es.slice(0,n).map(e=>e.value),nums.length);
  return {valuesNow,log};
}
async function fill(values, options=[]) {
  browser ??= await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('science.sparx-learning.com'));
  if (!page) throw Error('未找到 Sparx 页面');
  const fields = page.locator('input[data-ref]:visible, textarea:visible');
  const fieldCount=await fields.count();
  const fieldValues=values.slice(0,fieldCount);
  const choiceValues=values.slice(fieldCount);
  let numericLog=[];
  const allReadonly=await fields.evaluateAll(es=>es.length>0&&es.every(e=>e.readOnly));
  if(allReadonly && fieldCount>=1){const fixed=await fillTwoNumeric(page,fieldValues);numericLog=fixed.log;if(fixed.valuesNow.some((v,i)=>v!==String(fieldValues[i])))throw Error('固定数字流程未确认: '+JSON.stringify(fixed));fieldValues.splice(0);}
  let fieldIndex=0;
  for (const value of fieldValues) {
    const text=String(value);
    const field=fields.nth(fieldIndex);
    if (fieldIndex>0) { await page.evaluate(() => { const k=document.querySelector('[data-entry-panel="keypad"]'); if(k) k.style.pointerEvents='none'; }); await page.waitForTimeout(300); }
    if (await field.count() && await field.isVisible()) {
      if (fieldIndex>0) { await field.evaluate(el=>{for(const t of ['pointerdown','mousedown','pointerup','mouseup','click']) el.dispatchEvent(new MouseEvent(t,{bubbles:true,clientX:1,clientY:1}));}); } else await field.click({force:true});
      if (fieldIndex>0) await page.waitForTimeout(1000);
      if (!(await field.getAttribute('readonly'))) {
        await page.evaluate(async (v) => { try { await navigator.clipboard.writeText(v); } catch {} }, text);
        await field.click({force:true});
        await page.keyboard.press('Control+A');
        await page.keyboard.press('Control+V');
        await page.waitForTimeout(500);
      } else {
        const ref=await field.getAttribute('data-ref');
        const panel=page.locator('[data-numeric-keypad="'+ref+'"]:visible');
        await panel.waitFor({state:'visible',timeout:5000});
        await panel.evaluate(el=>{el.style.pointerEvents='auto'});
        for (const ch of text) { const id={0:'zero',1:'one',2:'two',3:'three',4:'four',5:'five',6:'six',7:'seven',8:'eight',9:'nine'}[ch]; if(!id) continue; const key=panel.locator('#button-'+id); await key.waitFor({state:'visible'}); let changed=false; for(let attempt=0;attempt<3&&!changed;attempt++){await key.evaluate(el=>{el.style.pointerEvents='auto';el.click()}); await page.waitForTimeout(1200); changed=await field.inputValue()!=='';} if(!changed) throw Error('数字键 '+ch+' 点击后 value 仍为空'); }
      }
      fieldIndex++; continue;
    }
  }
  const numericValues=await fields.evaluateAll(es=>es.map(e=>e.value));
  if (fieldValues.length && numericValues.some((v,i)=>String(v)!==String(fieldValues[i]))) throw Error('数字阶段未确认: expected='+JSON.stringify(fieldValues)+' actual='+JSON.stringify(numericValues));
  await page.evaluate(()=>{const k=document.querySelector('[data-entry-panel="keypad"]');if(k)k.style.pointerEvents='none'}); await page.waitForTimeout(500);
  await page.waitForTimeout(1000);
  for (const value of choiceValues) {
    const text=String(value);
    const pair=text.match(/^\s*(.+?)\s*(?:=>|->)\s*(.+?)\s*$/);
    if(pair){
      const source=page.getByText(pair[1],{exact:true}).first(); const target=page.getByText(pair[2],{exact:true}).first();
      if(await source.count()&&await target.count()){for(const el of [source,target]){const box=await el.locator('xpath=ancestor::*[@data-ref][1]').locator('[class*="DotContainer"]').boundingBox();if(!box)throw Error('连接点无坐标');await page.mouse.click(box.x+box.width/2,box.y+box.height/2);await page.waitForTimeout(700);}continue;}
    }
    const option=page.getByRole('button',{name:text,exact:true}).first();
    if (await option.count() && await option.isVisible()) await option.evaluate(el=>el.click());
    else { const fallback=page.getByText(text,{exact:true}).first(); if(await fallback.count()&&await fallback.isVisible()) await fallback.evaluate(el=>el.click()); }
  }
  return {ok:true, serverVersion:'fixed-two-field-2026-10-16', numericLog, numericValues, values:await fields.evaluateAll(es=>es.map(e=>e.value)), processed:values};
}
http.createServer(async(req,res)=>{res.setHeader('Access-Control-Allow-Origin','*');res.setHeader('Access-Control-Allow-Headers','content-type');if(req.method==='OPTIONS'){res.writeHead(204);return res.end()}try{browser ??= await chromium.connectOverCDP('http://127.0.0.1:9222');const page=browser.contexts()[0].pages().find(p=>p.url().includes('science.sparx-learning.com'));if(!page)throw Error('未找到 Sparx 页面');if(req.method==='GET'&&req.url==='/screenshot'){const shot=await page.screenshot({type:'png'});return res.end(JSON.stringify({dataUrl:`data:image/png;base64,${shot.toString('base64')}`}))}if(req.method==='POST'&&req.url==='/fill'){let b='';for await(const c of req)b+=c;const body=JSON.parse(b);const out=await fill(body.values||[],body.options||[]);return res.end(JSON.stringify(out))}res.writeHead(404);res.end()}catch(e){res.writeHead(500);res.end(JSON.stringify({error:e.message}))}}).listen(8788,()=>console.log('Automation server on http://127.0.0.1:8788'));
















