'use strict';

const ayudaMetodos = {
    TARJETA_DEMO:
        'Tarjeta de prueba: simula un pago con tarjeta. No se te pide ningún dato de tarjeta; el sistema solo registra el resultado del escenario que elijas.',
    YAPE_DEMO:
        'Yape de prueba: simula un pago con Yape. No se abre la aplicación ni se transfiere dinero; solo se registra el resultado del escenario que elijas.'
};

const ayudaEscenarios = {
    APROBADO:
        'Aprobado: el pedido se registra, se descuenta el stock y podrás verlo en "Mis pedidos".',
    RECHAZADO:
        'Rechazado: no se registra el pedido ni se descuenta el stock. Puedes intentarlo de nuevo o volver al carrito.'
};

// Muestra una explicación breve del método y del escenario elegidos.
function agregarAyudaDePago() {
    const opciones = document.querySelector('.pay-options');
    const escenario = document.querySelector('#outcome');

    if (!opciones || !escenario || document.querySelector('#ayudaMetodo')) {
        return;
    }

    const ayudaMetodo = document.createElement('p');
    ayudaMetodo.id = 'ayudaMetodo';
    ayudaMetodo.className = 'tiny muted';
    ayudaMetodo.setAttribute('aria-live', 'polite');
    opciones.after(ayudaMetodo);

    const ayudaEscenario = document.createElement('p');
    ayudaEscenario.id = 'ayudaEscenario';
    ayudaEscenario.className = 'tiny muted';
    ayudaEscenario.setAttribute('aria-live', 'polite');
    escenario.after(ayudaEscenario);

    const actualizar = () => {
        const metodo = document.querySelector('input[name="metodo"]:checked');
        ayudaMetodo.textContent = ayudaMetodos[metodo?.value] || '';
        ayudaEscenario.textContent = ayudaEscenarios[escenario.value] || '';
    };

    opciones.addEventListener('change', actualizar);
    escenario.addEventListener('change', actualizar);
    actualizar();
}

// La pantalla de pago se dibuja después de consultar la API, por eso se observa el contenedor.
new MutationObserver(agregarAyudaDePago).observe(
    document.querySelector('#paymentView'),
    { childList: true, subtree: true }
);

agregarAyudaDePago();

// Enlace para volver al carrito y cambiar la selección antes de pagar.
function agregarVolverAlCarrito() {
    const boton = document.querySelector('#payButton');

    if (!boton || document.querySelector('#volverCarritoPago')) {
        return;
    }

    const enlace = document.createElement('a');
    enlace.id = 'volverCarritoPago';
    enlace.className = 'btn full';
    enlace.href = '/carrito.html';
    enlace.textContent = '← Volver al carrito para cambiar mi selección';
    enlace.style.marginTop = '10px';
    boton.after(enlace);
}

// Tras un pago rechazado (o cualquier error), ofrece volver al carrito desde el mensaje.
function agregarVolverTrasError() {
    const aviso = document.querySelector('#paymentError .notice.error');

    if (!aviso || aviso.querySelector('#volverCarritoError')) {
        return;
    }

    const enlace = document.createElement('a');
    enlace.id = 'volverCarritoError';
    enlace.className = 'btn small';
    enlace.href = '/carrito.html';
    enlace.textContent = 'Volver al carrito';
    enlace.style.marginTop = '10px';
    aviso.append(' ', enlace);
}

new MutationObserver(agregarVolverAlCarrito).observe(
    document.querySelector('#paymentView'),
    { childList: true, subtree: true }
);

new MutationObserver(agregarVolverTrasError).observe(
    document.querySelector('#paymentError'),
    { childList: true }
);

agregarVolverAlCarrito();