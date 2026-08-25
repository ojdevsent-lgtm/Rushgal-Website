document.getElementById('year').textContent=new Date().getFullYear();

const header=document.querySelector('.site-header');
window.addEventListener('scroll',()=>{
  header.style.boxShadow=window.scrollY>8?'0 8px 30px rgba(23,21,18,.06)':'none';
},{passive:true});

const modal=document.getElementById('lookModal');
const closeButton=document.getElementById('modalClose');
const lookName=document.getElementById('lookName');
const lookForm=document.getElementById('lookForm');

function closeLookModal(){
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden','true');
  document.body.classList.remove('modal-open');
}

document.querySelectorAll('.look-button').forEach((button)=>{
  button.addEventListener('click',()=>{
    lookName.textContent=button.dataset.look||'Rushgal inspiration';
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden','false');
    document.body.classList.add('modal-open');
    lookForm.querySelector('input[name="name"]').focus();
  });
});

closeButton.addEventListener('click',closeLookModal);
modal.addEventListener('click',(event)=>{
  if(event.target===modal) closeLookModal();
});
document.addEventListener('keydown',(event)=>{
  if(event.key==='Escape'&&modal.classList.contains('is-open')) closeLookModal();
});

lookForm.addEventListener('submit',(event)=>{
  event.preventDefault();
  const data=new FormData(lookForm);
  const message=[
    'Hi Rushgal, I want this design.',
    `Look: ${lookName.textContent}`,
    `Name: ${data.get('name')}`,
    `WhatsApp: ${data.get('phone')}`,
    `Preference: ${data.get('preference')}`,
    data.get('note')?`Note: ${data.get('note')}`:''
  ].filter(Boolean).join('\n');
  window.open(`https://wa.me/2347062281152?text=${encodeURIComponent(message)}`,'_blank','noopener');
  closeLookModal();
  lookForm.reset();
});
