import { addDoc, collection, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js';
import { db } from './firebase.js';
import { getCart, getCartSubtotal, clearCart } from './cart.js';

export async function captureCurrentLocation() {
  if (!navigator.geolocation) throw new Error('Location is not supported on this device.');
  return new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(
    ({ coords }) => resolve({ latitude: coords.latitude, longitude: coords.longitude }),
    (error) => reject(new Error(error.message || 'Unable to access your location.')),
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
  ));
}

export async function submitOrder({ customer, fulfilment, address = null, location = null, deliveryFee = 0, notes = '' }) {
  const items = getCart();
  if (!items.length) throw new Error('Your cart is empty.');
  if (!customer?.name || !customer?.phone) throw new Error('Name and phone number are required.');
  if (!['delivery', 'pickup'].includes(fulfilment)) throw new Error('Choose a fulfilment method.');
  if (fulfilment === 'delivery' && !address) throw new Error('A delivery address is required.');

  const subtotal = getCartSubtotal();
  const order = {
    customer,
    fulfilment,
    address: fulfilment === 'delivery' ? address : null,
    location: fulfilment === 'delivery' ? location : null,
    notes,
    items,
    subtotal,
    deliveryFee: fulfilment === 'delivery' ? Number(deliveryFee) || 0 : 0,
    total: subtotal + (fulfilment === 'delivery' ? Number(deliveryFee) || 0 : 0),
    paymentMethod: 'pay_on_delivery',
    paymentStatus: 'unpaid',
    status: 'new',
    createdAt: serverTimestamp()
  };

  const ref = await addDoc(collection(db, 'orders'), order);
  clearCart();
  return ref.id;
}
