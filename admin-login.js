import { auth, db } from './firebase.js';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js';

const form = document.getElementById('loginForm');
const error = document.getElementById('loginError');
const params = new URLSearchParams(location.search);
if (params.get('error') === 'unauthorized') error.textContent = 'This account is not authorized for the Rushgal admin dashboard.';

async function isAdminUser(user) {
  const snap = await getDoc(doc(db, 'admin_user', user.uid));
  const data = snap.exists() ? snap.data() : null;
  return data?.active === true && data?.role === 'admin';
}

onAuthStateChanged(auth, async user => {
  if (!user) return;
  try {
    if (await isAdminUser(user)) location.replace('admin.html');
    else await signOut(auth);
  } catch (_) {
    await signOut(auth);
  }
});

form.addEventListener('submit', async e => {
  e.preventDefault();
  error.textContent = '';
  const email = form.elements.email.value.trim();
  const password = form.elements.password.value;
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    if (!(await isAdminUser(credential.user))) {
      await signOut(auth);
      throw new Error('UNAUTHORIZED');
    }
    location.replace('admin.html');
  } catch (err) {
    error.textContent = err.message === 'UNAUTHORIZED'
      ? 'This account is not authorized for admin access.'
      : 'Unable to sign in. Check your credentials and try again.';
  }
});
