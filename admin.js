import { auth } from './firebase.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js';

const logout=document.getElementById('logout');

onAuthStateChanged(auth, async (user)=>{
  if(!user){
    window.location.href='admin-login.html';
    return;
  }
  const token=await user.getIdTokenResult(true);
  if(token.claims.admin!==true){
    await signOut(auth);
    window.location.href='admin-login.html?error=unauthorized';
    return;
  }
  document.documentElement.classList.add('admin-authenticated');
});

logout?.addEventListener('click',()=>signOut(auth));
