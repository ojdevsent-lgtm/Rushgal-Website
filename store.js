import { collection, getDocs, query, where, orderBy, limit } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js';
import { db } from './firebase.js';

const productsRef = collection(db, 'products');

export async function getProducts({ category = null, max = 60 } = {}) {
  const constraints = [];
  if (category) constraints.push(where('category', '==', category));
  constraints.push(orderBy('createdAt', 'desc'), limit(max));
  const snapshot = await getDocs(query(productsRef, ...constraints));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function getFeaturedProducts(max = 6) {
  const snapshot = await getDocs(query(
    productsRef,
    where('featured', '==', true),
    orderBy('createdAt', 'desc'),
    limit(max)
  ));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}
