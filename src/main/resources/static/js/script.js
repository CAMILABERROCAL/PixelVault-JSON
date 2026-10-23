'use strict';
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = n => new Intl.NumberFormat('es-PE',{style:'currency',currency:'PEN'}).format(Number(n));
const image = p => (typeof p === 'string' && (p.startsWith('/img/') || p.startsWith('https://'))) ? p : '/img/placeholder.svg';
const date = d => new Date(d).toLocaleString('es-PE');
const CART = 'pixelvault.cart.v1';
let me = {autenticado:false}, products = [], toastTimer;
function readCart() {
 try {const v=JSON.parse(localStorage.getItem(CART)||'[]');return Array.isArray(v)?v.filter(i=>Number.isSafeInteger(i.videojuegoId)&&i.videojuegoId>0&&Number.isInteger(i.cantidad)&&i.cantidad>0&&i.cantidad<=99).slice(0,50):[];} catch {return [];}
}
function saveCart(items) {localStorage.setItem(CART,JSON.stringify(items));updateCount();}
function updateCount() {$('#cartCount').textContent=readCart().reduce((s,i)=>s+i.cantidad,0);}
function toast(text) {clearTimeout(toastTimer);$('#toast').textContent=text;$('#toast').hidden=false;toastTimer=setTimeout(()=>$('#toast').hidden=true,3500);}
function notice(selector,text,type='error') {const el=$(selector);if(el)el.innerHTML=text?`<div class="notice ${type}">${esc(text)}</div>`:'';}
async function api(url,options={}) {
 const headers=new Headers(options.headers||{});
 if(options.body && !(options.body instanceof URLSearchParams)) headers.set('Content-Type','application/json');
 if(options.method && !['GET','HEAD'].includes(options.method)) {
  const t=await fetch('/api/csrf',{credentials:'same-origin'});
  if(!t.ok)throw new Error('No se pudo preparar la solicitud. Recarga la página.');
  const csrf=await t.json();headers.set(csrf.headerName,csrf.token);
 }
 const response=await fetch(url,{...options,headers,credentials:'same-origin'});
 const data=response.status===204?null:await response.json().catch(()=>null);
 if(!response.ok){const e=new Error(data?.mensaje||'No se pudo completar la solicitud.');e.status=response.status;throw e;}
 return data;
}
function bindImages(parent=document) {parent.querySelectorAll('img').forEach(img=>img.addEventListener('error',()=>{img.src='/img/placeholder.svg';},{once:true}));}
async function nav() {
 me=await api('/api/me');
 $('#userName').textContent=me.autenticado?`Hola, ${me.nombre}`:'';
 $('#logoutBtn').hidden=!me.autenticado;$('#ordersLink').hidden=!me.autenticado;
 if(me.rol==='ADMIN')$('#adminLink').href='/admin.html';
 $('#logoutBtn').onclick=async()=>{try{await api('/logout',{method:'POST'});location.href='/index.html';}catch(e){toast(e.message);}};
 updateCount();
}
function addToCart(id) {
 const game=products.find(p=>p.id===id);if(!game||game.stock<1)return;
 let cart=readCart(),item=cart.find(i=>i.videojuegoId===id);
 if(item){if(item.cantidad>=Math.min(game.stock,99)){toast('Llegaste al stock disponible.');return;}item.cantidad++;}
 else {if(cart.length>=50){toast('Máximo 50 títulos por carrito.');return;}cart.push({videojuegoId:id,cantidad:1});}
 try{saveCart(cart);toast('Agregado a tu carrito');}catch{toast('No se pudo guardar el carrito. Permite el almacenamiento del navegador.');}
}
async function catalog() {
 products=await api('/api/videojuegos');
 [...new Set(products.map(p=>p.genero))].sort().forEach(g=>$('#genre').add(new Option(g,g)));
 function render() {
  const q=$('#search').value.toLocaleLowerCase(), genre=$('#genre').value;
  const list=products.filter(p=>(!genre||p.genero===genre)&&`${p.titulo} ${p.plataforma}`.toLocaleLowerCase().includes(q));
  list.sort($('#sort').value==='priceAsc'?(a,b)=>a.precio-b.precio:$('#sort').value==='priceDesc'?(a,b)=>b.precio-a.precio:(a,b)=>a.titulo.localeCompare(b.titulo));
  $('#catalogCount').textContent=`${list.length} videojuegos disponibles en el catálogo`;
  $('#games').innerHTML=list.map(p=>`<article class="card"><img class="cover" src="${esc(image(p.imagenUrl))}" alt="Portada de ${esc(p.titulo)}"><div class="card-content"><div class="row"><span class="pill">${esc(p.genero)}</span><span class="tiny muted">${esc(p.plataforma)}</span></div><h3>${esc(p.titulo)}</h3><div class="row"><span class="price">${money(p.precio)}</span><span class="stock ${p.stock===0?'out':p.stock<=5?'low':''}">${p.stock===0?'Agotado':`${p.stock} disponibles`}</span></div><div class="actions"><button class="primary" data-add="${p.id}" ${!p.stock?'disabled':''}>+ Al carrito</button><button class="ghost" data-detail="${p.id}" aria-label="Ver detalle de ${esc(p.titulo)}">Detalle</button></div></div></article>`).join('')||'<div class="empty"><h2>Sin coincidencias</h2><p>Prueba con otro título o género.</p></div>';
  bindImages($('#games'));
 }
 ['search','genre','sort'].forEach(id=>$('#'+id).addEventListener('input',render));
 $('#games').onclick=e=>{const add=e.target.closest('[data-add]'),detail=e.target.closest('[data-detail]');if(add)addToCart(Number(add.dataset.add));if(detail){const p=products.find(g=>g.id===Number(detail.dataset.detail));$('#detailContent').innerHTML=`<img src="${esc(image(p.imagenUrl))}" alt="${esc(p.titulo)}"><span class="pill">${esc(p.plataforma)}</span><h2 style="margin-top:18px">${esc(p.titulo)}</h2><p class="muted">${esc(p.descripcion||'Descubre tu próxima aventura con este videojuego.')}</p><p class="price">${money(p.precio)}</p><button class="primary" id="detailAdd" ${!p.stock?'disabled':''}>Agregar al carrito</button>`;bindImages($('#detailContent'));$('#detailAdd').onclick=()=>addToCart(p.id);$('#details').showModal();}};
 $('#closeDetails').onclick=()=>$('#details').close();render();
}
function cartDetails() {
 return readCart().map(i=>({...i,game:products.find(g=>g.id===i.videojuegoId)}));
}
function totals(items) {return items.reduce((s,i)=>s+(i.game?i.game.precio*i.cantidad:0),0);}
function validCart(items) {return items.length>0&&items.every(i=>i.game&&i.game.activo&&i.game.stock>=i.cantidad);}
function summary(items,button) {return `<aside class="panel summary"><h2>Resumen</h2><div class="row"><span class="muted">Unidades</span><span>${items.reduce((s,i)=>s+i.cantidad,0)}</span></div><div class="row"><span class="muted">Subtotal</span><span>${money(totals(items))}</span></div><div class="row"><span class="muted">Costos adicionales</span><span>${money(0)}</span></div><div class="row total"><span>Total</span><span>${money(totals(items))}</span></div>${button}<p class="tiny muted" style="margin-top:16px">Demostración académica. No se realiza ningún cobro real.</p></aside>`;}
async function cartPage() {
 products=await api('/api/videojuegos');
 function render() {
  const items=cartDetails();
  if(!items.length){$('#cartView').innerHTML='<div class="empty"><div class="eyebrow">Una nueva partida te espera</div><h2>Tu carrito está vacío</h2><p>Explora el catálogo y encuentra tu próximo juego.</p><a class="btn primary" href="/index.html#catalogo">Descubrir videojuegos</a></div>';return;}
  $('#cartView').innerHTML=`<div class="split"><section class="panel">${items.map(i=>`<article class="cart-item"><img src="${esc(image(i.game?.imagenUrl))}" alt="Portada"><div><h3>${esc(i.game?.titulo||'Videojuego no disponible')}</h3><p class="muted tiny">${esc(i.game?.plataforma||'Retira este producto para continuar.')}</p><div class="qty"><label class="sr-only" for="qty-${i.videojuegoId}">Cantidad de ${esc(i.game?.titulo)}</label><input id="qty-${i.videojuegoId}" type="number" min="1" max="99" value="${i.cantidad}" data-qty="${i.videojuegoId}"><button class="small ghost danger" data-remove="${i.videojuegoId}">Quitar</button></div>${i.game&&i.cantidad>i.game.stock?`<span class="stock out">Stock actual: ${i.game.stock}. Ajusta la cantidad.</span>`:''}</div><span class="price">${i.game?money(i.game.precio*i.cantidad):'—'}</span></article>`).join('')}<a class="btn ghost small" style="margin-top:20px" href="/index.html">← Seguir explorando</a></section>${summary(items,`<button id="checkout" class="primary full" style="margin-top:18px" ${validCart(items)?'':'disabled'}>Continuar al pago →</button>${!me.autenticado?'<p class="tiny muted">Te pediremos iniciar sesión en el siguiente paso.</p>':''}`)}</div>`;
  bindImages($('#cartView'));$('#checkout').onclick=()=>location.href=me.autenticado?'/pago.html':'/login.html?next=pagar';
 }
 $('#cartView').onclick=e=>{const b=e.target.closest('[data-remove]');if(b){saveCart(readCart().filter(i=>i.videojuegoId!==Number(b.dataset.remove)));render();}};
 $('#cartView').onchange=e=>{if(!e.target.matches('[data-qty]'))return;const qty=Number(e.target.value);if(!Number.isInteger(qty)||qty<1||qty>99){toast('La cantidad debe estar entre 1 y 99.');render();return;}saveCart(readCart().map(i=>i.videojuegoId===Number(e.target.dataset.qty)?{...i,cantidad:qty}:i));render();};render();
}
function nextTarget() {const n=new URLSearchParams(location.search).get('next');return ['pagar','admin','pedidos'].includes(n)?n:'';}
function afterLogin() {const n=nextTarget();if(n==='pagar')return '/pago.html';if(n==='pedidos')return '/pedidos.html';if(me.rol==='ADMIN')return '/admin.html';return '/index.html';}
async function authPage(register=false) {
 const next=nextTarget(),query=next?'?next='+next:'';
 if(me.autenticado&&!register){if(next==='admin'&&me.rol!=='ADMIN'){notice('#authMessage','Tu cuenta es de cliente. Usa una cuenta administradora para entrar al panel.');return;}location.replace(afterLogin());return;}
 if(register)$('#loginLink').href='/login.html'+query;else $('#registerLink').href='/registro.html'+query;
 const form=$(register?'#registerForm':'#loginForm');
 form.onsubmit=async e=>{
  e.preventDefault();const btn=form.querySelector('button:not(.pass-toggle)');btn.disabled=true;notice('#authMessage','');
  try {
   const data=Object.fromEntries(new FormData(form));data.correo=data.correo.trim().toLowerCase();
   if(register){await api('/api/auth/registro',{method:'POST',body:JSON.stringify(data)});location.href='/login.html'+(query?query+'&':'?')+'creada=1';}
   else{await api('/procesar-login',{method:'POST',body:new URLSearchParams(data)});me=await api('/api/me');if(next==='admin'&&me.rol!=='ADMIN'){await nav();notice('#authMessage','Accediste como cliente. El panel requiere una cuenta administradora.');return;}location.href=afterLogin();}
  }catch(error){notice('#authMessage',error.message);}finally{btn.disabled=false;}
 };
 if(!register&&new URLSearchParams(location.search).has('creada'))notice('#authMessage','Cuenta creada. Inicia sesión para continuar.','success');
}
async function payment() {
 if(!me.autenticado){location.replace('/login.html?next=pagar');return;}
 products=await api('/api/videojuegos');const items=cartDetails();
 if(!validCart(items)){$('#paymentView').innerHTML='<div class="empty"><h2>Revisa tu carrito</h2><p>Está vacío o cambió la disponibilidad de un juego.</p><a class="btn primary" href="/carrito.html">Volver al carrito</a></div>';return;}
 $('#paymentView').innerHTML=`<div class="split"><section class="panel"><span class="pill">PASARELA DE DEMOSTRACIÓN</span><h2 style="margin-top:20px">Elige un método de prueba</h2><p class="muted">Comprando como <strong>${esc(me.correo)}</strong></p><div class="notice">Este pago es simulado. No ingreses números de tarjeta, CVV ni datos bancarios reales.</div><form id="payForm"><div class="pay-options"><label class="pay-option"><input type="radio" name="metodo" value="TARJETA_DEMO" checked><span>▣ Tarjeta de prueba</span></label><label class="pay-option"><input type="radio" name="metodo" value="YAPE_DEMO"><span>◈ Yape de prueba</span></label></div><label for="outcome">Escenario de la simulación</label><select id="outcome" name="resultado"><option value="APROBADO">Pago aprobado</option><option value="RECHAZADO">Pago rechazado (para probar)</option></select><label class="pay-option" style="margin-top:20px"><input type="checkbox" required><span class="tiny">Entiendo que es una compra de demostración y no habrá cargos reales.</span></label><button class="primary full" id="payButton" style="margin-top:15px">Confirmar pago simulado · ${money(totals(items))}</button></form></section>${summary(items,items.map(i=>`<p class="tiny">${esc(i.game.titulo)} × ${i.cantidad}</p>`).join(''))}</div>`;
 $('#payForm').onsubmit=async e=>{
  e.preventDefault();const btn=$('#payButton');btn.disabled=true;btn.textContent='Procesando…';notice('#paymentError','');
  try {
   const lines=readCart(),signature=JSON.stringify(lines);let key=sessionStorage.getItem('pixelvault.pay.key');
   if(!key||sessionStorage.getItem('pixelvault.pay.cart')!==signature){key=crypto.randomUUID();sessionStorage.setItem('pixelvault.pay.key',key);sessionStorage.setItem('pixelvault.pay.cart',signature);}
   const form=Object.fromEntries(new FormData(e.target));
   const order=await api('/api/pedidos',{method:'POST',body:JSON.stringify({items:lines,metodo:form.metodo,resultado:form.resultado,clave:key})});
   saveCart([]);sessionStorage.removeItem('pixelvault.pay.key');sessionStorage.removeItem('pixelvault.pay.cart');location.href='/pedidos.html?pedido='+encodeURIComponent(order.id);
  }catch(error){notice('#paymentError',error.message);if(error.status===401){location.href='/login.html?next=pagar';return;}if(error.status===409){notice('#paymentError',error.message+' Vuelve al carrito para actualizar la disponibilidad.');}}
  finally{btn.disabled=false;btn.textContent='Confirmar pago simulado · '+money(totals(items));}
 };
}
function orderMarkup(o,admin=false) {const focus=new URLSearchParams(location.search).get('pedido')===o.id;return `<article class="panel ${focus?'focus-order':''}">${focus?'<div class="notice success">¡Compra de demostración confirmada! Tu pedido quedó registrado.</div>':''}<div class="order-head"><div><div class="eyebrow">Pedido ${esc(o.id.slice(0,8))}</div><h3>${esc(date(o.fecha))}</h3>${admin?`<p class="muted tiny">${esc(o.usuario)}</p>`:''}</div><div><span class="pill">Pagado · simulación</span><p class="price" style="margin-top:10px;margin-bottom:0">${money(o.total)}</p></div></div><div class="order-lines">${o.items.map(i=>`<div class="row"><span>${esc(i.titulo)} × ${i.cantidad}</span><span>${money(i.precio*i.cantidad)}</span></div>`).join('')}</div><p class="tiny muted" style="margin-bottom:0">${o.metodo==='YAPE_DEMO'?'Yape':'Tarjeta'} de prueba · No constituye un cobro real ni una licencia activable.</p></article>`;}
async function ordersPage(){if(!me.autenticado){location.replace('/login.html?next=pedidos');return;}const orders=await api('/api/pedidos');$('#orders').innerHTML=orders.map(o=>orderMarkup(o)).join('')||'<div class="empty"><h2>Todavía no tienes pedidos</h2><p>Tu primera aventura te espera en el catálogo.</p></div>';}
async function adminPage(){
 if(!me.autenticado){location.replace('/login.html?next=admin');return;}
 if(me.rol!=='ADMIN'){$('main').innerHTML='<div class="empty"><h1>Acceso exclusivo de administración</h1><a class="btn primary" href="/index.html">Ir al catálogo</a></div>';return;}
 let orders=[];
 async function render(){products=await api('/api/videojuegos');orders=await api('/api/admin/pedidos');$('#metrics').innerHTML=`<div class="panel"><span class="muted tiny">Videojuegos</span><strong>${products.length}</strong></div><div class="panel"><span class="muted tiny">Unidades en stock</span><strong>${products.reduce((s,p)=>s+p.stock,0)}</strong></div><div class="panel"><span class="muted tiny">Ventas simuladas</span><strong>${money(orders.reduce((s,o)=>s+o.total,0))}</strong></div>`;
 $('#inventory').innerHTML=products.map(p=>`<tr><td><strong>${esc(p.titulo)}</strong><br><span class="tiny muted">${esc(p.genero)}</span></td><td>${esc(p.plataforma)}</td><td>${money(p.precio)}</td><td>${p.stock}</td><td>${p.activo?'Publicado':'Oculto'}</td><td><div class="actions"><button class="small" data-edit="${p.id}">Editar</button><button class="small ghost danger" data-delete="${p.id}">Eliminar</button></div></td></tr>`).join('')||'<tr><td colspan="6">No hay videojuegos. Agrega el primero.</td></tr>';
 $('#adminOrders').innerHTML=orders.map(o=>orderMarkup(o,true)).join('')||'<p class="muted">Todavía no hay pedidos.</p>';}
 const form=$('#productForm');
 function open(p){form.reset();form.elements.id.value=p?.id||'';for(const k of ['titulo','descripcion','genero','plataforma','precio','stock','imagenUrl'])form.elements[k].value=p?.[k]??'';form.elements.activo.value=String(p?.activo??true);$('#productTitle').textContent=p?'Editar videojuego':'Nuevo videojuego';notice('#productError','');$('#productDialog').showModal();}
 $('#newProduct').onclick=()=>open(null);$('#closeProduct').onclick=()=>$('#productDialog').close();
 $('#inventory').onclick=async e=>{const edit=e.target.closest('[data-edit]'),del=e.target.closest('[data-delete]');if(edit)open(products.find(p=>p.id===Number(edit.dataset.edit)));if(del){if(!confirm('¿Eliminar el videojuego? Los pedidos anteriores se conservarán.'))return;del.disabled=true;try{await api('/api/videojuegos/'+del.dataset.delete,{method:'DELETE'});await render();toast('Videojuego eliminado.');}catch(error){notice('#adminError',error.message);}finally{del.disabled=false;}}};
 form.onsubmit=async e=>{e.preventDefault();const btn=form.querySelector('button');btn.disabled=true;notice('#productError','');try{const d=Object.fromEntries(new FormData(form)),id=d.id;delete d.id;d.precio=Number(d.precio);d.stock=Number(d.stock);d.activo=d.activo==='true';await api('/api/videojuegos'+(id?'/'+id:''),{method:id?'PUT':'POST',body:JSON.stringify(d)});$('#productDialog').close();await render();toast('Videojuego guardado.');}catch(error){notice('#productError',error.message);}finally{btn.disabled=false;}};
 await render();
}
(async()=>{try{await nav();const p=document.body.dataset.page;if(p==='catalog')await catalog();if(p==='cart')await cartPage();if(p==='login')await authPage();if(p==='register')await authPage(true);if(p==='payment')await payment();if(p==='orders')await ordersPage();if(p==='admin')await adminPage();}catch(e){const id={catalog:'#catalogError',cart:'#cartError',payment:'#paymentError',admin:'#adminError',orders:'#orders',login:'#authMessage',register:'#authMessage'}[document.body.dataset.page];notice(id,e.message);}})();
window.addEventListener('storage',e=>{if(e.key===CART){updateCount();if(['cart','payment'].includes(document.body.dataset.page))location.reload();}});
// Mostrar u ocultar contraseña
document.querySelectorAll('.pass-toggle').forEach(function (btn) {
  btn.addEventListener('click', function () {
    var input = document.getElementById(btn.dataset.target);
    var visible = input.type === 'text';
    input.type = visible ? 'password' : 'text';
    btn.textContent = visible ? 'Mostrar' : 'Ocultar'; btn.setAttribute('aria-pressed', String(!visible)); btn.setAttribute('aria-label', visible ? 'Mostrar contraseña' : 'Ocultar contraseña');
  });
});
// Indicador de longitud de contraseña
(function () {
  var input = document.getElementById('password');
  var bar = document.getElementById('passBar');
  var count = document.getElementById('passCount');
  if (!input || !bar || !count) return;
  input.addEventListener('input', function () {
    var len = input.value.length;
    count.textContent = len + ' de 64 caracteres';
    bar.style.width = Math.min(len / 8, 1) * 100 + '%';
  });
})();