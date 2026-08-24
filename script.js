document.getElementById('year').textContent=new Date().getFullYear();

const header=document.querySelector('.site-header');
let lastY=window.scrollY;
window.addEventListener('scroll',()=>{
  const y=window.scrollY;
  header.style.boxShadow=y>8?'0 8px 30px rgba(23,21,18,.06)':'none';
  lastY=y;
},{passive:true});
