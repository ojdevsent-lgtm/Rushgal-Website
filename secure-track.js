import { getFunctions, httpsCallable } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-functions.js';

const functions = getFunctions(undefined, 'europe-west1');
const trackOrderSecure = httpsCallable(functions, 'trackOrder');
const steps = [
  ['new', 'Order received'],
  ['confirmed', 'Order confirmed'],
  ['processing', 'Being prepared'],
  ['out_for_delivery', 'Out for delivery'],
  ['ready_for_pickup', 'Ready for pickup'],
  ['delivered', 'Delivered / collected']
];
const money = value => `₦${Number(value || 0).toLocaleString('en-NG')}`;
const escapeHtml = value => String(value ?? '').replace(/[&<>\'"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[c]));

function render(order) {
  const body = document.querySelector('#trackingBody');
  const result = document.querySelector('#trackingResult');
  if (!body) return;
  if (order.status === 'cancelled') {
    body.innerHTML = '<div class="tracking-cancelled">This order has been cancelled. Please contact Rushgal if you need assistance.</div>';
    body.classList.add('show');
    result.textContent = '';
    return;
  }
  const current = steps.findIndex(([key]) => key === order.status);
  const applicable = order.fulfilment === 'pickup' ? steps.filter(([key]) => key !== 'out_for_delivery') : steps.filter(([key]) => key !== 'ready_for_pickup');
  body.innerHTML = `<div class="tracking-summary"><strong>${escapeHtml(order.customerName || 'Customer')}</strong><span>${order.fulfilment === 'delivery' ? 'Home delivery' : 'Store pickup'} · ${money(order.total)}</span></div><div class="tracking-timeline">${applicable.map(([key,label]) => { const index = steps.findIndex(([id]) => id === key); const done = current >= index; return `<div class="tracking-step ${done ? 'is-done' : ''} ${current === index ? 'is-current' : ''}"><i></i><div><strong>${label}</strong>${current === index ? '<span>Current status</span>' : ''}</div></div>`; }).join('')}</div><p class="tracking-updated">Last checked just now. Rushgal will contact you by WhatsApp when your order moves forward.</p>`;
  document.querySelector('#trackingTitle').textContent = order.reference || 'Order status';
  body.classList.add('show');
  result.textContent = '';
}

async function handle(event) {
  event.preventDefault();
  event.stopImmediatePropagation();
  const data = new FormData(event.currentTarget);
  const code = String(data.get('trackingCode') || '').trim().toUpperCase();
  const phone = String(data.get('phone') || '').trim();
  const result = document.querySelector('#trackingResult');
  document.querySelector('#trackingBody')?.classList.remove('show');
  result.textContent = 'Checking order…';
  result.className = 'tracking-result show';
  try {
    const response = await trackOrderSecure({ reference: code, phone });
    render(response.data);
  } catch (error) {
    console.error(error);
    const message = error?.code === 'functions/not-found'
      ? 'We could not find that order. Check the reference and phone number, then try again.'
      : error?.code === 'functions/permission-denied'
        ? 'The order reference and phone number do not match.'
        : 'Tracking is temporarily unavailable. Please try again shortly.';
    result.textContent = message;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#trackForm');
  form?.addEventListener('submit', handle, true);
});
