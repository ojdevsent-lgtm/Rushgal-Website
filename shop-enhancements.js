const $$ = s => [...document.querySelectorAll(s)];
const $ = s => document.querySelector(s);

const CUSTOMER_CATEGORIES = [
  ['all','All pieces'],
  ['dresses','Dresses'],
  ['tops','Tops & Blouses'],
  ['skirts','Skirts'],
  ['trousers','Trousers & Jeans'],
  ['two-piece','Two-Piece Sets'],
  ['jumpsuits','Jumpsuits & Playsuits'],
  ['outerwear','Outerwear'],
  ['traditional','Traditional & Occasion Wear'],
  ['lounge','Lounge & Casual'],
  ['activewear','Activewear'],
  ['beachwear','Beachwear'],
  ['accessories','Accessories'],
  ['footwear','Footwear']
];

function addCopyButton(){
  const code = $('#confirmationCode');
  if(!code || code.dataset.copyReady)return;
  code.dataset.copyReady='1';
  const wrap=document.createElement('div');
  wrap.className='tracking-copy-wrap';
  wrap.style.cssText='display:flex;align-items:center;justify-content:center;gap:8px;margin:10px 0 16px;flex-wrap:wrap';
  const button=document.createElement('button');
  button.type='button'; button.className='button'; button.textContent='Copy tracking ID';
  button.addEventListener('click',async()=>{
    const value=code.textContent.trim();
    try{await navigator.clipboard.writeText(value);button.textContent='Copied ✓';}
    catch{const ta=document.createElement('textarea');ta.value=value;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();button.textContent='Copied ✓';}
    setTimeout(()=>button.textContent='Copy tracking ID',1800);
  });
  code.insertAdjacentElement('afterend',wrap);wrap.appendChild(button);
}

function addTrackingGuide(){
  if($('#shopTrackingGuide'))return;
  const footer=document.querySelector('footer');
  if(!footer)return;
  const section=document.createElement('section');
  section.id='shopTrackingGuide';
  section.className='shop-tracking-guide';
  section.style.cssText='max-width:1100px;margin:0 auto 40px;padding:28px 22px;border:1px solid rgba(0,0,0,.08);border-radius:18px;background:#faf9f6';
  section.innerHTML=`<div style="max-width:760px"><p class="eyebrow">ORDER HELP</p><h2 style="margin:.2rem 0 .6rem">How to track your order</h2><p style="margin:0 0 14px;line-height:1.7">After checkout, Rushgal gives you an order reference such as <strong>RG-ABC123</strong>. Save or copy it. Tap <strong>Track order</strong> at the top of the shop, enter the reference, and check your latest status.</p><ol style="margin:0;padding-left:20px;line-height:1.9"><li>Complete your order and keep your tracking ID.</li><li>Open <strong>Track order</strong>.</li><li>Enter your <strong>RG-XXXXXX</strong> reference.</li><li>Tap <strong>Check status</strong>.</li></ol><button id="guideTrackButton" class="cart-button" type="button" style="margin-top:16px">Track an order</button></div>`;
  footer.parentNode.insertBefore(section,footer);
  $('#guideTrackButton')?.addEventListener('click',()=>$('#trackOpen')?.click());
}

function improveCategoryFilter(){
  const filter=$('#shopFilter');
  if(!filter || filter.dataset.enhanced)return;
  filter.dataset.enhanced='1';
  const current=filter.value;
  filter.innerHTML=CUSTOMER_CATEGORIES.map(([value,label])=>`<option value="${value}">${label}</option>`).join('');
  filter.value=current||'all';
}

function observeConfirmation(){
  const target=$('#orderConfirmation');
  if(!target)return;
  const observer=new MutationObserver(()=>{if(target.classList.contains('is-open'))addCopyButton();});
  observer.observe(target,{attributes:true,attributeFilter:['class']});
}

document.addEventListener('DOMContentLoaded',()=>{
  improveCategoryFilter();
  addTrackingGuide();
  observeConfirmation();
  setTimeout(addCopyButton,500);
});
