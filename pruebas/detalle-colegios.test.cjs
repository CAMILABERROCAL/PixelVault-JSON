const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const catalogo = JSON.parse(fs.readFileSync('web/datos/colegios.json', 'utf8')).colegios;
const html = fs.readFileSync('web/index.html', 'utf8');
const app = fs.readFileSync('web/js/app.js', 'utf8');

const CAMPOS_FICHA = ['id', 'nombre', 'sede', 'gestion', 'niveles', 'direccion', 'descripcion', 'pension', 'matricula', 'cuotaIngreso', 'fuentes'];

test('cada ficha tiene los campos que muestra el detalle', () => {
    for (const c of catalogo) {
        for (const k of CAMPOS_FICHA) assert.ok(k in c, `${c.id} no tiene ${k}`);
        assert.ok(Array.isArray(c.niveles));
        assert.ok(Array.isArray(c.fuentes) && c.fuentes.length > 0, `${c.id} sin fuentes`);
    }
});

test('importes desconocidos se muestran como "Consultar", no como cero', () => {
    assert.match(app, /: 'Consultar';/);
    assert.ok(catalogo.some(c => c.pension === null), 'debe haber al menos un importe por consultar');
    assert.ok(!/ColegiosCore\.importe\(value\)[^;]*\?[^;]*: 0/.test(app));
});

test('la ficha de detalle no ofrece enlaces pendientes como clicables', () => {
    assert.match(app, /link-pending/);
    assert.match(app, /aria-disabled="true"/);
});

test('todas las fuentes de la ficha son HTTPS', () => {
    for (const c of catalogo) for (const u of c.fuentes) assert.equal(new URL(u).protocol, 'https:', `${c.id}: ${u}`);
});

test('el detalle se busca por ID y un ID inexistente no lanza error', () => {
    assert.match(app, /catalogo\.find\(c=>c\.id===id\);if\(!c\)return;/);
    assert.equal(catalogo.find(c => c.id === 'id-que-no-existe'), undefined);
});

test('cada tarjeta tiene un botón de detalle con ID válido', () => {
    const ids = new Set(catalogo.map(c => c.id));
    assert.ok(app.includes('data-detail="${escapeHTML(c.id)}"'));
    assert.equal(ids.size, catalogo.length);
});

test('index.html contiene los IDs que usa app.js', () => {
    const usados = [...new Set([...app.matchAll(/\$\('#([a-zA-Z]+)'\)/g)].map(m => m[1]))];
    for (const id of usados) {
        if (['detailContent', 'emptyClear', 'retry'].includes(id)) continue;
        assert.ok(html.includes(`id="${id}"`), `falta #${id} en index.html`);
    }
});

test('el diálogo de detalle existe y tiene título accesible', () => {
    assert.match(html, /<dialog id="detail" aria-labelledby="detailTitle">/);
    assert.match(app, /id="detailTitle"/);
});