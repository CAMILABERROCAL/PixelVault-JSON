const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const html = fs.readFileSync('web/index.html', 'utf8');
const app = fs.readFileSync('web/js/app.js', 'utf8');

test('los IDs que usa app.js existen en index.html', () => {
    const usados = [...new Set([...app.matchAll(/\$\('#([a-zA-Z]+)'\)/g)].map(m => m[1]))];
    const dinamicos = ['detailContent', 'emptyClear', 'retry'];
    for (const id of usados) {
        if (dinamicos.includes(id)) continue;
        assert.ok(html.includes(`id="${id}"`), `falta #${id} en index.html`);
    }
});

test('el diálogo de detalle está definido con título accesible', () => {
    assert.match(html, /<dialog id="detail" aria-labelledby="detailTitle">/);
});

test('los filtros rápidos tienen estado de presionado accesible', () => {
    const botones = [...html.matchAll(/data-quick="(\w+)" aria-pressed="(true|false)"/g)];
    assert.equal(botones.length, 3);
});

test('la página declara idioma español', () => {
    assert.match(html, /<html lang="es">/);
});