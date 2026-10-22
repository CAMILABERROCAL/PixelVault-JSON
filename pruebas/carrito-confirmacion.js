// Ejecutar en la consola del navegador, en /carrito.html.
// Preparación: agregar al menos un videojuego.
// Esta prueba vacía el carrito del navegador.

(() => {
  const comprobar = (condicion, mensaje) => {
    if (!condicion) {
      throw new Error(mensaje);
    }
  };

  const boton = document.querySelector('#clearCartBtn');
  const vista = document.querySelector('#cartView');
  const contador = document.querySelector('#cartCount');

  comprobar(boton && vista && contador, 'Abre la página del carrito.');
  comprobar(readCart().length > 0, 'Agrega un videojuego antes de probar.');
  comprobar(
    vista.querySelector('.cart-item'),
    'Espera a que los productos terminen de cargar.'
  );

  const confirmacionOriginal = window.confirm;
  let solicitoConfirmacion = false;

  try {
    // Simula que el usuario pulsa Aceptar.
    window.confirm = () => {
      solicitoConfirmacion = true;
      return true;
    };

    boton.click();

    comprobar(solicitoConfirmacion, 'No se solicitó confirmación.');

    comprobar(
      localStorage.getItem('pixelvault.cart.v1') === '[]',
      'No se guardó el carrito vacío.'
    );

    comprobar(
      contador.textContent.trim() === '0',
      'El contador no quedó en cero.'
    );

    comprobar(
      vista.querySelector('.cart-item') === null,
      'Todavía aparecen productos.'
    );

    comprobar(
      vista.querySelector('h2')?.textContent === 'Tu carrito está vacío',
      'No aparece el mensaje de carrito vacío.'
    );

    comprobar(
      vista.querySelector('.price')?.textContent === `Total: ${money(0)}`,
      'El total no se actualizó a cero.'
    );

    const aviso = document.querySelector('#toast');

    comprobar(
      aviso &&
      !aviso.hidden &&
      aviso.textContent === 'Carrito vaciado correctamente.',
      'No aparece el aviso de éxito.'
    );

    console.log(
      'OK: confirmar vacia el carrito, guarda el cambio y actualiza total y contador.'
    );
  } finally {
    window.confirm = confirmacionOriginal;
  }
})();