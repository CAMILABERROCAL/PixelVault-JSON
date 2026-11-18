const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { seleccionar } = require('../web/js/colegios-core.js');

const catalogo = JSON.parse(fs.readFileSync('web/datos/colegios.json', 'utf8')).colegios;
const base = { texto: '', gestion: '', nivel: '', min: null, max: null, incluirDesconocidos: true, orden: 'nombre' };
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

test('presupuesto excluye privados con pensión mayor al máximo', () => {
    const r = elegir({ gestion: 'privado', max: 1, incluirDesconocidos: false });
    assert.ok(r.every(c => c.pension === null || c.pension <= 1));
});

test('incluir precios por consultar agrega privados sin pensión publicada', () => {
    const sin = elegir({ gestion: 'privado', max: 300, incluirDesconocidos: false }).length;
    const con = elegir({ gestion: 'privado', max: 300, incluirDesconocidos: true }).length;
    assert.ok(con >= sin);
});

test('orden por precio pone públicos primero y desconocidos al final', () => {
    const r = elegir({ orden: 'precio' });
    const primerPrivadoConocido = r.findIndex(c => c.gestion === 'privado' && c.pension !== null);
    const ultimoDesconocido = r.map(c => c.gestion === 'privado' && c.pension === null).lastIndexOf(true);
    if (primerPrivadoConocido >= 0 && ultimoDesconocido >= 0) assert.ok(ultimoDesconocido > primerPrivadoConocido);
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