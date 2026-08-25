import { db, storage } from './firebase.js';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js';
import { ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js';

const state={products:[]};
const $=s=>document.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const money=v=>`₦${Number(v||0).toLocaleString('en-NG')}`;

async function load(){
  const snap=await getDocs(collection(db,'products'));
  state.products=snap.docs.map(d=>({id:d.id,...d.data()}));
  render();
}
function render(){
  const grid=$('#productManager'); if(!grid)return;
  grid.innerHTML=state.products.length?state.products.map(p=>`<article class="product-admin-card"><img src="${p.image||p.images?.[0]||''}" alt=""><div><span>${esc(p.category||'Uncategorised')}</span><h3>${esc(p.name)}</h3><strong>${money(p.price)}</strong><p>${p.stock??0} in stock · ${p.status||'active'}</p><div><button data-edit="${p.id}">Edit</button><button data-delete="${p.id}" class="danger">Delete</button></div></div></article>`).join(''):`<div class="empty">No products yet. Add the first Rushgal product.</div>`;
}
function openForm(product={}){
  const form=$('#productForm'); form.reset(); form.dataset.id=product.id||'';
  for(const key of ['name','category','price','stock','description','status']) if(form.elements[key]) form.elements[key].value=product[key]??'';
  $('#productImagePreview').src=product.image||product.images?.[0]||''; $('#productModal').classList.add('is-open');
}
function closeForm(){$('#productModal').classList.remove('is-open')}
async function save(e){
  e.preventDefault(); const f=e.currentTarget; const data=new FormData(f); const id=f.dataset.id;
  const payload={name:data.get('name'),category:data.get('category'),price:Number(data.get('price')),stock:Number(data.get('stock')),description:data.get('description'),status:data.get('status')||'active',updatedAt:serverTimestamp()};
  const file=f.elements.image.files[0];
  if(file){const storageRef=ref(storage,`products/${crypto.randomUUID()}-${file.name}`);await uploadBytes(storageRef,file);payload.image=await getDownloadURL(storageRef)}
  if(id)await updateDoc(doc(db,'products',id),payload);else await addDoc(collection(db,'products'),{...payload,createdAt:serverTimestamp()});
  closeForm();await load();
}
async function remove(id){if(!confirm('Delete this product?'))return;await deleteDoc(doc(db,'products',id));await load()}

document.addEventListener('DOMContentLoaded',async()=>{await load();$('#addProduct')?.addEventListener('click',()=>openForm());$('#closeProduct')?.addEventListener('click',closeForm);$('#productForm')?.addEventListener('submit',save);$('#productManager')?.addEventListener('click',e=>{const edit=e.target.closest('[data-edit]');const del=e.target.closest('[data-delete]');if(edit)openForm(state.products.find(p=>p.id===edit.dataset.edit));if(del)remove(del.dataset.delete)})});
