import { auth, db } from './firebase.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js';

let pending;

export function waitForAdmin() {
  if (pending) return pending;
  pending = new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, async user => {
      unsubscribe();
      if (!user) {
        window.location.href = 'admin-login.html';
        reject(new Error('Admin authentication required'));
        return;
      }
      try {
        const adminRef = doc(db, 'admin_user', user.uid);
        const adminSnap = await getDoc(adminRef);
        const data = adminSnap.exists() ? adminSnap.data() : null;
        const authorized = data?.active === true && data?.role === 'admin';
        if (!authorized) {
          window.location.href = 'admin-login.html?error=unauthorized';
          reject(new Error('Admin access required'));
          return;
        }
        resolve(user);
      } catch (error) {
        reject(error);
      }
    });
  });
  return pending;
}
