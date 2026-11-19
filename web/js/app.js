'use strict';
const $ = selector => document.querySelector(selector);
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const etiquetas = {inicial:'Inicial',primaria:'Primaria',secundaria:'Secundaria'};
let catalogo = [], actualizado = '';
const safeURL = ColegiosCore.enlaceSeguro;
function imagenColegio(c) {
  const ruta = ColegiosCore.imagenSegura(c.imagenUrl);
  return `<span class="school-image-slot" role="img" aria-label="${ruta ? 'Imagen de ' : 'Imagen pendiente de '}${escapeHTML(c.nombre)}">${ruta ? `<img class="school-image" src="${escapeHTML(ruta)}" alt="${escapeHTML(c.nombre)}" loading="lazy" referrerpolicy="no-referrer">` : ''}</span>`;
}
function prepararImagenes(contenedor) {
  contenedor.querySelectorAll('.school-image').forEach(img => {
    const fallo = () => {img.parentElement.setAttribute('aria-label', 'Imagen no disponible de ' + img.alt); img.remove();};
    img.addEventListener('error', fallo, {once:true});
    if (img.complete && img.naturalWidth === 0) fallo();
  });
}
function botonEnlace(url, texto) {
  const href = safeURL(url);
  return href ? `<a class="secondary" href="${escapeHTML(href)}" target="_blank" rel="noopener noreferrer">${texto} ↗</a>` : `<span class="link-pending" aria-disabled="true">${texto} · pendiente</span>`;
}
function direccionColegio(c) {
  const url = safeURL(c.googleMapsUrl);
  const direccion = escapeHTML(c.direccion);
  return url ? `<a href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer" aria-label="${direccion}: abrir en Google Maps">${direccion} ↗</a>` : direccion;
}
function recuadroTelefono(numero) {
  if (!/^\d{7,15}$/.test(numero || '')) return '';
  const visible = numero.replace(/^(01)(\d{7})$/, '($1) $2').replace(/^(9\d{2})(\d{3})(\d{3})$/, '$1 $2 $3');
  return `<div><strong>Teléfono</strong><a href="tel:${numero}">${visible}</a></div>`;
}
function filtros() {return {texto:$('#search').value,gestion:$('#gestion').value,nivel:$('#nivel').value,orden:$('#sort').value};}
function tarjetaColegio(c, orden) {
  const publico = c.gestion === 'publico';
  const coincidencia = orden === 'ranking'
    ? `<p class="match">${c.coincidencia.total ? `${c.coincidencia.aciertos} de ${c.coincidencia.total} criterios coinciden` : 'Selecciona tus preferencias'}</p>` : '';
  const niveles = c.niveles.length ? c.niveles.map(n => etiquetas[n]) : ['Niveles por confirmar'];
  return `<article class="card card--${publico ? 'publico' : 'privado'}">
    <div class="card-top">${imagenColegio(c)}</div>
    <div class="card-content">
      <div class="card-meta"><span class="badge">${publico ? 'Público' : 'Privado'}</span><span class="sede">${escapeHTML(c.sede)}</span></div>
      ${coincidencia}<h3>${escapeHTML(c.nombre)}</h3>
      <p class="address">${direccionColegio(c)}</p>
      <div class="tags">${niveles.map(n => `<span class="tag">${escapeHTML(n)}</span>`).join('')}</div>
      <button type="button" class="detail-button" data-detail="${escapeHTML(c.id)}" aria-label="Ver ficha de ${escapeHTML(c.nombre)}">Ver ficha del colegio</button>
    </div>
  </article>`;
}
function render() {
  const f = filtros();
  $('#rankingNote').hidden = f.orden !== 'ranking';
  document.querySelectorAll('[data-quick]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.quick === 'todos' ? !f.gestion && !f.nivel : f.gestion === b.dataset.quick && !f.nivel)));
  const lista = ColegiosCore.seleccionar(catalogo,f);
  $('#count').textContent = `${lista.length} ${lista.length===1?'opción disponible':'opciones disponibles'} en nuestro catálogo inicial`;
  $('#cards').innerHTML = lista.length ? lista.map(c => tarjetaColegio(c, f.orden)).join('') : '<div class="empty"><h3>No encontramos coincidencias</h3><p>Prueba otro nombre o limpia los filtros.</p><button class="primary" id="emptyClear">Limpiar filtros</button></div>';
  if ($('#emptyClear')) $('#emptyClear').onclick=limpiar;
  prepararImagenes($('#cards'));
}
function limpiar(){['search','gestion','nivel'].forEach(id=>$('#'+id).value='');$('#sort').value='nombre';render();}
function detalle(id) {
 const c=catalogo.find(c=>c.id===id);if(!c)return;
 const bloques=[['Gestión',c.gestion==='publico'?'Pública':'Privada'],['Niveles documentados',c.niveles.map(n=>etiquetas[n]).join(', ')||'Por confirmar'],['Dirección',c.direccion],['Turno',c.turno||'Consultar con el colegio']];
 $('#detailContent').innerHTML=`<div class="detail-heading">${imagenColegio(c)}<div><p class="eyebrow">VILLA EL SALVADOR</p><h2 id="detailTitle">${escapeHTML(c.nombre)}</h2><p>${escapeHTML(c.sede)}</p></div></div><p>${escapeHTML(c.descripcion)}</p>${c.notaUbicacion ? `<p class="location-note">${escapeHTML(c.notaUbicacion)}</p>` : ''}<div class="detail-grid">${bloques.map(([k,v])=>`<div><strong>${escapeHTML(k)}</strong>${k==='Dirección' ? direccionColegio(c) : escapeHTML(v)}</div>`).join('')}${recuadroTelefono(c.telefono)}</div><div class="detail-actions">${safeURL(c.sitioWebUrl) ? botonEnlace(c.sitioWebUrl, 'Página oficial') : ''}${botonEnlace(c.facebookUrl, c.facebookTipo === 'grupo' ? 'Grupo de Facebook' : 'Facebook')}</div><h3>Fuentes de esta ficha</h3><ul class="sources">${c.fuentes.map((u,i)=>{const url=safeURL(u);return url?`<li><a href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(new URL(url).hostname)} · fuente ${i+1} ↗</a></li>`:'';}).join('')}</ul><p class="source-note">Actualización del catálogo: ${escapeHTML(actualizado)}. Para conocer los costos y la disponibilidad de vacantes, comunícate directamente con el colegio. No se han asignado estrellas ni puntuaciones de calidad.</p>`;
 prepararImagenes($('#detailContent'));
 $('#detail').showModal();
}
$('#cards').addEventListener('click',e=>{const b=e.target.closest('[data-detail]');if(b)detalle(b.dataset.detail);});
for(const id of ['search','gestion','nivel','sort']) $('#'+id).addEventListener(id==='search'?'input':'change',render);
$('#clear').onclick=limpiar;
$('#searchButton').onclick=()=>{render();$('#directorio').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});};
document.querySelectorAll('[data-quick]').forEach(b=>b.onclick=()=>{const v=b.dataset.quick;$('#gestion').value=['publico','privado'].includes(v)?v:'';$('#nivel').value='';render();});
$('#closeDetail').onclick=()=>$('#detail').close();$('#closeAbout').onclick=()=>$('#about').close();
$('#howButton').onclick=$('#methodButton').onclick=()=>$('#about').showModal();
for(const modal of document.querySelectorAll('dialog')) modal.addEventListener('click',e=>{if(e.target===modal){const r=modal.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)modal.close();}});
async function cargar(){
 $('#cards').setAttribute('aria-busy','true');
 try{const response=await fetch('./datos/colegios.json');if(!response.ok)throw new Error('No se pudo cargar el catálogo.');const data=await response.json();if(!Array.isArray(data.colegios))throw new Error('Catálogo inválido.');catalogo=data.colegios;actualizado=data.actualizado;$('#updated').textContent='Catálogo actualizado: '+actualizado;render();}
 catch(error){$('#count').textContent='El catálogo no está disponible.';$('#cards').innerHTML='<div class="empty"><h3>No pudimos cargar los colegios</h3><p>Revisa tu conexión y vuelve a intentarlo.</p><button id="retry" class="primary">Reintentar</button></div>';$('#retry').onclick=cargar;}
 finally{$('#cards').setAttribute('aria-busy','false');}
}
cargar();
