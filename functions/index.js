const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { setGlobalOptions } = require('firebase-functions/v2');
const admin = require('firebase-admin');

admin.initializeApp();
setGlobalOptions({ region: 'europe-west1', maxInstances: 10 });

const db = admin.firestore();

function normalizePhone(value) {
  return String(value || '').replace(/\D/g, '').replace(/^0+/, '');
}

exports.trackOrder = onCall({ cors: true }, async (request) => {
  const reference = String(request.data?.reference || '').trim().toUpperCase();
  const phone = normalizePhone(request.data?.phone);

  if (!reference || !phone) {
    throw new HttpsError('invalid-argument', 'Order reference and phone number are required.');
  }

  if (reference.length < 5 || reference.length > 30) {
    throw new HttpsError('invalid-argument', 'Invalid order reference.');
  }

  const snapshot = await db.collection('orders')
    .where('trackingReference', '==', reference)
    .limit(1)
    .get();

  if (snapshot.empty) {
    throw new HttpsError('not-found', 'Order not found.');
  }

  const doc = snapshot.docs[0];
  const order = doc.data();
  const storedPhone = normalizePhone(order.customer?.phone);

  if (!storedPhone || storedPhone !== phone) {
    throw new HttpsError('permission-denied', 'The order reference and phone number do not match.');
  }

  return {
    reference,
    status: order.status || 'new',
    fulfilment: order.fulfilment || 'delivery',
    total: Number(order.total || 0),
    createdAt: order.createdAt?.toDate?.()?.toISOString?.() || null,
    customerName: order.customer?.name || '',
    deliveryZone: order.deliveryZone?.name || '',
    // Intentionally do not return phone, address, GPS coordinates, email, or item details.
  };
});
