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
            <span class="tiny muted">Préstamo por 7 días</span>
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

function validCart(items) {
  return items.length > 0 && items.every(item =>
    item.game &&
    item.game.activo &&
    item.game.stock >= item.cantidad
  );
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
                <p class="muted tiny">${esc(item.game?.autor || item.game?.plataforma || '')}</p>
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
            Solicitar préstamo →
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
        'Tu cuenta es de lector. Usa una cuenta administradora para entrar al panel.'
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
            'Accediste como lector. El panel requiere una cuenta administradora.'
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


const loanDay = value => new Intl.DateTimeFormat('es-PE', {
  dateStyle: 'long', timeZone: 'America/Lima'
}).format(new Date(value + 'T12:00:00-05:00'));

async function payment() {
  if (!me.autenticado) { location.replace('/login.html?next=pagar'); return; }
  products = await api('/api/videojuegos');
  const items = cartDetails();
  if (!validCart(items)) {
    $('#paymentView').innerHTML = '<div class="empty"><h2>Revisa tu selección</h2><p>Está vacía o cambió la disponibilidad de un libro.</p><a class="btn primary" href="/carrito.html">Volver a mi selección</a></div>';
    return;
  }
  const signature = JSON.stringify(readCart());
  $('#paymentView').innerHTML = `
    <div class="split"><section class="panel">
      <span class="pill">PRÉSTAMO GRATUITO · 7 DÍAS</span>
      <h2 style="margin-top:20px">Una nueva lectura te espera</h2>
      <p class="muted">Solicitando como <strong>${esc(me.correo)}</strong></p>
      <p>El plazo comienza al confirmar. La fecha límite exacta quedará registrada en Mis préstamos. Devuelve los ejemplares en la biblioteca para que el administrador registre su recepción.</p>
      <form id="payForm">
        <label class="pay-option"><input type="checkbox" required><span>Me comprometo a cuidar los libros y devolverlos dentro de los 7 días.</span></label>
        <button class="primary full" id="payButton">Confirmar préstamo gratuito</button>
      </form>
    </section><aside class="panel summary"><h2>Tu selección</h2>
      ${items.map(i => `<div class="row"><span>${esc(i.game.titulo)}</span><strong>× ${i.cantidad}</strong></div>`).join('')}
      <p class="notice">Sin pagos ni cargos. Plazo: 7 días calendario.</p>
    </aside></div>`;
  $('#payForm').onsubmit = async event => {
    event.preventDefault();
    const button = $('#payButton');
    button.disabled = true;
    notice('#paymentError', '');
    try {
      if (JSON.stringify(readCart()) !== signature) throw new Error('La selección cambió. Recarga esta página antes de confirmar.');
      let key = sessionStorage.getItem('aulalibro.loan.key');
      if (!key || sessionStorage.getItem('aulalibro.loan.items') !== signature) {
        key = crypto.randomUUID();
        sessionStorage.setItem('aulalibro.loan.key', key);
        sessionStorage.setItem('aulalibro.loan.items', signature);
      }
      const loan = await api('/api/prestamos', { method: 'POST', body: JSON.stringify({items: readCart(), clave: key}) });
      // Una falla de almacenamiento local no debe crear otro préstamo.
      try {
        saveCart([]);
        sessionStorage.removeItem('aulalibro.loan.key');
        sessionStorage.removeItem('aulalibro.loan.items');
      } catch {}
      location.href = '/pedidos.html?prestamo=' + encodeURIComponent(loan.id);
    } catch (error) {
      notice('#paymentError', error.message);
      if (error.status === 401) location.href = '/login.html?next=pagar';
    } finally { button.disabled = false; }
  };
}

function orderMarkup(loan, admin = false) {
  const focus = new URLSearchParams(location.search).get('prestamo') === loan.id;
  return `<article class="panel ${focus ? 'focus-order' : ''}">
    ${focus ? '<div class="notice success">Préstamo registrado correctamente.</div>' : ''}
    <div class="order-head"><div><div class="eyebrow">Préstamo ${esc(loan.id.slice(0,8))}</div>
      <h3>${esc(date(loan.fecha))}</h3>
      ${admin ? `<p class="muted">${esc(loan.usuario)}</p>` : ''}
    </div><span class="pill">${esc(loan.estado)}</span></div>
    <div class="order-lines">${loan.items.map(i => `<div class="row"><span>${esc(i.titulo)}</span><strong>${i.cantidad} ejemplar(es)</strong></div>`).join('')}</div>
    <p>Devolver hasta el <strong>${esc(loanDay(loan.fechaLimite))}</strong>.</p>
    ${loan.fechaDevolucion ? `<p class="stock">Devolución registrada: ${esc(date(loan.fechaDevolucion))}</p>` : ''}
    ${admin && loan.estado !== 'DEVUELTO' ? `<button class="primary" data-return="${esc(loan.id)}">Registrar devolución</button>` : ''}
  </article>`;
}

async function ordersPage() {
  if (!me.autenticado) { location.replace('/login.html?next=pedidos'); return; }
  const loans = await api('/api/prestamos');
  $('#orders').innerHTML = loans.map(l => orderMarkup(l)).join('') ||
    '<div class="empty"><h2>Todavía no tienes préstamos</h2><p>Encuentra tu próxima lectura en el catálogo.</p><a class="btn primary" href="/index.html">Explorar libros</a></div>';
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
    orders = await api('/api/admin/prestamos');

    $('#metrics').innerHTML = `
      <div class="panel">
        <span class="muted tiny">Libros</span>
        <strong>${products.length}</strong>
      </div>
      <div class="panel">
        <span class="muted tiny">Unidades en stock</span>
        <strong>${products.reduce((total, product) => total + product.stock, 0)}</strong>
      </div>
      <div class="panel">
        <span class="muted tiny">Préstamos pendientes</span>
        <strong>${orders.filter(loan => loan.estado !== 'DEVUELTO').length}</strong>
      </div>
    `;

    $('#inventory').innerHTML = products.map(product => `
      <tr>
        <td>
          <strong>${esc(product.titulo)}</strong><br>
          <span class="tiny muted">${esc(product.genero)}</span>
        </td>
        <td>${esc(product.plataforma)}</td>
        <td>7 días</td>
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
        <td colspan="6">No hay libros. Agrega el primero.</td>
      </tr>
    `;

    $('#adminOrders').innerHTML =
      orders.map(order => orderMarkup(order, true)).join('') ||
      '<p class="muted">Todavía no hay préstamos.</p>';
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
      'stock',
      'imagenUrl'
    ]) {
      form.elements[key].value = product?.[key] ?? '';
    }

    form.elements.activo.value = String(product?.activo ?? true);
    $('#productTitle').textContent = product
      ? 'Editar libro'
      : 'Nuevo libro';

    notice('#productError', '');
    $('#productDialog').showModal();
  }

  $('#adminOrders').onclick = async event => {
    const button = event.target.closest('[data-return]');
    if (!button || !confirm('¿Confirmas que recibiste todos los ejemplares de este préstamo?')) return;
    button.disabled = true;
    try {
      await api('/api/admin/prestamos/' + encodeURIComponent(button.dataset.return) + '/devolucion', {method:'POST'});
      notice('#adminError', '');
      await render();
      toast('Devolución registrada. Ejemplares repuestos.');
    } catch(error) { notice('#adminError', error.message); }
    finally { button.disabled = false; }
  };
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
        '¿Eliminar el libro? Los registros anteriores se conservarán.'
      )) {
        return;
      }

      remove.disabled = true;

      try {
        await api('/api/videojuegos/' + remove.dataset.delete, {
          method: 'DELETE'
        });

        await render();
        toast('Libro eliminado.');
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

      data.precio = 0;
      data.stock = Number(data.stock);
      data.activo = data.activo === 'true';

      await api('/api/videojuegos' + (id ? '/' + id : ''), {
        method: id ? 'PUT' : 'POST',
        body: JSON.stringify(data)
      });

      $('#productDialog').close();
      await render();
      toast('Libro guardado.');
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
