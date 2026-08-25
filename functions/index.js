const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { setGlobalOptions } = require('firebase-functions/v2');
const admin = require('firebase-admin');

admin.initializeApp();
setGlobalOptions({ region: 'europe-west1', maxInstances: 10 });

const db = admin.firestore();

function normalizePhone(value) {
  const digits = String(value || '').replace(/\D/g, '');
  // Compare Nigerian numbers consistently whether entered as 080..., 23480..., or +23480...
  if (digits.startsWith('234') && digits.length >= 13) return digits.slice(-10);
  if (digits.length >= 10) return digits.slice(-10);
  return digits;
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
    .where('trackingCode', '==', reference)
    .limit(1)
    .get();

  if (snapshot.empty) {
    throw new HttpsError('not-found', 'Order not found.');
  }

  const order = snapshot.docs[0].data();
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
  };
});
