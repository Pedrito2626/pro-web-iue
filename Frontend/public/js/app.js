/* ==========================================================================
   SalesFlow · app.js
   Consumo de API + interacción enriquecida (toast, modal, carrito, etc.)
   ========================================================================== */

const API = 'http://localhost:3000';

/* ── Helpers ───────────────────────────────────────── */

async function apiFetch(endpoint, options = {}) {
  const res = await fetch(API + endpoint, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Error ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

const fmt = n => '$' + Number(n).toLocaleString('es-CO');

function stockBadge(qty) {
  if (qty <= 0)  return `<span class="badge badge--low">Agotado</span>`;
  if (qty <= 5)  return `<span class="badge badge--low">Stock ${qty}</span>`;
  return `<span class="badge badge--ok">Stock ${qty}</span>`;
}

function catInitials(cat) {
  return String(cat || '?').slice(0, 2).toUpperCase();
}

function catLabel(cat) {
  const map = {
    aguardiente: 'Aguardiente',
    cerveza: 'Cerveza',
    vino: 'Vino',
    ron: 'Ron',
    whisky: 'Whisky',
    otros: 'Otros',
  };
  return map[String(cat).toLowerCase()] || cat;
}

function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[m]));
}

/* ── Toast ─────────────────────────────────────────── */

const ICONS = {
  ok:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  err: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
};

function toast(msg, type = 'ok') {
  let el = document.getElementById('sf-toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'sf-toast';
    el.className = 'toast';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    document.body.appendChild(el);
  }
  el.className = `toast toast--${type}`;
  el.innerHTML = `<span class="toast__icon">${ICONS[type] || ICONS.ok}</span><span class="toast__text">${escapeHtml(msg)}</span>`;
  requestAnimationFrame(() => el.classList.add('show'));
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 3800);
}

/* ── Nav mobile ────────────────────────────────────── */

(function navToggle() {
  const btn = document.querySelector('.nav__toggle');
  const links = document.querySelector('.nav__links');
  if (btn && links) btn.addEventListener('click', () => links.classList.toggle('open'));
})();

/* ── Page detect ───────────────────────────────────── */

const page = location.pathname.split('/').pop() || 'index.html';

/* ════════ INDEX ═══════════════════════════════════════ */

if (page === '' || page === 'index.html') {
  // Fecha en hero
  const dateEl = document.getElementById('hero-date');
  if (dateEl) {
    const d = new Date();
    const fmtDate = d.toLocaleDateString('es-CO', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
    dateEl.textContent = fmtDate.charAt(0).toUpperCase() + fmtDate.slice(1);
  }

  // Animación count-up
  function countUp(el, target, opts = {}) {
    const isCurrency = opts.currency;
    const dur = opts.dur || 1400;
    const start = performance.now();
    function tick(now) {
      const t = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const cur = Math.round(target * eased);
      if (isCurrency) {
        const main = Math.floor(cur / 1000);
        const tail = String(cur % 1000).padStart(3, '0');
        el.innerHTML = `$${main.toLocaleString('es-CO')}<span class="unit">.${tail}</span>`;
      } else {
        el.textContent = cur.toLocaleString('es-CO');
      }
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // Solo el endpoint de productos existe como listing — el resto degrada
  apiFetch('/api/productos').then(productos => {
    if (!Array.isArray(productos)) return;
    const stockCount = productos.filter(p => Number(p.cantidad) > 0).length;
    const elStock = document.querySelector('.kpi__value[data-val="stock"]');
    if (elStock) { elStock.textContent = ''; countUp(elStock, stockCount); }
  }).catch(() => {});
}

/* ════════ PRODUCTOS ════════════════════════════════════ */

if (page === 'productos.html') {
  let allProducts = [];
  let editingId   = null;
  const modal     = document.getElementById('modal-producto');

  async function loadProducts() {
    try {
      allProducts = await apiFetch('/api/productos');
      applyFilters();
    } catch (e) {
      document.querySelector('.product-grid').innerHTML = renderEmpty('No pudimos cargar el catálogo', e.message);
      document.querySelector('#modo-gestionar tbody').innerHTML =
        `<tr><td colspan="6" style="text-align:center;color:var(--bordeaux);padding:2rem">${escapeHtml(e.message)}</td></tr>`;
    }
  }

  function renderEmpty(title, sub) {
    return `
      <div class="empty">
        <div class="empty__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2h8M9 2v3a4 4 0 0 1-.7 2.2L7.6 8.3A4 4 0 0 0 7 10.5V20a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-9.5a4 4 0 0 0-.6-2.2l-.7-1.1A4 4 0 0 1 15 5V2"/></svg>
        </div>
        <p class="empty__title">${escapeHtml(title)}</p>
        ${sub ? `<p class="empty__desc">${escapeHtml(sub)}</p>` : ''}
      </div>`;
  }

  function buildCard(p) {
    return `
      <article class="product-card" data-cat="${escapeHtml(p.categoria)}">
        <div class="product-card__thumb">
          <div class="product-card__bottle">
            <span class="product-card__cat-mark">${catInitials(p.categoria)}</span>
          </div>
        </div>
        <div class="product-card__body">
          <span class="product-card__cat">${escapeHtml(catLabel(p.categoria))}</span>
          <h2 class="product-card__name">${escapeHtml(p.nombre)}</h2>
          <p class="product-card__desc">${escapeHtml(p.descripcion || '')}</p>
        </div>
        <div class="product-card__footer">
          <span class="product-card__price">${fmt(p.precio)}</span>
          ${stockBadge(p.cantidad)}
        </div>
      </article>`;
  }

  function renderCatalog(products) {
    const grid = document.querySelector('.product-grid');
    if (!grid) return;
    grid.innerHTML = products.length
      ? products.map(buildCard).join('')
      : renderEmpty('Sin coincidencias', 'Prueba ajustando los filtros o la búsqueda.');
  }

  function renderTable(products) {
    const tbody = document.querySelector('#modo-gestionar tbody');
    if (!tbody) return;
    if (!products.length) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--text-mute);padding:2.5rem">Sin productos para mostrar.</td></tr>`;
      return;
    }
    tbody.innerHTML = products.map(p => `
      <tr>
        <td>${escapeHtml(p.nombre)}</td>
        <td>${escapeHtml(catLabel(p.categoria))}</td>
        <td class="num">${fmt(p.precio)}</td>
        <td class="num">${p.cantidad}</td>
        <td>${stockBadge(p.cantidad)}</td>
        <td>
          <div class="actions">
            <button class="btn btn--ghost btn--xs" onclick="editProduct(${p.id})">Editar</button>
            <button class="btn btn--danger btn--xs" onclick="deleteProduct(${p.id})">Eliminar</button>
          </div>
        </td>
      </tr>`).join('');
  }

  function applyFilters() {
    const q   = (document.getElementById('search-input')?.value || '').toLowerCase();
    const cat = (document.getElementById('cat-filter')?.value || '').toLowerCase();
    const filtered = allProducts.filter(p => {
      const matchQ   = !q   || p.nombre.toLowerCase().includes(q) || String(p.categoria).toLowerCase().includes(q);
      const matchCat = !cat || String(p.categoria).toLowerCase() === cat;
      return matchQ && matchCat;
    });
    renderCatalog(filtered);
    renderTable(filtered);
    const c = document.getElementById('result-count');
    if (c) c.textContent = `${filtered.length} ítem${filtered.length === 1 ? '' : 's'}`;
  }

  document.getElementById('search-input')?.addEventListener('input', applyFilters);
  document.getElementById('cat-filter')?.addEventListener('change', applyFilters);

  // Modo
  window.setMode = function (mode) {
    const isCat = mode === 'catalogo';
    document.getElementById('modo-catalogo').hidden  = !isCat;
    document.getElementById('modo-gestionar').hidden = isCat;
    document.getElementById('btn-catalogo').classList.toggle('mode-btn--active', isCat);
    document.getElementById('btn-gestionar').classList.toggle('mode-btn--active', !isCat);
    document.getElementById('mode-desc').textContent = isCat
      ? 'Botellas seleccionadas, disponibles en inventario.'
      : 'Añade, edita y elimina productos del catálogo.';
  };

  // Modal
  window.openProductoModal = function () {
    editingId = null;
    document.getElementById('producto-form').reset();
    document.getElementById('modal-producto-title').textContent = 'Agregar producto';
    document.getElementById('modal-save-btn').lastChild.textContent = ' Guardar producto';
    if (modal && typeof modal.showModal === 'function') modal.showModal();
    setTimeout(() => document.getElementById('p-nombre')?.focus(), 100);
  };
  window.closeProductoModal = function () {
    if (modal && typeof modal.close === 'function') modal.close();
  };

  // Click backdrop cierra
  modal?.addEventListener('click', e => {
    const rect = modal.querySelector('.modal__panel').getBoundingClientRect();
    if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) {
      modal.close();
    }
  });

  window.editProduct = function (id) {
    const p = allProducts.find(x => x.id === id);
    if (!p) return;
    editingId = id;
    document.getElementById('p-nombre').value = p.nombre;
    document.getElementById('p-cat').value    = p.categoria;
    document.getElementById('p-precio').value = p.precio;
    document.getElementById('p-stock').value  = p.cantidad;
    document.getElementById('p-desc').value   = p.descripcion || '';
    document.getElementById('modal-producto-title').textContent = 'Editar producto';
    document.getElementById('modal-save-btn').lastChild.textContent = ' Actualizar';
    if (modal && typeof modal.showModal === 'function') modal.showModal();
  };

  window.deleteProduct = async function (id) {
    if (!confirm('¿Eliminar este producto del catálogo?')) return;
    try {
      await apiFetch(`/api/productos/${id}`, { method: 'DELETE' });
      toast('Producto eliminado.');
      await loadProducts();
    } catch (e) {
      toast(e.message, 'err');
    }
  };

  document.getElementById('producto-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    if (!e.target.checkValidity()) {
      e.target.reportValidity();
      return;
    }
    const body = {
      nombre:      document.getElementById('p-nombre').value.trim(),
      categoria:   document.getElementById('p-cat').value,
      precio:      parseFloat(document.getElementById('p-precio').value),
      cantidad:    parseInt(document.getElementById('p-stock').value, 10),
      descripcion: document.getElementById('p-desc').value.trim(),
    };
    try {
      if (editingId !== null) {
        await apiFetch(`/api/productos/${editingId}`, { method: 'PUT', body: JSON.stringify(body) });
        toast('Producto actualizado.');
      } else {
        await apiFetch('/api/productos', { method: 'POST', body: JSON.stringify(body) });
        toast('Producto agregado al catálogo.');
      }
      editingId = null;
      e.target.reset();
      modal?.close();
      await loadProducts();
    } catch (err) {
      toast(err.message, 'err');
    }
  });

  loadProducts();
}

/* ════════ VENTAS ════════════════════════════════════════ */

if (page === 'ventas.html') {
  let cartItems = [];
  let products  = [];

  async function loadProductsVentas() {
    try {
      products = await apiFetch('/api/productos');
      const sel = document.getElementById('producto-select');
      if (!sel) return;
      sel.innerHTML = '<option value="">Selecciona un producto…</option>' +
        products
          .filter(p => p.cantidad > 0)
          .map(p => `<option value="${p.id}" data-price="${p.precio}" data-stock="${p.cantidad}" data-cat="${escapeHtml(p.categoria)}" data-name="${escapeHtml(p.nombre)}">${escapeHtml(p.nombre)} — ${fmt(p.precio)}</option>`)
          .join('');
    } catch (e) {
      toast('No pudimos cargar productos: ' + e.message, 'err');
    }
  }

  function updateSummary() {
    const itemsEl = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');
    const itemcountEl = document.getElementById('cart-itemcount');
    const countEl = document.getElementById('cart-count');
    const confirmBtn = document.getElementById('confirm-btn');

    if (cartItems.length === 0) {
      itemsEl.innerHTML = `
        <div class="summary__empty">
          <div class="summary__empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2h8M9 2v3a4 4 0 0 1-.7 2.2L7.6 8.3A4 4 0 0 0 7 10.5V20a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-9.5a4 4 0 0 0-.6-2.2l-.7-1.1A4 4 0 0 1 15 5V2"/></svg>
          </div>
          <p>Sin productos aún</p>
          <small>Añade botellas para componer la venta.</small>
        </div>`;
      totalEl.textContent = '$0';
      itemcountEl.textContent = '0';
      countEl.textContent = '0 ítems';
      confirmBtn.disabled = true;
      return;
    }

    itemsEl.innerHTML = cartItems.map((item, i) => `
      <div class="summary__item">
        <div class="summary__item-thumb">${catInitials(item.cat)}</div>
        <div class="summary__item-body">
          <div class="summary__item-name">${escapeHtml(item.name)}</div>
          <div class="summary__item-meta">
            <div class="stepper" role="group" aria-label="Cantidad">
              <button type="button" onclick="changeQty(${i}, -1)" aria-label="Restar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
              <span>${item.qty}</span>
              <button type="button" onclick="changeQty(${i}, 1)" aria-label="Sumar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
            </div>
            <span style="margin-left:0.6rem">· ${fmt(item.price)} c/u</span>
          </div>
        </div>
        <div class="summary__item-aside">
          <span class="summary__item-total">${fmt(item.price * item.qty)}</span>
          <button type="button" class="summary__item-remove" onclick="removeCartItem(${i})" aria-label="Quitar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>`).join('');

    const totalQty = cartItems.reduce((s, i) => s + i.qty, 0);
    totalEl.textContent = fmt(cartItems.reduce((s, i) => s + i.price * i.qty, 0));
    itemcountEl.textContent = String(totalQty);
    countEl.textContent = `${totalQty} ítem${totalQty === 1 ? '' : 's'}`;
    confirmBtn.disabled = false;
  }

  window.changeQty = function (idx, delta) {
    const item = cartItems[idx];
    if (!item) return;
    const stock = item.stock ?? Infinity;
    const next = item.qty + delta;
    if (next <= 0) {
      cartItems.splice(idx, 1);
    } else if (next > stock) {
      toast(`Stock máximo: ${stock}.`, 'err');
      return;
    } else {
      item.qty = next;
    }
    updateSummary();
  };

  window.removeCartItem = function (idx) {
    cartItems.splice(idx, 1);
    updateSummary();
  };

  document.getElementById('add-product-btn')?.addEventListener('click', () => {
    const sel   = document.getElementById('producto-select');
    const qtyEl = document.getElementById('cantidad');
    const opt   = sel?.options[sel.selectedIndex];
    const qty   = parseInt(qtyEl?.value, 10) || 1;
    if (!opt?.value || !opt.dataset.price) {
      toast('Selecciona un producto primero.', 'err');
      return;
    }
    const stock    = parseInt(opt.dataset.stock, 10);
    const existing = cartItems.find(i => i.id === opt.value);
    const currentQ = existing ? existing.qty : 0;
    if (currentQ + qty > stock) {
      toast(`Stock insuficiente. Disponible: ${stock - currentQ}.`, 'err');
      return;
    }
    if (existing) {
      existing.qty += qty;
    } else {
      cartItems.push({
        id:    opt.value,
        name:  opt.dataset.name || opt.text.split(' — ')[0],
        cat:   opt.dataset.cat || '',
        price: parseFloat(opt.dataset.price),
        stock,
        qty,
      });
    }
    updateSummary();
    if (qtyEl) qtyEl.value = 1;
    sel.value = '';
  });

  // Verificar cliente
  document.getElementById('verify-cliente-btn')?.addEventListener('click', async () => {
    const id  = document.getElementById('cliente-id')?.value.trim();
    const out = document.getElementById('cliente-verif');
    const status = document.getElementById('cliente-status');
    if (!id) {
      out.innerHTML = '';
      status.textContent = 'Sin asociar';
      status.className = 'badge badge--neutral';
      return;
    }
    try {
      const c = await apiFetch(`/api/clientes/${id}`);
      const initial = (c.nombre || '?').charAt(0).toUpperCase();
      out.innerHTML = `
        <div class="client-card" style="margin-top:0.5rem">
          <div class="client-card__head">
            <div class="client-card__avatar">${escapeHtml(initial)}</div>
            <div>
              <div class="client-card__name">${escapeHtml(c.nombre)}</div>
              <div class="client-card__id">ID #${escapeHtml(c.id)}</div>
            </div>
          </div>
          ${c.telefono ? `<div class="client-card__row"><span>Tel</span> ${escapeHtml(c.telefono)}</div>` : ''}
          ${c.email    ? `<div class="client-card__row"><span>Email</span> ${escapeHtml(c.email)}</div>` : ''}
        </div>`;
      status.textContent = 'Verificado';
      status.className = 'badge badge--ok';
    } catch (e) {
      out.innerHTML = `<div class="error-msg" style="margin-top:0.5rem">${escapeHtml(e.message)}</div>`;
      status.textContent = 'No encontrado';
      status.className = 'badge badge--low';
    }
  });

  document.getElementById('cliente-id')?.addEventListener('input', () => {
    document.getElementById('cliente-verif').innerHTML = '';
    const status = document.getElementById('cliente-status');
    status.textContent = 'Sin asociar';
    status.className = 'badge badge--neutral';
  });

  document.getElementById('venta-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    if (cartItems.length === 0) { toast('Agrega al menos un producto.', 'err'); return; }
    const clienteId = document.getElementById('cliente-id')?.value.trim() || null;
    const btn = document.getElementById('confirm-btn');
    btn.disabled = true;
    try {
      for (const item of cartItems) {
        await apiFetch('/api/ventas', {
          method: 'POST',
          body: JSON.stringify({
            productoId: parseInt(item.id, 10),
            cantidad:   item.qty,
            ...(clienteId && { clienteId: parseInt(clienteId, 10) }),
          }),
        });
      }
      toast(`Venta registrada — ${cartItems.length} producto${cartItems.length === 1 ? '' : 's'}.`);
      cartItems = [];
      updateSummary();
      e.target.reset();
      document.getElementById('cliente-verif').innerHTML = '';
      const status = document.getElementById('cliente-status');
      status.textContent = 'Sin asociar';
      status.className = 'badge badge--neutral';
      await loadProductsVentas();
    } catch (err) {
      toast(err.message, 'err');
      btn.disabled = false;
    }
  });

  loadProductsVentas();
  updateSummary();
}

/* ════════ CLIENTES ════════════════════════════════════════ */

if (page === 'clientes.html') {
  document.getElementById('cliente-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    if (!e.target.checkValidity()) {
      e.target.reportValidity();
      return;
    }
    const body = {
      nombre:   document.getElementById('cli-nombre').value.trim(),
      telefono: document.getElementById('cli-telefono').value.trim(),
      email:    document.getElementById('cli-correo').value.trim(),
    };
    const dir = document.getElementById('cli-direccion')?.value.trim();
    if (dir) body.direccion = dir;
    try {
      const c = await apiFetch('/api/clientes', { method: 'POST', body: JSON.stringify(body) });
      toast(`Cliente registrado. ID #${c.id}`);
      e.target.reset();
    } catch (err) {
      toast(err.message, 'err');
    }
  });

  window.buscarCliente = async function () {
    const q  = document.getElementById('buscar-id')?.value.trim();
    const el = document.getElementById('resultado-cliente');
    if (!el) return;
    if (!q) { el.innerHTML = ''; return; }
    try {
      const c = await apiFetch(`/api/clientes/${q}`);
      const initial = (c.nombre || '?').charAt(0).toUpperCase();
      el.innerHTML = `
        <div class="client-card">
          <div class="client-card__head">
            <div class="client-card__avatar">${escapeHtml(initial)}</div>
            <div>
              <div class="client-card__name">${escapeHtml(c.nombre)}</div>
              <div class="client-card__id">ID #${escapeHtml(c.id)}</div>
            </div>
          </div>
          ${c.telefono  ? `<div class="client-card__row"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg> <span>Tel</span> ${escapeHtml(c.telefono)}</div>`   : ''}
          ${c.email     ? `<div class="client-card__row"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> <span>Email</span> ${escapeHtml(c.email)}</div>`    : ''}
          ${c.direccion ? `<div class="client-card__row"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> <span>Dir</span> ${escapeHtml(c.direccion)}</div>` : ''}
        </div>`;
    } catch (err) {
      el.innerHTML = `<div class="error-msg">${escapeHtml(err.message)}</div>`;
    }
  };

  document.getElementById('buscar-id')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); window.buscarCliente(); }
  });
}
