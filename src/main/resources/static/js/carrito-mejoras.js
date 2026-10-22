'use strict';

const clearCartButton = document.querySelector('#clearCartBtn');

if (clearCartButton) {
  clearCartButton.addEventListener('click', () => {
    if (readCart().length === 0) {
      toast('Tu carrito ya está vacío.');
      return;
    }

    try {
      saveCart([]);
      window.location.reload();
    } catch {
      toast('No se pudo vaciar el carrito. Inténtalo nuevamente.');
    }
  });
}