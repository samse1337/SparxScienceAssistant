import {chromium} from 'playwright';
const b=await chromium.connectOverCDP('http://127.0.0.1:9222');
const p=b.contexts()[0].pages().find(p=>p.url().includes('science.sparx-learning.com'));
console.log('URL',p?.url());
if(p){console.log(await p.locator('input[data-ref]:visible').evaluateAll(es=>es.map(e=>({ref:e.dataset.ref,value:e.value,ro:e.readOnly,cls:e.className}))));console.log(await p.locator('[data-entry-panel="keypad"]:visible').evaluateAll(ps=>ps.map(x=>({html:x.outerHTML.slice(0,500)}))));}
await b.close();
