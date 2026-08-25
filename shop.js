import { db } from './firebase.js';
import { collection, getDocs, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js';

const ASSET='assets/images/';
const fallbackProducts=[
  {id:'look-01',name:'The Occasion Edit',category:'Dresses & occasion',price:null,image:`${ASSET}unnamed%20(1).jpg`,description:'A considered statement piece for occasions that call for something special.'},
  {id:'look-02',name:'Everyday Form',category:'Ready to wear',price:null,image:`${ASSET}unnamed%20(10).jpg`,description:'Easy pieces selected for polished everyday dressing.'},
  {id:'look-03',name:'Statement Pieces',category:'New edit',price:null,image:`${ASSET}unnamed%20(11).jpg`,description:'Distinctive Rushgal pieces made to stand out.'},
  {id:'look-04',name:'The Soft Set',category:'Two-piece sets',price:null,image:`${ASSET}unnamed%20(2).jpg`,description:'Relaxed coordinated dressing with a refined finish.'}
];

const state={products:[],cart:loadCart(),deliveryFee:0,fulfilment:'delivery'};
const money=value=>value==null?'Price on request':`₦${Number(value).toLocaleString('en-NG')}`;
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];

function loadCart(){try{return JSON.parse(localStorage.getItem('rushgal-cart')||'[]')}catch{return[]}}
function saveCart(){localStorage.setItem('rushgal-cart',JSON.stringify(state.cart));updateCartCount()}
function updateCartCount(){const count=state.cart.reduce((n,item)=>n+item.qty,0);$$('[data-cart-count]').forEach(el=>el.textContent=count)}
function escapeHtml(value=''){return String(value).replace(/[&<>\'"]/g,char=>{if(char==='&')return '&amp;';if(char==='<')return '&lt;';if(char==='>')return '&gt;';if(char==="'")return '&#39;';return '&quot;'})}

async function loadProducts(){
  try{const snap=await getDocs(collection(db,'products'));state.products=snap.docs.map(doc=>({id:doc.id,...doc.data()}));}
  catch(error){console.warn('Product collection unavailable; using local preview catalogue.',error)}
  if(!state.products.length)state.products=fallbackProducts;
  renderProducts();
}

function renderProducts(){
  const grid=$('#shopGrid');if(!grid)return;
  const filter=$('#shopFilter')?.value||'all';
  const products=filter==='all'?state.products:state.products.filter(p=>(p.category||'').toLowerCase().includes(filter));
  grid.innerHTML=products.length?products.map(productCard).join():`<div class="shop-empty"><strong>No pieces in this edit yet.</strong>Rushgal can add products from the admin dashboard.</div>`;
}

function productCard(p){
  const priced=typeof p.price==='number'&&p.price>0;
  const image=p.image||p.images?.[0]||'';
  return `<article class="shop-card"><div class="shop-card-image">${p.badge?`<span class="shop-card-badge">${escapeHtml(p.badge)}</span>`:''}<img src="${image}" alt="${escapeHtml(p.name||'Rushgal product')}" loading="lazy"></div><div class="shop-card-body"><div class="shop-card-top"><div><span class="shop-card-category">${escapeHtml(p.category||'Rushgal')}</span><h3>${escapeHtml(p.name||'Untitled piece')}</h3></div><span class="shop-price">${money(p.price)}</span></div><div class="shop-card-actions"><button type="button" data-view="${p.id}">View</button><button type="button" class="add" data-add="${p.id}" ${priced?'':'disabled'}>${priced?'Add to bag':'Price on request'}</button></div></div></article>`;
}

function addToCart(id){
  const product=state.products.find(p=>p.id===id);if(!product||typeof product.price!=='number')return;
  const existing=state.cart.find(i=>i.id===id);
  if(existing)existing.qty+=1;else state.cart.push({id,name:product.name,price:product.price,image:product.image||product.images?.[0]||'',qty:1});
  saveCart();renderCart();openCart();
}
function changeQty(id,delta){const item=state.cart.find(i=>i.id===id);if(!item)return;item.qty+=delta;if(item.qty<=0)state.cart=state.cart.filter(i=>i.id!==id);saveCart();renderCart()}
function subtotal(){return state.cart.reduce((sum,i)=>sum+i.price*i.qty,0)}
function renderCart(){
  const wrap=$('#cartItems');if(!wrap)return;
  wrap.innerHTML=state.cart.length?state.cart.map(i=>`<div class="cart-item"><img src="${i.image}" alt=""><div><h3>${escapeHtml(i.name)}</h3><p>${money(i.price)} each</p><div class="qty"><button data-minus="${i.id}">−</button><span>${i.qty}</span><button data-plus="${i.id}">+</button></div></div><span class="cart-item-total">${money(i.price*i.qty)}</span></div>`).join():`<div class="shop-empty"><strong>Your bag is empty.</strong>Add a piece you love and it will appear here.</div>`;
  $('#cartSubtotal').textContent=money(subtotal());$('#checkoutButton').disabled=!state.cart.length;
}
function openCart(){const el=$('#cartDrawer');el.classList.add('is-open');el.setAttribute('aria-hidden','false')}
function closeCart(){const el=$('#cartDrawer');el.classList.remove('is-open');el.setAttribute('aria-hidden','true')}
function openCheckout(){if(!state.cart.length)return;closeCart();$('#checkoutModal').classList.add('is-open');updateCheckoutSummary()}
function closeCheckout(){$('#checkoutModal').classList.remove('is-open')}
function updateCheckoutSummary(){const sub=subtotal();const delivery=state.fulfilment==='delivery'?state.deliveryFee:0;$('#checkoutSubtotal').textContent=money(sub);$('#deliveryFee').textContent=delivery?money(delivery):'FREE';$('#checkoutTotal').textContent=money(sub+delivery);$('#deliveryFields').classList.toggle('is-hidden',state.fulfilment!=='delivery')}
function requestLocation(){const status=$('#locationStatus');if(!navigator.geolocation){status.textContent='Location is not supported on this browser.';return}status.textContent='Requesting your location…';navigator.geolocation.getCurrentPosition(pos=>{$('#latitude').value=pos.coords.latitude.toFixed(6);$('#longitude').value=pos.coords.longitude.toFixed(6);status.textContent='✓ Location captured. Rushgal can use it to confirm the delivery area.'},()=>{status.textContent='We could not access your location. You can enter the address manually.'},{enableHighAccuracy:true,timeout:10000})}

async function placeOrder(event){
  event.preventDefault();
  const form=event.currentTarget,data=new FormData(form),submit=form.querySelector('.place'),status=$('#checkoutStatus');
  const order={customer:{name:data.get('name'),phone:data.get('phone'),email:data.get('email')||''},fulfilment:state.fulfilment,address:state.fulfilment==='delivery'?{address:data.get('address'),area:data.get('area'),notes:data.get('notes')||'',latitude:data.get('latitude')||null,longitude:data.get('longitude')||null}:null,items:state.cart.map(i=>({productId:i.id,name:i.name,price:i.price,quantity:i.qty})),subtotal:subtotal(),deliveryFee:state.fulfilment==='delivery'?state.deliveryFee:0,total:subtotal()+(state.fulfilment==='delivery'?state.deliveryFee:0),paymentMethod:'pay_on_delivery',status:'new',createdAt:serverTimestamp()};
  submit.disabled=true;status.textContent='Submitting your order…';status.classList.add('show');
  try{const ref=await addDoc(collection(db,'orders'),order);status.textContent=`Order received. Your reference is ${ref.id.slice(0,8).toUpperCase()}. Rushgal will contact you on WhatsApp to confirm.`;state.cart=[];saveCart();renderCart();form.reset()}
  catch(error){console.error(error);status.textContent='We could not submit the order yet. Please contact Rushgal on WhatsApp to complete your order.'}
  finally{submit.disabled=false}
}

function bind(){
  updateCartCount();renderCart();
  $('#shopFilter')?.addEventListener('change',renderProducts);
  $('#cartOpen')?.addEventListener('click',openCart);$('#cartClose')?.addEventListener('click',closeCart);$('#cartBackdrop')?.addEventListener('click',closeCart);$('#checkoutButton')?.addEventListener('click',openCheckout);$('#checkoutClose')?.addEventListener('click',closeCheckout);
  $('#shopGrid')?.addEventListener('click',e=>{const add=e.target.closest('[data-add]');if(add)addToCart(add.dataset.add)});
  $('#cartItems')?.addEventListener('click',e=>{const plus=e.target.closest('[data-plus]');const minus=e.target.closest('[data-minus]');if(plus)changeQty(plus.dataset.plus,1);if(minus)changeQty(minus.dataset.minus,-1)});
  $$('input[name="fulfilment"]').forEach(input=>input.addEventListener('change',()=>{state.fulfilment=input.value;state.deliveryFee=Number(input.dataset.fee||0);updateCheckoutSummary()}));
  $('#useLocation')?.addEventListener('click',requestLocation);$('#checkoutForm')?.addEventListener('submit',placeOrder);
}

document.addEventListener('DOMContentLoaded',()=>{bind();loadProducts()});