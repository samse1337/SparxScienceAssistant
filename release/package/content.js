function root(){return document.querySelector("main")||document.body}
function classify(r){if(r.querySelectorAll('input[type=radio],input[type=checkbox],[role=radio],[role=option]').length)return "choice";if(r.querySelector("textarea"))return "text";if(r.querySelector('input:not([type=hidden])'))return "numeric_or_text";return "unknown"}
function readQuestion(){const r=root();const options=[...r.querySelectorAll("label,[role=option],button")].map(x=>x.innerText.trim()).filter(Boolean);const images=[...r.querySelectorAll("img")].map(x=>x.src).filter(Boolean);return {type:classify(r),text:r.innerText.trim(),options:[...new Set(options)].slice(0,30),images,url:location.href}}
async function fillAnswer(answer){const vals=Array.isArray(answer)?answer:[answer];const inputs=[...root().querySelectorAll('input:not([type=hidden]),textarea')];if(!inputs.length)throw Error("未找到输入控件");if(inputs.some(x=>x.type==="radio"||x.type==="checkbox")){for(const i of inputs){const label=(i.closest("label")?.innerText||i.value||"").trim();if(vals.some(v=>label.includes(v)||String(v).toLowerCase()===String(i.value).toLowerCase()))i.click()}return}
 const targets=vals.length>1?inputs.slice(0,vals.length):inputs.slice(0,1); for(const [idx,el] of targets.entries()){const v=String(vals[idx]??vals[0]);const target=el.closest("[data-number-field]")||el;target.dispatchEvent(new PointerEvent("pointerdown",{bubbles:true}));target.dispatchEvent(new MouseEvent("mousedown",{bubbles:true}));target.dispatchEvent(new MouseEvent("mouseup",{bubbles:true}));target.dispatchEvent(new MouseEvent("click",{bubbles:true}));await new Promise(r=>setTimeout(r,350));for(const ch of v){const panel=document.querySelector(`[data-numeric-keypad="${el.dataset.ref}"]`)||document;const ids={"0":"button-zero","1":"button-one","2":"button-two","3":"button-three","4":"button-four","5":"button-five","6":"button-six","7":"button-seven","8":"button-eight","9":"button-nine"};const btn=panel.querySelector("#"+ids[ch]);if(!btn)throw Error(`找不到数字按钮 ${ch}`);btn.click();}}return targets.map(x=>x.value);}
function pageState(){const t=root().innerText.toLowerCase();if(/teach you|教你做题|worked example|try again/.test(t))return "teaching";if(/correct|well done|正确|答对/.test(t))return "correct";if(/incorrect|wrong|错误|答错/.test(t))return "wrong";return "question"}
function clickNext(){const bs=[...root().querySelectorAll("button[id^=nav-]")];if(!bs.length)return false;let active=bs.findIndex(b=>b.getAttribute("aria-current")==="page"||b.className.includes("Active")||b.className.includes("active")||b.className.includes("selected"));if(active<0){const m=location.pathname.split("/").filter(Boolean).pop();active=m&&/^\\d+$/.test(m)?Number(m)-1:0}const i=Math.min(active+1,bs.length-1);const target=bs[i]||bs[bs.length-1];target?.click();return !!target}
function clickText(re){const els=[...root().querySelectorAll("button,a,[role=button")];const e=els.find(x=>re.test(x.innerText.trim()));if(e){e.click();return true}return false}
chrome.runtime.onMessage.addListener(async(m,s,send)=>{try{let r=m.action==="read"?readQuestion():m.action==="fill"?{ok:true,values:await fillAnswer(m.answer)}:m.action==="state"?{state:pageState()}:m.action==="next"?{ok:clickNext() }:{ok:clickText(new RegExp(m.pattern,"i"))};send(r)}catch(e){send({error:e.message})}return true});
















