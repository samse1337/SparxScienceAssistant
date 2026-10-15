import {chromium} from 'playwright';
const b=await chromium.connectOverCDP('http://127.0.0.1:9222');const p=b.contexts()[0].pages().find(p=>p.url().includes('science.sparx-learning.com'));if(!p)throw Error('no page');
const fs=p.locator('input[data-ref]:visible');console.log('fields',await fs.count());
for(let i=0;i<2;i++){const f=fs.nth(i);console.log('before',i,await f.getAttribute('data-ref'),await f.inputValue(),await f.getAttribute('readonly'));await f.click({force:true});await p.waitForTimeout(1000);const ref=await f.getAttribute('data-ref');const panel=p.locator('[data-numeric-keypad="'+ref+'"]:visible');console.log('panel',ref,await panel.count(),await panel.locator('button').count());const ch=i?'7':'1';const key=panel.locator('#button-'+(i?'seven':'one'));console.log('key visible',await key.isVisible());await key.click({force:true});await p.waitForTimeout(1200);console.log('after',i,await f.inputValue());}
await b.close();
