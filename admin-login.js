import { auth } from './firebase.js';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js';

const form=document.getElementById('loginForm');
const error=document.getElementById('loginError');
const params=new URLSearchParams(location.search);
if(params.get('error')==='unauthorized') error.textContent='This account is not authorized for the Rushgal admin dashboard.';

onAuthStateChanged(auth, async user=>{
  if(!user)return;
  const token=await user.getIdTokenResult(true);
  if(token.claims.admin===true) location.replace('admin.html');
  else await signOut(auth);
});

form.addEventListener('submit',async e=>{
  e.preventDefault();error.textContent='';
  const email=form.elements.email.value.trim();
  const password=form.elements.password.value;
  try{
    const credential=await signInWithEmailAndPassword(auth,email,password);
    const token=await credential.user.getIdTokenResult(true);
    if(token.claims.admin!==true){await signOut(auth);throw new Error('UNAUTHORIZED');}
    location.replace('admin.html');
  }catch(err){error.textContent=err.message==='UNAUTHORIZED'?'This account is not authorized for admin access.':'Unable to sign in. Check your credentials and try again.';}
});
