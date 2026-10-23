const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const codigo = fs.readFileSync(
  path.join(
    __dirname,
    '../src/main/resources/static/js/carrito-mejoras.js'
  ),
  'utf8'
);

function preparar({
  aceptar = false,
  vacia = false,
  errorGuardar = false
} = {}) {
  const inicial = vacia
    ? []
    : [
        { videojuegoId: 1, cantidad: 2 },
        { videojuegoId: 2, cantidad: 1 }
      ];

  const estado = {
    seleccion: structuredClone(inicial),
    confirmaciones: 0,
    guardados: 0,
    eventos: [],
    mensajes: [],
    avisos: []
  };

  let alHacerClick;

  const boton = {
    addEventListener(tipo, callback) {
      assert.equal(tipo, 'click');
      alHacerClick = callback;
    }
  };

  const vista = {
    dispatchEvent(evento) {
      estado.eventos.push(evento.type);
      return true;
    }
  };

  vm.runInNewContext(codigo, {
    document: {
      querySelector(selector) {
        if (selector === '#clearCartBtn') return boton;
        if (selector === '#cartView') return vista;
        return null;
      }
    },
    window: {
      confirm() {
        estado.confirmaciones++;
        return aceptar;
      }
    },
    Event: class {
      constructor(type) {
        this.type = type;
      }
    },
    readCart() {
      return structuredClone(estado.seleccion);
    },
    saveCart(items) {
      estado.guardados++;

      if (errorGuardar) {
        throw new Error('Almacenamiento no disponible');
      }

      estado.seleccion = JSON.parse(JSON.stringify(items));
    },
    toast(mensaje) {
      estado.mensajes.push(mensaje);
    },
    notice(selector, mensaje) {
      estado.avisos.push({ selector, mensaje });
    }
  }, { filename: 'carrito-mejoras.js' });

  assert.equal(
    typeof alHacerClick,
    'function',
    'El botón debe tener un evento click'
  );

  return {
    estado,
    inicial,
    pulsar: () => alHacerClick()
  };
}

test('Cancelar conserva los libros y sus cantidades', () => {
  const prueba = preparar({ aceptar: false });

  prueba.pulsar();

  assert.equal(prueba.estado.confirmaciones, 1);
  assert.deepEqual(prueba.estado.seleccion, prueba.inicial);
  assert.equal(prueba.estado.guardados, 0);
  assert.deepEqual(prueba.estado.eventos, []);
  assert.deepEqual(prueba.estado.avisos, []);
  assert.deepEqual(prueba.estado.mensajes, []);
});

test('Aceptar vacía la selección y solicita actualizar la vista', () => {
  const prueba = preparar({ aceptar: true });

  prueba.pulsar();

  assert.equal(prueba.estado.confirmaciones, 1);
  assert.equal(prueba.estado.guardados, 1);
  assert.deepEqual(prueba.estado.seleccion, []);
  assert.deepEqual(
    prueba.estado.eventos,
    ['seleccion-vaciada']
  );
  assert.deepEqual(prueba.estado.avisos, [
    { selector: '#cartError', mensaje: '' }
  ]);
  assert.deepEqual(prueba.estado.mensajes, [
    'Selección vaciada correctamente.'
  ]);
});

test('Una selección vacía no pide confirmación ni guarda', () => {
  const prueba = preparar({ vacia: true });

  prueba.pulsar();

  assert.equal(prueba.estado.confirmaciones, 0);
  assert.equal(prueba.estado.guardados, 0);
  assert.deepEqual(prueba.estado.eventos, []);
  assert.deepEqual(prueba.estado.mensajes, [
    'Tu selección ya está vacía.'
  ]);
});

test('Si falla el guardado, informa el error y no anuncia éxito', () => {
  const prueba = preparar({
    aceptar: true,
    errorGuardar: true
  });

  prueba.pulsar();

  assert.equal(prueba.estado.guardados, 1);
  assert.deepEqual(prueba.estado.seleccion, prueba.inicial);
  assert.deepEqual(prueba.estado.eventos, []);
  assert.deepEqual(prueba.estado.avisos, []);
  assert.deepEqual(prueba.estado.mensajes, [
    'No se pudo vaciar la selección. Inténtalo nuevamente.'
  ]);
});