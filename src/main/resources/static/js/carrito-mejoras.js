'use strict';

const clearCartButton = document.querySelector('#clearCartBtn');

if (clearCartButton) {
  clearCartButton.addEventListener('click', () => {
    if (readCart().length === 0) {
      toast('Tu selección ya está vacía.');
      return;
    }

    const confirmed = window.confirm(
      '¿Quieres vaciar tu selección? Se quitarán todos los libros seleccionados.'
    );

    if (!confirmed) return;

    try {
      saveCart([]);
    } catch {
      toast('No se pudo vaciar la selección. Inténtalo nuevamente.');
      return;
    }

    notice('#cartError', '');

    document.querySelector('#cartView').dispatchEvent(
      new Event('seleccion-vaciada')
    );

    toast('Selección vaciada correctamente.');
  });
}