// Rushgal pre-checkout guard: revalidates Firestore-backed product availability.
(function () {
  const CART_KEY = 'rushgal-cart-v1';
  const readCart = () => { try { const x = JSON.parse(localStorage.getItem(CART_KEY) || '[]'); return Array.isArray(x) ? x : []; } catch (_) { return []; } };
  const message = text => { const el = document.getElementById('checkoutStatus'); if (el) { el.textContent = text; el.classList.add('show'); } };
  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('checkoutForm'); if (!form) return;
    form.addEventListener('submit', async event => {
      const cart = readCart(); if (!cart.length) return;
      const firestoreItems = cart.filter(item => item.id && !String(item.id).startsWith('local-'));
      if (!firestoreItems.length) return;
      event.preventDefault(); event.stopImmediatePropagation();
      const submit = form.querySelector('.place'); if (submit) submit.disabled = true;
      message('Checking product availability…');
      try {
        const { db } = await import('./firebase.js');
        const { collection, getDocs } = await import('https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js');
        const snap = await getDocs(collection(db, 'products'));
        const products = new Map(snap.docs.map(doc => [doc.id, { id: doc.id, ...doc.data() }]));
        const unavailable = [];
        firestoreItems.forEach(item => {
          const product = products.get(item.id);
          const stock = Number(product?.stock);
          const active = product?.active !== false && product?.available !== false && product?.inStock !== false;
          const qty = Math.max(1, Number(item.qty || 1));
          if (!product || !active || (Number.isFinite(stock) && stock >= 0 && stock < qty)) unavailable.push(product?.name || item.name || 'A selected item');
        });
        if (unavailable.length) {
          message(`Please update your bag. ${unavailable.join(', ')} is no longer available in the selected quantity.`);
          return;
        }
        message('Availability confirmed. Submitting your order…');
        form.removeEventListener('submit', arguments.callee);
        const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
        form.dispatchEvent(submitEvent);
      } catch (error) {
        console.error('Availability check failed', error);
        message('We could not verify stock right now. Please try again.');
      } finally { if (submit) submit.disabled = false; }
    }, true);
  });
})();
