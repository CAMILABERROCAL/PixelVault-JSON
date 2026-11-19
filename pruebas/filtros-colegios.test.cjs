const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { seleccionar } = require('../web/js/colegios-core.js');

const catalogo = JSON.parse(fs.readFileSync('web/datos/colegios.json', 'utf8')).colegios;
const base = { texto: '', gestion: '', nivel: '', orden: 'nombre' };
const elegir = f => seleccionar(catalogo, { ...base, ...f });

test('filtro por gestión devuelve solo ese tipo', () => {
    assert.ok(elegir({ gestion: 'publico' }).every(c => c.gestion === 'publico'));
    assert.ok(elegir({ gestion: 'privado' }).every(c => c.gestion === 'privado'));
});

test('combinar gestión y nivel respeta ambos criterios', () => {
    const r = elegir({ gestion: 'privado', nivel: 'secundaria' });
    assert.ok(r.every(c => c.gestion === 'privado' && c.niveles.includes('secundaria')));
});

test('restablecer filtros devuelve el catálogo completo ordenado por nombre', () => {
    const r = elegir({});
    assert.equal(r.length, catalogo.length);
    const nombres = r.map(c => c.nombre);
    assert.deepEqual(nombres, [...nombres].sort((a, b) => a.localeCompare(b, 'es')));
});

test('búsqueda sin coincidencias devuelve lista vacía sin lanzar error', () => {
    assert.doesNotThrow(() => elegir({ texto: 'zzzz-no-existe' }));
    assert.equal(elegir({ texto: 'zzzz-no-existe' }).length, 0);
});

test('nivel inicial devuelve exactamente las fichas que lo ofrecen', () => {
    assert.deepEqual(elegir({ nivel: 'inicial' }).map(c => c.id).sort(),
        catalogo.filter(c => c.niveles.includes('inicial')).map(c => c.id).sort());
});

test('ranking conserva todo el catálogo al indicar criterios', () => {
    assert.equal(elegir({ gestion: 'privado', nivel: 'primaria', orden: 'ranking' }).length, catalogo.length);
});

test('ranking ordena de mayor a menor coincidencia', () => {
    const puntajes = elegir({ gestion: 'publico', nivel: 'primaria', orden: 'ranking' }).map(c => c.coincidencia.aciertos);
    assert.ok(new Set(puntajes).size > 1);
    assert.deepEqual(puntajes, [...puntajes].sort((a, b) => b - a));
});

test('ranking: cada resultado trae aciertos y total de criterios', () => {
    const r = elegir({ gestion: 'publico', nivel: 'primaria', orden: 'ranking' });
    for (const c of r) {
        assert.ok(Number.isInteger(c.coincidencia.aciertos));
        assert.ok(c.coincidencia.aciertos <= c.coincidencia.total);
    }
});

test('búsqueda por texto ignora tildes y mayúsculas', () => {
    assert.ok(elegir({ texto: 'VILLA EL SALVADOR' }).length > 0);
    assert.equal(elegir({ texto: 'republica' }).length, elegir({ texto: 'república' }).length);
});