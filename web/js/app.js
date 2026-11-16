'use strict';
const $ = selector => document.querySelector(selector);
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const etiquetas = {inicial:'Inicial',primaria:'Primaria',secundaria:'Secundaria'};
let catalogo = [], actualizado = '';
const money = value => ColegiosCore.importe(value) ? new Intl.NumberFormat('es-PE',{style:'currency',currency:'PEN',maximumFractionDigits:2}).format(value) : 'Consultar';
const safeURL = value => {try { const u = new URL(value); return u.protocol === 'https:' ? u.href : ''; } catch {return '';}};
function logo(c) {
  const ruta = c.logo && /^\.\/img\/[a-zA-Z0-9_./-]+\.(svg|png|webp|jpg)$/i.test(c.logo) && !c.logo.includes('..') ? c.logo : null;
  return ruta ? `<img class="school-logo" src="${escapeHTML(ruta)}" alt="Logo de ${escapeHTML(c.nombre)}">` : `<span class="generic-logo" role="img" aria-label="Emblema genérico, logo oficial pendiente">${escapeHTML(c.nombre.replace(/^IE /,'').split(' ').slice(0,2).map(p=>p[0]).join(''))}</span>`;
}
function filtros() {return {texto:$('#search').value,gestion:$('#gestion').value,nivel:$('#nivel').value,zona:$('#zona').value,min:$('#min').value === '' ? null : Number($('#min').value),max:$('#max').value === '' ? null : Number($('#max').value),incluirDesconocidos:$('#unknown').checked,orden:$('#sort').value};}
function render() {
  const f = filtros();
  $('#filterError').textContent = '';
  $('#rankingNote').hidden = f.orden !== 'ranking';
  document.querySelectorAll('[data-quick]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.quick === 'inicial' ? f.nivel === 'inicial' : b.dataset.quick === 'todos' ? !f.gestion && !f.nivel : f.gestion === b.dataset.quick && !f.nivel)));
  let lista;
  try {lista = ColegiosCore.seleccionar(catalogo,f);} catch(error) {$('#filterError').textContent=error.message;$('#cards').innerHTML='';$('#count').textContent='Revisa el rango de precios.';return;}
  $('#count').textContent = `${lista.length} ${lista.length===1?'opción disponible':'opciones disponibles'} en nuestro catálogo inicial`;
  $('#cards').innerHTML = lista.length ? lista.map(c=>`<article class="card"><div class="card-top"><span class="badge">${c.gestion==='publico'?'PÚBLICO':'PRIVADO'}</span>${logo(c)}${!c.logo?'<span class="logo-caption">Emblema referencial</span>':''}</div><div class="card-content">${f.orden==='ranking'?`<p class="match">${c.coincidencia.total?`${c.coincidencia.aciertos} de ${c.coincidencia.total} criterios coinciden`:'Selecciona tus preferencias'}</p>`:''}<h3>${escapeHTML(c.nombre)}</h3><p class="sede">${escapeHTML(c.sede)}</p><p class="address">⌖ ${escapeHTML(c.direccion)}</p><div class="tags">${c.niveles.length?c.niveles.map(n=>`<span class="tag">${escapeHTML(etiquetas[n])}</span>`).join(''):'<span class="tag">Niveles por confirmar</span>'}</div><div class="cost-row"><span>${c.gestion==='publico'?'Gestión pública':'Pensión mensual'}</span><strong>${c.gestion==='publico'?'Sin pensión':money(c.pension)}</strong></div><button class="detail-button" data-detail="${escapeHTML(c.id)}">Ver información <span aria-hidden="true">↗</span></button></div></article>`).join('') : '<div class="empty"><h3>No encontramos coincidencias</h3><p>Prueba otro nombre, amplía el presupuesto o limpia los filtros.</p><button class="primary" id="emptyClear">Limpiar filtros</button></div>';
  if ($('#emptyClear')) $('#emptyClear').onclick=limpiar;
  document.querySelectorAll('.school-logo').forEach(img=>img.addEventListener('error',()=>{img.replaceWith(Object.assign(document.createElement('span'),{className:'generic-logo',textContent:'IE',title:'Logo no disponible'}));},{once:true}));
}
function limpiar(){['search','gestion','nivel','zona','min','max'].forEach(id=>$('#'+id).value='');$('#unknown').checked=true;$('#sort').value='nombre';render();}
function detalle(id) {
 const c=catalogo.find(c=>c.id===id);if(!c)return;
 const mapa='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(c.nombre+' '+c.direccion+' Villa El Salvador Lima Perú');
 const bloques=[['Gestión',c.gestion==='publico'?'Pública':'Privada'],['Niveles documentados',c.niveles.map(n=>etiquetas[n]).join(', ')||'Por confirmar'],['Dirección',c.direccion],['Turno',c.turno||'Consultar con el colegio'],['Pensión mensual',c.gestion==='publico'?'Sin pensión escolar':money(c.pension)],['Matrícula',c.gestion==='publico'?'Consultar proceso de matrícula':money(c.matricula)],['Cuota de ingreso',c.gestion==='publico'?'No aplica a esta ficha':money(c.cuotaIngreso)],['Año de costos',c.anioCostos||'Sin tarifario verificado']];
 $('#detailContent').innerHTML=`<div class="detail-heading">${logo(c)}<div><p class="eyebrow">VILLA EL SALVADOR</p><h2 id="detailTitle">${escapeHTML(c.nombre)}</h2><p>${escapeHTML(c.sede)}</p></div></div><p>${escapeHTML(c.descripcion)}</p><div class="detail-grid">${bloques.map(([k,v])=>`<div><strong>${escapeHTML(k)}</strong>${escapeHTML(v)}</div>`).join('')}</div><div class="detail-actions"><a class="primary" href="${escapeHTML(mapa)}" target="_blank" rel="noopener noreferrer">Ver ubicación ↗</a>${c.telefono&&/^\d+$/.test(c.telefono)?`<a class="secondary" href="tel:${c.telefono}">Llamar: ${escapeHTML(c.telefono)}</a>`:''}</div><h3>Fuentes de esta ficha</h3><ul class="sources">${c.fuentes.map((u,i)=>{const url=safeURL(u);return url?`<li><a href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(new URL(url).hostname)} · fuente ${i+1} ↗</a></li>`:'';}).join('')}</ul><p class="source-note">Consulta de fuentes: ${escapeHTML(actualizado)}. Confirma importes, servicios y vacantes directamente con la institución. No se han asignado estrellas ni puntuaciones de calidad.</p>`;
 $('#detail').showModal();
}
$('#cards').addEventListener('click',e=>{const b=e.target.closest('[data-detail]');if(b)detalle(b.dataset.detail);});
for(const id of ['search','gestion','nivel','zona','min','max','unknown','sort']) $('#'+id).addEventListener(id==='search'||id==='min'||id==='max'?'input':'change',render);
$('#clear').onclick=limpiar;
$('#searchButton').onclick=()=>{render();$('#directorio').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});};
document.querySelectorAll('[data-quick]').forEach(b=>b.onclick=()=>{const v=b.dataset.quick;$('#gestion').value=['publico','privado'].includes(v)?v:'';$('#nivel').value=v==='inicial'?'inicial':'';render();});
$('#closeDetail').onclick=()=>$('#detail').close();$('#closeAbout').onclick=()=>$('#about').close();
$('#howButton').onclick=$('#methodButton').onclick=()=>$('#about').showModal();
for(const modal of document.querySelectorAll('dialog')) modal.addEventListener('click',e=>{if(e.target===modal){const r=modal.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)modal.close();}});
async function cargar(){
 $('#cards').setAttribute('aria-busy','true');
 try{const response=await fetch('./datos/colegios.json');if(!response.ok)throw new Error('No se pudo cargar el catálogo.');const data=await response.json();if(!Array.isArray(data.colegios))throw new Error('Catálogo inválido.');catalogo=data.colegios;actualizado=data.actualizado;$('#updated').textContent='Fuentes consultadas: '+actualizado;$('#zona').innerHTML='<option value="">Todas las zonas</option>'+[...new Set(catalogo.map(c=>c.zona))].sort((a,b)=>a.localeCompare(b,'es')).map(z=>`<option>${escapeHTML(z)}</option>`).join('');render();}
 catch(error){$('#count').textContent='El catálogo no está disponible.';$('#cards').innerHTML='<div class="empty"><h3>No pudimos cargar los colegios</h3><p>Revisa tu conexión y vuelve a intentarlo.</p><button id="retry" class="primary">Reintentar</button></div>';$('#retry').onclick=cargar;}
 finally{$('#cards').setAttribute('aria-busy','false');}
}
cargar();
