// Ejecutar en la consola del navegador, en /pedidos.html.
// Preparación: iniciar sesión con una cuenta que tenga al menos un pedido.

(async () => {
    const comprobar = (condicion, mensaje) => {
        if (!condicion) {
            throw new Error(mensaje);
        }
    };

    const boton = document.querySelector('[data-comprobante]');
    comprobar(boton, 'Abre Mis pedidos con al menos un pedido.');

    const pedido = pedidosPorId.get(boton.dataset.comprobante);
    comprobar(pedido, 'No se encontró el pedido del primer botón.');

    // 1. Contenido del texto.
    const texto = construirComprobante(pedido);

    comprobar(texto.includes(pedido.id), 'Falta el número de pedido.');
    comprobar(texto.includes(date(pedido.fecha)), 'Falta la fecha.');
    comprobar(
        texto.includes(pedido.metodo === 'YAPE_DEMO' ? 'Yape de prueba' : 'Tarjeta de prueba'),
        'Falta el método de pago.'
    );

    pedido.items.forEach((item) => {
        comprobar(texto.includes(item.titulo), `Falta el producto: ${item.titulo}.`);
        comprobar(
            texto.includes(`x ${item.cantidad}`),
            `Falta la cantidad de: ${item.titulo}.`
        );
    });

    comprobar(texto.includes(`TOTAL: ${money(pedido.total)}`), 'Falta el total.');
    comprobar(texto.includes('No es un comprobante fiscal'), 'Falta aviso fiscal.');
    comprobar(texto.includes('cobro real'), 'Falta aviso de cobro real.');

    // 2. Archivo descargado (sin guardar nada en el equipo).
    const crearUrlOriginal = URL.createObjectURL;
    const clickOriginal = HTMLAnchorElement.prototype.click;
    let archivo = null;
    let nombre = null;

    try {
        URL.createObjectURL = (blob) => {
            archivo = blob;
            return 'blob:prueba';
        };
        HTMLAnchorElement.prototype.click = function () {
            nombre = this.download;
        };

        boton.click();

        comprobar(archivo, 'El botón no generó ningún archivo.');
        comprobar(archivo.type.startsWith('text/plain'), 'El archivo no es de texto plano.');
        comprobar(
            /^comprobante-pixelvault-.+\.txt$/.test(nombre),
            'El nombre del archivo no es válido.'
        );
        comprobar(
            (await archivo.text()).includes(texto),
            'El archivo no contiene el comprobante.'
        );
    } finally {
        URL.createObjectURL = crearUrlOriginal;
        HTMLAnchorElement.prototype.click = clickOriginal;
    }

    console.log(`OK: el comprobante (${nombre}) incluye todos los datos y avisos.`);
})();