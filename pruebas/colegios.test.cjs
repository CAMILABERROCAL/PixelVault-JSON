const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {seleccionar,criterios}=require('../web/js/colegios-core.js');
const catalogo=JSON.parse(fs.readFileSync('web/datos/colegios.json','utf8')).colegios;
const base={texto:'',gestion:'',nivel:'',min:null,max:null,incluirDesconocidos:true,orden:'nombre'};
const elegir=f=>seleccionar(catalogo,{...base,...f});
test('catálogo válido: IDs únicos, fuentes HTTPS y valores desconocidos nulos',()=>{assert.equal(new Set(catalogo.map(c=>c.id)).size,catalogo.length);for(const c of catalogo){assert.ok(c.nombre&&c.direccion);assert.ok(['privado','publico'].includes(c.gestion));assert.ok(c.fuentes.length);for(const u of c.fuentes)assert.equal(new URL(u).protocol,'https:');for(const k of ['pension','matricula','cuotaIngreso'])assert.ok(c[k]===null||(Number.isFinite(c[k])&&c[k]>=0));}});
test('búsqueda sin acentos y por dirección',()=>{assert.ok(elegir({texto:'republica'}).some(c=>c.id==='ie7091'));assert.ok(elegir({texto:'álamos'}).some(c=>c.id==='ie6066'));});
test('gestión y nivel son filtros independientes',()=>{const r=elegir({gestion:'publico',nivel:'primaria'});assert.ok(r.length);assert.ok(r.every(c=>c.gestion==='publico'&&c.niveles.includes('primaria')));});
test('una búsqueda inexistente devuelve cero resultados',()=>assert.equal(elegir({texto:'zzzz-colegio-inexistente'}).length,0));
test('presupuesto distingue una pensión desconocida de cero',()=>{const r=elegir({gestion:'privado',max:300,incluirDesconocidos:false});assert.equal(r.length,0);assert.ok(elegir({gestion:'privado',max:300}).length>0);});
test('límites de precio incluidos y datos desconocidos ordenados al final',()=>{const muestra=[{...catalogo[0],id:'a',pension:300},{...catalogo[0],id:'b',pension:301},{...catalogo[0],id:'c',pension:null}];assert.deepEqual(seleccionar(muestra,{...base,min:100,max:300,incluirDesconocidos:false}).map(c=>c.id),['a']);assert.deepEqual(seleccionar(muestra,{...base,orden:'precio'}).map(c=>c.id),['a','b','c']);});
test('rango invertido o negativo genera un error claro',()=>{assert.throws(()=>elegir({min:500,max:100}),/mínimo/);assert.throws(()=>elegir({min:-1}),/cero/);});
test('ranking cuenta criterios sin fabricar calidad y respeta búsqueda textual',()=>{const r=elegir({gestion:'publico',nivel:'primaria',orden:'ranking'});assert.equal(r[0].coincidencia.aciertos,2);assert.equal(r[0].coincidencia.total,2);assert.equal(criterios(catalogo[0],{...base,max:200}).aciertos,0);assert.ok(elegir({texto:'innova',orden:'ranking',nivel:'primaria'}).every(c=>c.nombre.includes('Innova')));});
test('ordenar no modifica el catálogo original',()=>{const antes=JSON.stringify(catalogo);elegir({orden:'precio'});assert.equal(JSON.stringify(catalogo),antes);});

test('catálogo solicitado: exactamente cinco privados y cinco públicos',()=>{
 assert.equal(catalogo.length,10);
 assert.equal(catalogo.filter(c=>c.gestion==='privado').length,5);
 assert.equal(catalogo.filter(c=>c.gestion==='publico').length,5);
 assert.ok(!catalogo.some(c=>['ie557','innova-vallejo'].includes(c.id)));
 for(const c of catalogo) for(const k of ['imagenUrl','facebookUrl','googleMapsUrl']) assert.equal(typeof c[k],'string');
});
test('enlaces e imágenes manuales aceptan HTTPS y rechazan protocolos ejecutables',()=>{
 const {enlaceSeguro,imagenSegura}=require('../web/js/colegios-core.js');
 assert.equal(enlaceSeguro(''), '');
 assert.equal(enlaceSeguro('javascript:alert(1)'), '');
 assert.equal(imagenSegura('data:text/html,test'), '');
 assert.equal(enlaceSeguro('https://www.facebook.com/colegio'), 'https://www.facebook.com/colegio');
 assert.equal(enlaceSeguro('https://maps.app.goo.gl/ejemplo'), 'https://maps.app.goo.gl/ejemplo');
 assert.equal(imagenSegura('https://example.com/foto?id=20'), 'https://example.com/foto?id=20');
 assert.equal(imagenSegura('./img/colegio.png'), './img/colegio.png');
 assert.equal(imagenSegura('./img/../datos/a.png'), '');
});
test('interfaz sin filtro de zonas ni categoría nidos',()=>{
 const html=fs.readFileSync('web/index.html','utf8');
 assert.ok(!html.includes('id="zona"'));
 assert.ok(!html.includes('nidos'));
 assert.ok(!html.includes('<option value="inicial">'));
});
