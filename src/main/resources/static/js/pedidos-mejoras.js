'use strict';

// Arma el texto del comprobante de demostración de un pedido.
// Usa money() y date() de script.js para mostrar los mismos formatos que la página.
function construirComprobante(pedido) {
    const metodos = {
        TARJETA_DEMO: 'Tarjeta de prueba',
        YAPE_DEMO: 'Yape de prueba'
    };

    const lineas = (pedido.items || []).map((item) => {
        const subtotal = Number(item.precio) * item.cantidad;
        return `- ${item.titulo} x ${item.cantidad}   ${money(subtotal)}`;
    });

    return [
        'PIXELVAULT - COMPROBANTE DE DEMOSTRACIÓN',
        '========================================',
        `Pedido: ${pedido.id}`,
        `Fecha: ${date(pedido.fecha)}`,
        `Cliente: ${pedido.usuario}`,
        `Método de pago: ${metodos[pedido.metodo] || pedido.metodo}`,
        '',
        'Detalle de la compra:',
        ...lineas,
        '',
        `TOTAL: ${money(pedido.total)}`,
        '',
        'Documento de demostración académica.',
        'No es un comprobante fiscal, no representa un cobro real',
        'ni una licencia activable.'
    ].join('\n');
}

// Guarda los pedidos mostrados para poder generar su comprobante al pulsar el botón.
const pedidosPorId = new Map();

// Descarga el comprobante como archivo TXT (con BOM para que Windows respete los acentos).
function descargarComprobante(pedido) {
    const texto = construirComprobante(pedido);
    const archivo = new Blob(['\uFEFF' + texto], { type: 'text/plain;charset=utf-8' });
    const enlace = document.createElement('a');

    enlace.href = URL.createObjectURL(archivo);
    enlace.download = `comprobante-pixelvault-${pedido.id.slice(0, 8)}.txt`;
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    URL.revokeObjectURL(enlace.href);

    toast('Comprobante descargado.');
}

// Agrega el botón de descarga al final de cada pedido de "Mis pedidos".
const orderMarkupOriginal = orderMarkup;

window.orderMarkup = (pedido, admin = false) => {
    const html = orderMarkupOriginal(pedido, admin);

    if (admin) {
        return html;
    }

    pedidosPorId.set(pedido.id, pedido);

    return html.replace(
        /<\/article>\s*$/,
        `<div class="actions" style="margin-top:16px">
      <button type="button" class="small ghost" data-comprobante="${esc(pedido.id)}">
        Descargar comprobante (TXT)
      </button>
    </div></article>`
    );
};

document.addEventListener('click', (evento) => {
    const boton = evento.target.closest('[data-comprobante]');

    if (!boton) {
        return;
    }

    const pedido = pedidosPorId.get(boton.dataset.comprobante);

    if (!pedido) {
        toast('No se encontró el pedido. Recarga la página.');
        return;
    }

    descargarComprobante(pedido);
});