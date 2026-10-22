// Ejecutar en la consola del navegador, en /carrito.html.
// Preparación: agregar al menos un videojuego al carrito.

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

  const antes = {
    almacenamiento: localStorage.getItem('pixelvault.cart.v1'),
    contenido: vista.innerHTML,
    contador: contador.textContent
  };

  const confirmacionOriginal = window.confirm;
  let solicitoConfirmacion = false;

  try {
    // Simula que el usuario pulsa Cancelar.
    window.confirm = () => {
      solicitoConfirmacion = true;
      return false;
    };

    boton.click();

    comprobar(solicitoConfirmacion, 'No se solicitó confirmación.');

    comprobar(
      localStorage.getItem('pixelvault.cart.v1') === antes.almacenamiento,
      'Cancelar modificó los productos o sus cantidades guardadas.'
    );

    comprobar(
      vista.innerHTML === antes.contenido,
      'Cancelar modificó la lista o el total mostrado.'
    );

    comprobar(
      contador.textContent === antes.contador,
      'Cancelar modificó el contador.'
    );

    console.log(
      'OK: cancelar conserva productos, cantidades, total y contador.'
    );
  } finally {
    window.confirm = confirmacionOriginal;
  }
})();