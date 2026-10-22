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