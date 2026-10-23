'use strict';

const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}[c]));

const money = n => new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'PEN'
}).format(Number(n));

const image = p => (
  typeof p === 'string' &&
  (p.startsWith('/img/') || p.startsWith('https://'))
) ? p : '/img/placeholder.svg';

const date = d => new Date(d).toLocaleString('es-PE');

// Se conserva temporalmente para compartir la selección con el catálogo actual.
const CART = 'pixelvault.cart.v1';

let me = { autenticado: false };
let products = [];
let toastTimer;

function readCart() {
  try {
    const value = JSON.parse(localStorage.getItem(CART) || '[]');

    return Array.isArray(value)
      ? value.filter(item =>
          Number.isSafeInteger(item.videojuegoId) &&
          item.videojuegoId > 0 &&
          Number.isInteger(item.cantidad) &&
          item.cantidad > 0 &&
          item.cantidad <= 99
        ).slice(0, 50)
      : [];
  } catch {
    return [];
  }
}

function saveCart(items) {
  localStorage.setItem(CART, JSON.stringify(items));
  updateCount();
}

function updateCount() {
  $('#cartCount').textContent = readCart().reduce(
    (total, item) => total + item.cantidad,
    0
  );
}

function toast(text) {
  clearTimeout(toastTimer);
  $('#toast').textContent = text;
  $('#toast').hidden = false;
  toastTimer = setTimeout(() => {
    $('#toast').hidden = true;
  }, 3500);
}

function notice(selector, text, type = 'error') {
  const element = $(selector);

  if (element) {
    element.innerHTML = text
      ? `<div class="notice ${type}">${esc(text)}</div>`
      : '';
  }
}

async function api(url, options = {}) {
  const headers = new Headers(options.headers || {});

  if (options.body && !(options.body instanceof URLSearchParams)) {
    headers.set('Content-Type', 'application/json');
  }

  if (options.method && !['GET', 'HEAD'].includes(options.method)) {
    const response = await fetch('/api/csrf', {
      credentials: 'same-origin'
    });

    if (!response.ok) {
      throw new Error(
        'No se pudo preparar la solicitud. Recarga la página.'
      );
    }

    const csrf = await response.json();
    headers.set(csrf.headerName, csrf.token);
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'same-origin'
  });

  const data = response.status === 204
    ? null
    : await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(
      data?.mensaje || 'No se pudo completar la solicitud.'
    );
    error.status = response.status;
    throw error;
  }

  return data;
}

function bindImages(parent = document) {
  parent.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', () => {
      img.src = '/img/placeholder.svg';
    }, { once: true });
  });
}

async function nav() {
  me = await api('/api/me');

  $('#userName').textContent = me.autenticado
    ? `Hola, ${me.nombre}`
    : '';

  $('#logoutBtn').hidden = !me.autenticado;
  $('#ordersLink').hidden = !me.autenticado;

  if (me.rol === 'ADMIN') {
    $('#adminLink').href = '/admin.html';
  }

  $('#logoutBtn').onclick = async () => {
    try {
      await api('/logout', { method: 'POST' });
      location.href = '/index.html';
    } catch (error) {
      toast(error.message);
    }
  };

  updateCount();
}

function addToCart(id) {
  const game = products.find(product => product.id === id);
  if (!game || game.stock < 1) return;

  const cart = readCart();
  const item = cart.find(entry => entry.videojuegoId === id);

  if (item) {
    if (item.cantidad >= Math.min(game.stock, 99)) {
      toast('Llegaste al stock disponible.');
      return;
    }
    item.cantidad++;
  } else {
    if (cart.length >= 50) {
      toast('Máximo 50 títulos por carrito.');
      return;
    }
    cart.push({ videojuegoId: id, cantidad: 1 });
  }

  try {
    saveCart(cart);
    toast('Agregado a tu selección');
  } catch {
    toast(
      'No se pudo guardar el carrito. Permite el almacenamiento del navegador.'
    );
  }
}

async function catalog() {
  products = await api('/api/videojuegos');

  [...new Set(products.map(product => product.genero))]
    .sort()
    .forEach(genre => {
      $('#genre').add(new Option(genre, genre));
    });

  function render() {
    const query = $('#search').value.toLocaleLowerCase();
    const genre = $('#genre').value;

    const list = products.filter(product =>
      (!genre || product.genero === genre) &&
      `${product.titulo} ${product.autor || product.plataforma}`
        .toLocaleLowerCase()
        .includes(query)
    );

    list.sort(
      $('#sort').value === 'stockDesc'
        ? (a, b) => b.stock - a.stock
        : $('#sort').value === 'priceDesc'
          ? (a, b) => b.precio - a.precio
          : (a, b) => a.titulo.localeCompare(b.titulo)
    );

    $('#catalogCount').textContent =
      `${list.length} títulos en el catálogo`;

    $('#games').innerHTML = list.map(product => `
      <article class="card">
        <img
          class="cover"
          src="${esc(image(product.imagenUrl))}"
          alt="Portada de ${esc(product.titulo)}"
        >
        <div class="card-content">
          <div class="row">
            <span class="pill">${esc(product.genero)}</span>
            <span class="tiny muted">${esc(product.plataforma)}</span>
          </div>
          <h3>${esc(product.titulo)}</h3>
          <div class="row">
            <span class="tiny muted">Biblioteca escolar</span>
            <span class="stock ${
              product.stock === 0 ? 'out' : product.stock <= 5 ? 'low' : ''
            }">
              ${product.stock === 0
                ? 'Agotado'
                : `${product.stock} disponibles`}
            </span>
          </div>
          <div class="actions">
            <button
              class="primary"
              data-add="${product.id}"
              ${!product.stock ? 'disabled' : ''}
            >
              + Seleccionar
            </button>
            <button
              class="ghost"
              data-detail="${product.id}"
              aria-label="Ver detalle de ${esc(product.titulo)}"
            >
              Detalle
            </button>
          </div>
        </div>
      </article>
    `).join('') || `
      <div class="empty">
        <h2>Sin coincidencias</h2>
        <p>Prueba con otro título o género.</p>
      </div>
    `;

    bindImages($('#games'));
  }

  ['search', 'genre', 'sort'].forEach(id => {
    $('#' + id).addEventListener('input', render);
  });

  $('#games').onclick = event => {
    const add = event.target.closest('[data-add]');
    const detail = event.target.closest('[data-detail]');

    if (add) {
      addToCart(Number(add.dataset.add));
    }

    if (detail) {
      const product = products.find(
        item => item.id === Number(detail.dataset.detail)
      );

      $('#detailContent').innerHTML = `
        <img
          src="${esc(image(product.imagenUrl))}"
          alt="${esc(product.titulo)}"
        >
        <span class="pill">${esc(product.plataforma)}</span>
        <h2 style="margin-top:18px">${esc(product.titulo)}</h2>
        <p class="muted">
          ${esc(
            product.descripcion ||
            'Descubre una nueva historia en nuestra biblioteca.'
          )}
        </p>
        <p class="stock">${product.stock} ejemplares disponibles</p>
        <button
          class="primary"
          id="detailAdd"
          ${!product.stock ? 'disabled' : ''}
        >
          Seleccionar libro
        </button>
      `;

      bindImages($('#detailContent'));
      $('#detailAdd').onclick = () => addToCart(product.id);
      $('#details').showModal();
    }
  };

  $('#closeDetails').onclick = () => $('#details').close();
  render();
}

function cartDetails() {
  return readCart().map(item => ({
    ...item,
    game: products.find(product => product.id === item.videojuegoId)
  }));
}

function totals(items) {
  return items.reduce(
    (total, item) =>
      total + (item.game ? item.game.precio * item.cantidad : 0),
    0
  );
}

function validCart(items) {
  return items.length > 0 && items.every(item =>
    item.game &&
    item.game.activo &&
    item.game.stock >= item.cantidad
  );
}

function summary(items, button) {
  return `
    <aside class="panel summary">
      <h2>Resumen</h2>
      <div class="row">
        <span class="muted">Unidades</span>
        <span>${items.reduce((total, item) => total + item.cantidad, 0)}</span>
      </div>
      <div class="row">
        <span class="muted">Subtotal</span>
        <span>${money(totals(items))}</span>
      </div>
      <div class="row">
        <span class="muted">Costos adicionales</span>
        <span>${money(0)}</span>
      </div>
      <div class="row total">
        <span>Total</span>
        <span>${money(totals(items))}</span>
      </div>
      ${button}
      <p class="tiny muted" style="margin-top:16px">
        Demostración académica. No se realiza ningún cobro real.
      </p>
    </aside>
  `;
}

// Selección de libros de AulaLibro.
async function cartPage() {
  products = await api('/api/videojuegos');
  const vista = $('#cartView');

  function render() {
    const items = cartDetails();

    if (!items.length) {
      vista.innerHTML = `
        <div class="empty">
          <div class="eyebrow">Una nueva lectura te espera</div>
          <h2>Tu selección está vacía</h2>
          <p>Explora el catálogo y selecciona los libros que necesitas.</p>
          <a class="btn primary" href="/index.html#catalogo">
            Explorar catálogo
          </a>
        </div>
      `;
      return;
    }

    const cantidad = items.reduce(
      (total, item) => total + item.cantidad,
      0
    );

    vista.innerHTML = `
      <div class="split">
        <section class="panel" aria-label="Libros seleccionados">
          ${items.map(item => `
            <article class="cart-item">
              <img
                src="${esc(image(item.game?.imagenUrl))}"
                alt="Portada de ${esc(
                  item.game?.titulo || 'libro no disponible'
                )}"
              >
              <div>
                <h3>${esc(item.game?.titulo || 'Libro no disponible')}</h3>
                <p class="muted tiny">${esc(item.game?.autor || '')}</p>
                <div class="qty">
                  <label for="qty-${item.videojuegoId}">
                    Ejemplares
                  </label>
                  <input
                    id="qty-${item.videojuegoId}"
                    type="number"
                    min="1"
                    max="99"
                    value="${item.cantidad}"
                    data-qty="${item.videojuegoId}"
                  >
                  <button
                    type="button"
                    class="small ghost danger"
                    data-remove="${item.videojuegoId}"
                    aria-label="Quitar ${esc(item.game?.titulo || 'libro')}"
                  >
                    Quitar
                  </button>
                </div>
                ${!item.game || !item.game.activo
                  ? '<p class="stock out">Libro no disponible. Retíralo para continuar.</p>'
                  : item.cantidad > item.game.stock
                    ? `<p class="stock out">Ejemplares disponibles: ${item.game.stock}. Ajusta la cantidad.</p>`
                    : ''}
              </div>
            </article>
          `).join('')}

          <a class="btn ghost small" href="/index.html#catalogo">
            Seguir seleccionando libros
          </a>
        </section>

        <aside class="panel summary">
          <h2>Resumen de la selección</h2>
          <div class="row">
            <span>Títulos seleccionados</span>
            <strong>${items.length}</strong>
          </div>
          <div class="row">
            <span>Total de ejemplares</span>
            <strong>${cantidad}</strong>
          </div>
          <button
            id="checkout"
            type="button"
            class="primary full"
            style="margin-top:18px"
            ${validCart(items) ? '' : 'disabled'}
          >
            Continuar →
          </button>
          ${!me.autenticado
            ? '<p class="tiny muted">Inicia sesión en el siguiente paso para continuar.</p>'
            : ''}
        </aside>
      </div>
    `;

    bindImages(vista);

    // Ruta temporal hasta integrar la pantalla de préstamos.
    $('#checkout').onclick = () => {
      location.href = me.autenticado
        ? '/pago.html'
        : '/login.html?next=pagar';
    };
  }

  function guardarSeleccion(items) {
    try {
      saveCart(items);
    } catch {
      notice(
        '#cartError',
        'No se pudo guardar la selección. Revisa el almacenamiento del navegador.'
      );
      render();
      return false;
    }

    notice('#cartError', '');
    render();
    return true;
  }

  vista.onclick = event => {
    const boton = event.target.closest('[data-remove]');
    if (!boton) return;

    const id = Number(boton.dataset.remove);
    const seleccion = readCart().filter(
      item => item.videojuegoId !== id
    );

    if (guardarSeleccion(seleccion)) {
      toast('Libro retirado de la selección.');
    }
  };

  vista.onchange = event => {
    if (!event.target.matches('[data-qty]')) return;

    const cantidad = Number(event.target.value);

    if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > 99) {
      toast('La cantidad debe estar entre 1 y 99.');
      render();
      return;
    }

    const id = Number(event.target.dataset.qty);

    guardarSeleccion(
      readCart().map(item =>
        item.videojuegoId === id
          ? { ...item, cantidad }
          : item
      )
    );
  };

  vista.addEventListener('seleccion-vaciada', render);
  render();
}

function nextTarget() {
  const next = new URLSearchParams(location.search).get('next');
  return ['pagar', 'admin', 'pedidos'].includes(next) ? next : '';
}

function afterLogin() {
  const next = nextTarget();

  if (next === 'pagar') return '/pago.html';
  if (next === 'pedidos') return '/pedidos.html';
  if (me.rol === 'ADMIN') return '/admin.html';

  return '/index.html';
}

async function authPage(register = false) {
  const next = nextTarget();
  const query = next ? '?next=' + next : '';

  if (me.autenticado && !register) {
    if (next === 'admin' && me.rol !== 'ADMIN') {
      notice(
        '#authMessage',
        'Tu cuenta es de cliente. Usa una cuenta administradora para entrar al panel.'
      );
      return;
    }

    location.replace(afterLogin());
    return;
  }

  if (register) {
    $('#loginLink').href = '/login.html' + query;
  } else {
    $('#registerLink').href = '/registro.html' + query;
  }

  const form = $(register ? '#registerForm' : '#loginForm');

  form.onsubmit = async event => {
    event.preventDefault();

    const button = form.querySelector('button:not(.pass-toggle)');
    button.disabled = true;
    notice('#authMessage', '');

    try {
      const data = Object.fromEntries(new FormData(form));
      data.correo = data.correo.trim().toLowerCase();

      if (register) {
        await api('/api/auth/registro', {
          method: 'POST',
          body: JSON.stringify(data)
        });

        location.href =
          '/login.html' + (query ? query + '&' : '?') + 'creada=1';
      } else {
        await api('/procesar-login', {
          method: 'POST',
          body: new URLSearchParams(data)
        });

        me = await api('/api/me');

        if (next === 'admin' && me.rol !== 'ADMIN') {
          await nav();
          notice(
            '#authMessage',
            'Accediste como cliente. El panel requiere una cuenta administradora.'
          );
          return;
        }

        location.href = afterLogin();
      }
    } catch (error) {
      notice('#authMessage', error.message);
    } finally {
      button.disabled = false;
    }
  };

  if (
    !register &&
    new URLSearchParams(location.search).has('creada')
  ) {
    notice(
      '#authMessage',
      'Cuenta creada. Inicia sesión para continuar.',
      'success'
    );
  }
}

async function payment() {
  if (!me.autenticado) {
    location.replace('/login.html?next=pagar');
    return;
  }

  products = await api('/api/videojuegos');
  const items = cartDetails();

  if (!validCart(items)) {
    $('#paymentView').innerHTML = `
      <div class="empty">
        <h2>Revisa tu carrito</h2>
        <p>Está vacío o cambió la disponibilidad de un juego.</p>
        <a class="btn primary" href="/carrito.html">Volver al carrito</a>
      </div>
    `;
    return;
  }

  $('#paymentView').innerHTML = `
    <div class="split">
      <section class="panel">
        <span class="pill">PASARELA DE DEMOSTRACIÓN</span>
        <h2 style="margin-top:20px">Elige un método de prueba</h2>
        <p class="muted">
          Comprando como <strong>${esc(me.correo)}</strong>
        </p>
        <div class="notice">
          Este pago es simulado. No ingreses números de tarjeta,
          CVV ni datos bancarios reales.
        </div>
        <form id="payForm">
          <div class="pay-options">
            <label class="pay-option">
              <input
                type="radio"
                name="metodo"
                value="TARJETA_DEMO"
                checked
              >
              <span>▣ Tarjeta de prueba</span>
            </label>
            <label class="pay-option">
              <input type="radio" name="metodo" value="YAPE_DEMO">
              <span>◈ Yape de prueba</span>
            </label>
          </div>

          <label for="outcome">Escenario de la simulación</label>
          <select id="outcome" name="resultado">
            <option value="APROBADO">Pago aprobado</option>
            <option value="RECHAZADO">Pago rechazado (para probar)</option>
          </select>

          <label class="pay-option" style="margin-top:20px">
            <input type="checkbox" required>
            <span class="tiny">
              Entiendo que es una compra de demostración
              y no habrá cargos reales.
            </span>
          </label>

          <button class="primary full" id="payButton" style="margin-top:15px">
            Confirmar pago simulado · ${money(totals(items))}
          </button>
        </form>
      </section>

      ${summary(
        items,
        items.map(item => `
          <p class="tiny">${esc(item.game.titulo)} × ${item.cantidad}</p>
        `).join('')
      )}
    </div>
  `;

  $('#payForm').onsubmit = async event => {
    event.preventDefault();

    const button = $('#payButton');
    button.disabled = true;
    button.textContent = 'Procesando…';
    notice('#paymentError', '');

    try {
      const lines = readCart();
      const signature = JSON.stringify(lines);
      let key = sessionStorage.getItem('pixelvault.pay.key');

      if (
        !key ||
        sessionStorage.getItem('pixelvault.pay.cart') !== signature
      ) {
        key = crypto.randomUUID();
        sessionStorage.setItem('pixelvault.pay.key', key);
        sessionStorage.setItem('pixelvault.pay.cart', signature);
      }

      const form = Object.fromEntries(new FormData(event.target));

      const order = await api('/api/pedidos', {
        method: 'POST',
        body: JSON.stringify({
          items: lines,
          metodo: form.metodo,
          resultado: form.resultado,
          clave: key
        })
      });

      saveCart([]);
      sessionStorage.removeItem('pixelvault.pay.key');
      sessionStorage.removeItem('pixelvault.pay.cart');
      location.href = '/pedidos.html?pedido=' + encodeURIComponent(order.id);
    } catch (error) {
      notice('#paymentError', error.message);

      if (error.status === 401) {
        location.href = '/login.html?next=pagar';
        return;
      }

      if (error.status === 409) {
        notice(
          '#paymentError',
          error.message + ' Vuelve al carrito para actualizar la disponibilidad.'
        );
      }
    } finally {
      button.disabled = false;
      button.textContent =
        'Confirmar pago simulado · ' + money(totals(items));
    }
  };
}

function orderMarkup(order, admin = false) {
  const focus = new URLSearchParams(location.search).get('pedido') === order.id;

  return `
    <article class="panel ${focus ? 'focus-order' : ''}">
      ${focus ? `
        <div class="notice success">
          ¡Compra de demostración confirmada! Tu pedido quedó registrado.
        </div>
      ` : ''}

      <div class="order-head">
        <div>
          <div class="eyebrow">Pedido ${esc(order.id.slice(0, 8))}</div>
          <h3>${esc(date(order.fecha))}</h3>
          ${admin ? `<p class="muted tiny">${esc(order.usuario)}</p>` : ''}
        </div>
        <div>
          <span class="pill">Pagado · simulación</span>
          <p class="price" style="margin-top:10px;margin-bottom:0">
            ${money(order.total)}
          </p>
        </div>
      </div>

      <div class="order-lines">
        ${order.items.map(item => `
          <div class="row">
            <span>${esc(item.titulo)} × ${item.cantidad}</span>
            <span>${money(item.precio * item.cantidad)}</span>
          </div>
        `).join('')}
      </div>

      <p class="tiny muted" style="margin-bottom:0">
        ${order.metodo === 'YAPE_DEMO' ? 'Yape' : 'Tarjeta'} de prueba ·
        No constituye un cobro real ni una licencia activable.
      </p>
    </article>
  `;
}

async function ordersPage() {
  if (!me.autenticado) {
    location.replace('/login.html?next=pedidos');
    return;
  }

  const orders = await api('/api/pedidos');

  $('#orders').innerHTML = orders.map(order => orderMarkup(order)).join('') || `
    <div class="empty">
      <h2>Todavía no tienes pedidos</h2>
      <p>Tu primera aventura te espera en el catálogo.</p>
    </div>
  `;
}

async function adminPage() {
  if (!me.autenticado) {
    location.replace('/login.html?next=admin');
    return;
  }

  if (me.rol !== 'ADMIN') {
    $('main').innerHTML = `
      <div class="empty">
        <h1>Acceso exclusivo de administración</h1>
        <a class="btn primary" href="/index.html">Ir al catálogo</a>
      </div>
    `;
    return;
  }

  let orders = [];

  async function render() {
    products = await api('/api/videojuegos');
    orders = await api('/api/admin/pedidos');

    $('#metrics').innerHTML = `
      <div class="panel">
        <span class="muted tiny">Videojuegos</span>
        <strong>${products.length}</strong>
      </div>
      <div class="panel">
        <span class="muted tiny">Unidades en stock</span>
        <strong>${products.reduce((total, product) => total + product.stock, 0)}</strong>
      </div>
      <div class="panel">
        <span class="muted tiny">Ventas simuladas</span>
        <strong>${money(orders.reduce((total, order) => total + order.total, 0))}</strong>
      </div>
    `;

    $('#inventory').innerHTML = products.map(product => `
      <tr>
        <td>
          <strong>${esc(product.titulo)}</strong><br>
          <span class="tiny muted">${esc(product.genero)}</span>
        </td>
        <td>${esc(product.plataforma)}</td>
        <td>${money(product.precio)}</td>
        <td>${product.stock}</td>
        <td>${product.activo ? 'Publicado' : 'Oculto'}</td>
        <td>
          <div class="actions">
            <button class="small" data-edit="${product.id}">Editar</button>
            <button class="small ghost danger" data-delete="${product.id}">
              Eliminar
            </button>
          </div>
        </td>
      </tr>
    `).join('') || `
      <tr>
        <td colspan="6">No hay videojuegos. Agrega el primero.</td>
      </tr>
    `;

    $('#adminOrders').innerHTML =
      orders.map(order => orderMarkup(order, true)).join('') ||
      '<p class="muted">Todavía no hay pedidos.</p>';
  }

  const form = $('#productForm');

  function open(product) {
    form.reset();
    form.elements.id.value = product?.id || '';

    for (const key of [
      'titulo',
      'descripcion',
      'genero',
      'plataforma',
      'precio',
      'stock',
      'imagenUrl'
    ]) {
      form.elements[key].value = product?.[key] ?? '';
    }

    form.elements.activo.value = String(product?.activo ?? true);
    $('#productTitle').textContent = product
      ? 'Editar videojuego'
      : 'Nuevo videojuego';

    notice('#productError', '');
    $('#productDialog').showModal();
  }

  $('#newProduct').onclick = () => open(null);
  $('#closeProduct').onclick = () => $('#productDialog').close();

  $('#inventory').onclick = async event => {
    const edit = event.target.closest('[data-edit]');
    const remove = event.target.closest('[data-delete]');

    if (edit) {
      open(products.find(product => product.id === Number(edit.dataset.edit)));
    }

    if (remove) {
      if (!confirm(
        '¿Eliminar el videojuego? Los pedidos anteriores se conservarán.'
      )) {
        return;
      }

      remove.disabled = true;

      try {
        await api('/api/videojuegos/' + remove.dataset.delete, {
          method: 'DELETE'
        });

        await render();
        toast('Videojuego eliminado.');
      } catch (error) {
        notice('#adminError', error.message);
      } finally {
        remove.disabled = false;
      }
    }
  };

  form.onsubmit = async event => {
    event.preventDefault();

    const button = form.querySelector('button');
    button.disabled = true;
    notice('#productError', '');

    try {
      const data = Object.fromEntries(new FormData(form));
      const id = data.id;
      delete data.id;

      data.precio = Number(data.precio);
      data.stock = Number(data.stock);
      data.activo = data.activo === 'true';

      await api('/api/videojuegos' + (id ? '/' + id : ''), {
        method: id ? 'PUT' : 'POST',
        body: JSON.stringify(data)
      });

      $('#productDialog').close();
      await render();
      toast('Videojuego guardado.');
    } catch (error) {
      notice('#productError', error.message);
    } finally {
      button.disabled = false;
    }
  };

  await render();
}

(async () => {
  try {
    await nav();

    const page = document.body.dataset.page;

    if (page === 'catalog') await catalog();
    if (page === 'cart') await cartPage();
    if (page === 'login') await authPage();
    if (page === 'register') await authPage(true);
    if (page === 'payment') await payment();
    if (page === 'orders') await ordersPage();
    if (page === 'admin') await adminPage();
  } catch (error) {
    const selectors = {
      catalog: '#catalogError',
      cart: '#cartError',
      payment: '#paymentError',
      admin: '#adminError',
      orders: '#orders',
      login: '#authMessage',
      register: '#authMessage'
    };

    notice(selectors[document.body.dataset.page], error.message);
  }
})();

window.addEventListener('storage', event => {
  if (event.key === CART) {
    updateCount();

    if (['cart', 'payment'].includes(document.body.dataset.page)) {
      location.reload();
    }
  }
});

// Mostrar u ocultar contraseña.
document.querySelectorAll('.pass-toggle').forEach(button => {
  button.addEventListener('click', () => {
    const input = document.getElementById(button.dataset.target);
    const visible = input.type === 'text';

    input.type = visible ? 'password' : 'text';
    button.textContent = visible ? 'Mostrar' : 'Ocultar';
    button.setAttribute('aria-pressed', String(!visible));
    button.setAttribute(
      'aria-label',
      visible ? 'Mostrar contraseña' : 'Ocultar contraseña'
    );
  });
});

// Indicador de longitud de contraseña.
(() => {
  const input = document.getElementById('password');
  const bar = document.getElementById('passBar');
  const count = document.getElementById('passCount');

  if (!input || !bar || !count) return;

  input.addEventListener('input', () => {
    const length = input.value.length;

    count.textContent = length + ' de 64 caracteres';
    bar.style.width = Math.min(length / 8, 1) * 100 + '%';

    const hint = document.getElementById('passHint');

    if (hint) {
      hint.textContent = length === 0
        ? 'Entre 8 y 64 caracteres.'
        : length < 8
          ? 'Te faltan ' + (8 - length) + ' caracteres para llegar al mínimo.'
          : 'Longitud correcta. Ya puedes crear tu cuenta.';
    }
  });
})();