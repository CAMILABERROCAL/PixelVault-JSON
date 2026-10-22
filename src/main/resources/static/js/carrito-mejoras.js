'use strict';

const clearCartButton = document.querySelector('#clearCartBtn');

if (clearCartButton) {
  clearCartButton.addEventListener('click', () => {
    if (readCart().length === 0) {
      toast('Tu carrito ya está vacío.');
      return;
    }

    const confirmed = window.confirm(
      '¿Seguro que deseas vaciar el carrito? Se eliminarán todos los productos.'
    );

    if (!confirmed) {
      return;
    }

    try {
      saveCart([]);
    } catch {
      toast('No se pudo vaciar el carrito. Inténtalo nuevamente.');
      return;
    }

    notice('#cartError', '');

    document.querySelector('#cartView').innerHTML = `
      <div class="empty">
        <div class="eyebrow">Una nueva partida te espera</div>
        <h2>Tu carrito está vacío</h2>
        <p>Eliminaste todos los productos de tu selección.</p>
        <p class="price">Total: ${money(0)}</p>
        <a class="btn primary" href="/index.html#catalogo">
          Descubrir videojuegos
        </a>
      </div>
    `;

    toast('Carrito vaciado correctamente.');
  });
}