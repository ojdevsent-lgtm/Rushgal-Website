// Rushgal cart fallback: keeps the product modal's Add to bag action reliable.
(function () {
  const CART_KEY = 'rushgal-cart-v1';
  const LEGACY_KEY = 'rushgal-cart';
  const money = v => `₦${Number(v || 0).toLocaleString('en-NG')}`;
  const read = () => { try { const raw = JSON.parse(localStorage.getItem(CART_KEY) || localStorage.getItem(LEGACY_KEY) || '[]'); return Array.isArray(raw) ? raw : []; } catch (_) { return []; } };
  const write = cart => { localStorage.setItem(CART_KEY, JSON.stringify(cart)); localStorage.setItem(LEGACY_KEY, JSON.stringify(cart)); };
  const refreshCount = cart => { const count = cart.reduce((n, i) => n + Math.max(0, Number(i.qty ?? i.quantity ?? 0)), 0); document.querySelectorAll('[data-cart-count]').forEach(el => { el.textContent = count; }); };
  const render = cart => {
    const wrap = document.getElementById('cartItems'); if (!wrap) return;
    wrap.innerHTML = cart.length ? cart.map(i => `<div class="cart-item"><img src="${i.image || ''}" alt=""><div><h3>${String(i.name || '').replace(/[&<>\"]/g, '')}</h3><p>${money(i.price)} each${i.size ? ` · Size ${i.size}` : ''}${i.colour ? ` · ${i.colour}` : ''}</p><div class="qty"><span>${Number(i.qty || 1)}</span></div></div><span class="cart-item-total">${money(Number(i.price || 0) * Number(i.qty || 1))}</span></div>`).join('') : '<div class="shop-empty"><strong>Your bag is empty.</strong></div>';
    const subtotal = cart.reduce((s, i) => s + Number(i.price || 0) * Number(i.qty || 1), 0); const total = document.getElementById('cartSubtotal'); if (total) total.textContent = money(subtotal); const checkout = document.getElementById('checkoutButton'); if (checkout) checkout.disabled = !cart.length;
  };
  async function resolveProductId(title) {
    try { const { db } = await import('./firebase.js'); const { collection, getDocs, query, where, limit } = await import('https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js'); const snap = await getDocs(query(collection(db, 'products'), where('name', '==', title), limit(1))); return snap.empty ? `local-${Date.now()}` : snap.docs[0].id; } catch (_) { return `local-${Date.now()}`; }
  }
  document.addEventListener('DOMContentLoaded', () => {
    const cart = read(); refreshCount(cart); render(cart); const product = document.getElementById('productView'); if (!product) return;
    product.addEventListener('click', async event => {
      const button = event.target.closest('#productViewAdd[data-product-add]'); if (!button || button.disabled) return; event.preventDefault(); event.stopImmediatePropagation();
      const title = document.getElementById('productViewTitle')?.textContent?.trim() || 'Rushgal piece'; const priceText = document.getElementById('productViewPrice')?.textContent || ''; const price = Number(priceText.replace(/[^0-9.]/g, '')); if (!Number.isFinite(price) || price <= 0) return;
      const image = document.getElementById('productViewMain')?.getAttribute('src') || ''; const qty = Math.max(1, Number(document.getElementById('productViewQuantity')?.value || 1)); const size = document.querySelector('#sizeOptions .is-active')?.textContent?.trim() || ''; const colour = document.querySelector('#colourOptions .is-active')?.textContent?.trim() || ''; const key = `${title}|${size}|${colour}`; const next = read(); const existing = next.find(i => `${i.name}|${i.size || ''}|${i.colour || ''}` === key);
      if (existing) existing.qty = Number(existing.qty || 0) + qty; else next.push({ id: await resolveProductId(title), name: title, price, image, qty, size, colour });
      write(next); refreshCount(next); render(next); document.getElementById('productView')?.classList.remove('is-open'); document.getElementById('cartDrawer')?.classList.add('is-open'); document.getElementById('cartDrawer')?.setAttribute('aria-hidden', 'false');
    }, true);
  });
})();
