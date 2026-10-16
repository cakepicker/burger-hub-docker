/* Burger Hub shop engine: shared header/footer, cart, drawer, checkout, chat */
const CFG={fee:1.5,freeOver:15,tax:.10,codes:{BURGER10:.10},branches:['New Beverly Hills, Cikarang','Student Boarding House, Cikarang']};
const P=[
{id:'classic',n:'Classic Burger',d:'Juicy beef patty with cheese and fresh lettuce.',p:5.99,c:'Burgers',img:'classic-burger.jpg'},
{id:'cheese',n:'Cheese Burger',d:'Double layers of cheese & smoky beef patty.',p:6.49,c:'Burgers',img:'cheese-burger.jpg'},
{id:'drink',n:'Soft Drink',d:'Refreshing cola or lemon soda.',p:1.99,c:'Drinks',img:'soft-drink.jpg'},
{id:'solo',n:'Solo Saver Package',d:'Hamburger + Fries + Drink. Perfect for one person!',p:7.99,c:'Deals',img:'solo-saver.jpg',tag:'Best for one'},
{id:'group',n:'Group Saver Package',d:'4 Hamburgers, 4 Fries, Nuggets, and 4 Cokes, perfect for sharing!',p:24.99,c:'Deals',img:'group-saver.jpg',tag:'Best for sharing'},
{id:'lovers',n:'Cheeseburger Lovers',d:'3 Burgers with double layers of cheese & smoky beef patties.',p:18.99,c:'Deals',img:'cheese-burger1.jpg'}];
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const money=n=>'$'+n.toFixed(2);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const load=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}};
const save=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}};
const page=document.body.dataset.page;
const find=id=>P.find(x=>x.id===id);
let cart=load('bh_cart',{});
let mode='delivery',code='',filter='All';

/* migrate the old name-list cart */
const old=load('orders',null);
if(Array.isArray(old)){old.forEach(n=>{const p=P.find(x=>x.n===n);if(p)cart[p.id]=(cart[p.id]||0)+1});save('bh_cart',cart);try{localStorage.removeItem('orders')}catch{}}

const count=()=>Object.values(cart).reduce((a,b)=>a+b,0);
function totals(){
  const sub=Object.entries(cart).reduce((a,[id,q])=>a+(find(id)?.p||0)*q,0);
  const rate=CFG.codes[code]||0,disc=sub*rate,net=sub-disc,tax=net*CFG.tax;
  const fee=(mode==='pickup'||!sub||net>=CFG.freeOver)?0:CFG.fee;
  return{sub,disc,tax,fee,total:net+tax+fee,net};
}
function setQty(id,q){if(q<=0)delete cart[id];else cart[id]=q;save('bh_cart',cart);refresh()}
let tt;function toast(t){const e=$('.toast');e.textContent=t;e.classList.add('show');clearTimeout(tt);tt=setTimeout(()=>e.classList.remove('show'),1800)}

/* shared chrome */
const links=[['index','Home'],['menu','Menu'],['promotions','Promotions'],['location','Locations'],['myorder','My Order'],['abouts','About']];
document.body.insertAdjacentHTML('afterbegin',`<header class="top"><div class="bar"><a class="logo" href="index.html">Burger Hub</a><nav aria-label="Main">${links.map(([h,t])=>`<a href="${h==='index'?'index':h}.html"${page===h?' class="on" aria-current="page"':''}>${t}</a>`).join('')}</nav><button class="cartbtn" id="openCart" aria-label="Open cart">Cart <b id="cartCount">0</b></button></div></header>`);
document.body.insertAdjacentHTML('beforeend',`
<footer class="foot"><div class="wrap"><div><b>Burger Hub</b><p>Fresh burgers, fries and drinks.<br>Delivery and pickup in Cikarang.</p></div>
<div><a href="menu.html">Menu</a><a href="promotions.html">Promotions</a><a href="location.html">Locations</a></div>
<div><a href="myorder.html">My Order</a><a href="cart.html">Cart</a><a href="abouts.html">About us</a></div>
<small>© 2026 Burger Hub. All rights reserved.</small></div></footer>
<div class="scrim" id="scrim"></div>
<aside class="drawer" aria-label="Shopping cart" aria-hidden="true"><header><h3>Your cart</h3><button class="x" id="closeCart" aria-label="Close cart">×</button></header><div class="body" id="dBody"></div><footer id="dFoot"></footer></aside>
<div class="toast" role="status" aria-live="polite"></div>
<button class="fab" id="fab">Ask BurgerBot</button>
<div class="chat" id="chat"><h4>BurgerBot</h4><div class="log" id="log"><p>Hi! Ask me about the menu, deals, delivery or locations.</p></div><div class="qs"><button>Menu</button><button>Deals</button><button>Delivery</button><button>Locations</button></div><form id="cf"><input id="ci" placeholder="Type a question" aria-label="Message"><button>Send</button></form></div>`);

/* rendering */
const lineHTML=(id,q,edit=true)=>{const p=find(id);return`<div class="line"><img src="images/${p.img}" alt=""><div><b>${p.n}</b><small>${money(p.p)} each</small></div><div class="r"><b>${money(p.p*q)}</b>${edit?`<span class="qty"><button data-dec="${id}" aria-label="Remove one ${p.n}">−</button><span>${q}</span><button data-inc="${id}" aria-label="Add one ${p.n}">+</button></span><button class="rm" data-rm="${id}">Remove</button>`:`<small>× ${q}</small>`}</div></div>`};
const emptyHTML=`<div class="empty"><p>Your cart is empty.</p><a class="btn" href="menu.html">Browse the menu</a></div>`;
function sumHTML(){
  const t=totals();
  const left=CFG.freeOver-t.net;
  return`<div class="sum"><div><span>Subtotal</span><span>${money(t.sub)}</span></div>${t.disc?`<div class="good"><span>Promo ${code}</span><span>−${money(t.disc)}</span></div>`:''}<div><span>Tax (${CFG.tax*100}%)</span><span>${money(t.tax)}</span></div><div><span>${mode==='pickup'?'Pickup':'Delivery'}</span><span>${t.fee?money(t.fee):'Free'}</span></div><div class="tot"><span>Total</span><span>${money(t.total)}</span></div></div>${mode==='delivery'&&t.sub&&left>0?`<p class="hint">Add ${money(left)} more for free delivery.</p>`:''}`;
}
function card(p){
  const q=cart[p.id]||0;
  return`<article class="card"><div class="ph"><img src="images/${p.img}" alt="${p.n}" loading="lazy">${p.tag?`<span class="tag">${p.tag}</span>`:''}</div><div class="in"><h3>${p.n}</h3><p>${p.d}</p><div class="row"><span class="price">${money(p.p)}</span>${q?`<span class="qty"><button data-dec="${p.id}" aria-label="Remove one">−</button><span>${q}</span><button data-inc="${p.id}" aria-label="Add one">+</button></span>`:`<button class="btn" data-add="${p.id}">Add to cart</button>`}</div></div></article>`;
}
function refresh(){
  $('#cartCount').textContent=count();
  const ids=Object.keys(cart).filter(find);
  $('#dBody').innerHTML=ids.length?ids.map(i=>lineHTML(i,cart[i])).join(''):emptyHTML;
  const t=totals();
  $('#dFoot').innerHTML=ids.length?`<div class="s"><span>Subtotal</span><span>${money(t.sub)}</span></div><p class="hint">Delivery, tax and promo codes are applied at checkout.</p><a class="btn full" href="myorder.html">Checkout</a><a class="btn ghost full" href="cart.html">View full cart</a>`:'';
  if(page==='home')$('#popular').innerHTML=['classic','cheese','solo'].map(i=>card(find(i))).join('');
  if(page==='menu'||page==='promos'){const list=page==='promos'?P.filter(p=>p.c==='Deals'):P.filter(p=>filter==='All'||p.c===filter);$('#grid').innerHTML=list.map(card).join('')}
  if(page==='cart')cartPage(ids);
  if(page==='checkout')checkoutSummary(ids);
}
function cartPage(ids){
  $('#cartPage').innerHTML=ids.length?`<div class="cols"><div class="box"><h3>Items</h3>${ids.map(i=>lineHTML(i,cart[i])).join('')}<button class="rm" id="clr">Clear cart</button></div><div class="box"><h3>Summary</h3>${sumHTML()}<a class="btn full" href="myorder.html">Checkout</a></div></div>`:`<div class="box">${emptyHTML}</div>`;
  const c=$('#clr');if(c)c.onclick=()=>{cart={};save('bh_cart',cart);refresh()};
}
function checkoutSummary(ids){
  const f=$('#orderForm');
  f.hidden=!ids.length;$('#emptyMsg').hidden=!!ids.length;
  $('#sumLines').innerHTML=ids.map(i=>lineHTML(i,cart[i],false)).join('');
  $('#sumTotals').innerHTML=sumHTML();
}
function history(){
  const h=load('bh_orders',[]);
  $('#hist').innerHTML=h.length?h.slice(0,5).map(o=>`<div><span><b>${o.id}</b><small>${new Date(o.at).toLocaleString()} · ${o.mode==='pickup'?'Pickup':'Delivery'}</small><small>${o.items.map(i=>i.q+'× '+esc(i.n)).join(', ')}</small></span><b>${money(o.total)}</b></div>`).join(''):'<p class="hint">No orders yet. Your orders will show here.</p>';
}
function placeOrder(e){
  e.preventDefault();
  const ids=Object.keys(cart).filter(find);if(!ids.length)return;
  const t=totals(),f=e.target,fd=new FormData(f);
  const o={id:'BH-'+(1000+load('bh_orders',[]).length+1),at:Date.now(),mode,name:fd.get('name'),total:t.total,items:ids.map(i=>({n:find(i).n,q:cart[i]}))};
  const h=load('bh_orders',[]);h.unshift(o);save('bh_orders',h);
  cart={};save('bh_cart',cart);code='';
  f.hidden=true;$('#sumBox').hidden=true;
  const d=$('#doneBox');d.hidden=false;
  d.innerHTML=`<div class="done"><div class="tick" aria-hidden="true">✓</div><h3>Thanks, ${esc(o.name)}!</h3><p>Order <b>${o.id}</b> is confirmed.</p><p class="hint">${o.mode==='pickup'?'Ready for pickup in about 15 minutes at '+esc(fd.get('branch'))+'.':'Arriving in about 25 to 35 minutes at '+esc(fd.get('address'))+'.'}<br>Total to pay: <b>${money(o.total)}</b> (${esc(fd.get('pay'))}).</p><a class="btn" href="menu.html">Order something else</a></div>`;
  refresh();history();window.scrollTo({top:0,behavior:'smooth'});
}

/* events */
document.addEventListener('click',e=>{
  const g=a=>e.target.closest(`[data-${a}]`)?.dataset[a];
  let id;
  if(id=g('add')){setQty(id,1);toast(find(id).n+' added to cart')}
  else if(id=g('inc'))setQty(id,(cart[id]||0)+1);
  else if(id=g('dec'))setQty(id,(cart[id]||0)-1);
  else if(id=g('rm'))setQty(id,0);
  else if(e.target.closest('#openCart')){document.body.classList.add('open');$('.drawer').setAttribute('aria-hidden','false')}
  else if(e.target.closest('#closeCart,#scrim')){document.body.classList.remove('open');$('.drawer').setAttribute('aria-hidden','true')}
  else if(e.target.closest('#fab'))$('#chat').classList.toggle('on');
  else if(e.target.closest('.qs button'))ask(e.target.textContent);
  else if(e.target.closest('.chip')){filter=e.target.textContent;$$('.chip').forEach(c=>c.setAttribute('aria-pressed',c.textContent===filter));refresh()}
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){document.body.classList.remove('open');$('#chat').classList.remove('on')}});

/* chat (rule-based, answers from the shop's own data) */
function reply(m){
  m=m.toLowerCase();
  if(/menu|burger|food|drink/.test(m))return'We serve '+P.filter(p=>p.c!=='Deals').map(p=>p.n+' ('+money(p.p)+')').join(', ')+'. See the Menu page to order.';
  if(/deal|promo|package|discount|code/.test(m))return'Deals: '+P.filter(p=>p.c==='Deals').map(p=>p.n+' '+money(p.p)).join(', ')+'. Use code BURGER10 at checkout for 10% off.';
  if(/deliver|fee|shipping|pickup/.test(m))return'Delivery is '+money(CFG.fee)+', free on orders over '+money(CFG.freeOver)+' after discounts. Pickup is free.';
  if(/locat|where|address|branch/.test(m))return'Find us at '+CFG.branches.join(' and ')+'.';
  if(/order|cart|checkout|pay/.test(m))return'Add items to your cart, then open Checkout from the cart. You can also review past orders on My Order.';
  return'I can help with the menu, deals, delivery or locations.';
}
function ask(t){const l=$('#log');l.insertAdjacentHTML('beforeend',`<p class="me">${esc(t)}</p>`);l.insertAdjacentHTML('beforeend',`<p>${esc(reply(t))}</p>`);l.scrollTop=l.scrollHeight}
$('#cf').onsubmit=e=>{e.preventDefault();const i=$('#ci');if(i.value.trim())ask(i.value.trim());i.value=''};

/* page setup */
if(page==='checkout'){
  history();
  $('#orderForm').addEventListener('submit',placeOrder);
  $$('input[name=mode]').forEach(r=>r.onchange=()=>{mode=r.value;$('#addrBox').hidden=mode==='pickup';$('#branchBox').hidden=mode==='delivery';$('#address').required=mode==='delivery';refresh()});
  $('#applyPromo').onclick=()=>{const v=$('#promoIn').value.trim().toUpperCase();const m=$('#promoMsg');if(!v){code='';m.textContent=''}else if(CFG.codes[v]){code=v;m.textContent='Code applied.'}else{code='';m.textContent='That code is not valid.'}refresh()};
}
refresh();
