// ===============================
// UTILIDADES DE CARRITO
// ===============================

function obtenerCarrito() {
  const carrito = localStorage.getItem('carrito');
  return carrito ? JSON.parse(carrito) : [];
}

function guardarCarrito(carrito) {
  localStorage.setItem('carrito', JSON.stringify(carrito));
}

// ===============================
// CONTADOR EN LA NAVBAR
// ===============================

function actualizarContador() {
  const carrito = obtenerCarrito();
  const total = carrito.reduce((acc, item) => acc + item.cantidad, 0);
  const contador = document.getElementById('contador-carrito');
  if (contador) contador.textContent = total;
}

// ===============================
// TOAST BOOTSTRAP
// ===============================

function mostrarToast(mensaje) {
  const toastEl = document.getElementById('toast-carrito');
  if (!toastEl) return;

  toastEl.querySelector('.toast-body').textContent = mensaje;
  const toast = new bootstrap.Toast(toastEl);
  toast.show();
}

// ===============================
// LOGICA DE BOTONES + Y - (solo contador)
// ===============================

const qtyButtons = document.querySelectorAll('.qty-btn');

qtyButtons.forEach(button => {
  button.addEventListener('click', () => {
    const valueSpan = button.parentElement.querySelector('.qty-value');
    let value = parseInt(valueSpan.textContent);

    if (button.textContent === '+') value++;
    else if (button.textContent === '−' && value > 0) value--;

    valueSpan.textContent = value;
        const modalContent = button.closest('.modal-content');
    if (modalContent) {
      calcularTotalModal(modalContent);
    }

  });
});


// ===============================
// AGREGAR BEBIDAS (SIN MODAL)
// ===============================
document.querySelectorAll('.btn-agregar-bebida').forEach(button => {
  button.addEventListener('click', () => {

    const card = button.closest('.card');
    const productId = parseInt(card.dataset.id);
    const qty = parseInt(card.querySelector('.qty-value').textContent);

    if (qty === 0) {
      mostrarToast('Seleccioná al menos una bebida');
      return;
    }

    const producto = productos.find(p => p.id === productId);
    if (!producto) return;

    const itemCarrito = {
      id: productId,
      cantidad: qty,
      base: null,
      adicionales: [],
      precioUnitario: producto.precio
    };

    let carrito = obtenerCarrito();
    carrito.push(itemCarrito);

    guardarCarrito(carrito);
    actualizarContador();
    renderizarCarrito();

    card.querySelector('.qty-value').textContent = 0;
    mostrarToast('Bebida agregada al carrito');
  });
});

// ===============================
// LOGICA DE BOTONES AGREGAR EN MODALES (EXTENDIDA)
// ===============================
const modalAddButtons = document.querySelectorAll('.btn-agregar-modal');

modalAddButtons.forEach(button => {
  button.addEventListener('click', () => {

    const modalContent = button.closest('.modal-content');
    const productId = parseInt(modalContent.dataset.id);

    // cantidad
    const qty = parseInt(
      modalContent.querySelector('.qty-value').textContent
    );

    if (qty === 0) {
      mostrarToast('Selecciona al menos 1 producto');
      return;
    }

    // producto base (ensalada)
    const producto = productos.find(p => p.id === productId);
    if (!producto) return;

    // base seleccionada (solo texto)
    const baseSeleccionada = modalContent.querySelector(
      'input[name="base-modal-1"]:checked'
    )?.nextElementSibling.textContent || 'Sin base';

    // adicionales seleccionados
    const adicionalesSeleccionados = [];
    let sumaAdicionales = 0;

    modalContent.querySelectorAll('.adicional-checkbox:checked')
      .forEach(check => {
        const precio = parseInt(check.dataset.precio);

        adicionalesSeleccionados.push({
          id: parseInt(check.dataset.id),
          nombre: check.nextElementSibling.textContent,
          precio: precio
        });

        sumaAdicionales += precio;
      });

    // precio unitario final (ensalada + adicionales)
    const precioUnitarioFinal = producto.precio + sumaAdicionales;

    // armar item de carrito
    const itemCarrito = {
      id: productId,
      cantidad: qty,
      base: baseSeleccionada,
      adicionales: adicionalesSeleccionados,
      precioUnitario: precioUnitarioFinal
    };

    // guardar en carrito
    let carrito = obtenerCarrito();

    // ⚠️ IMPORTANTE:
    // por ahora, si existe mismo id, lo reemplazamos
   carrito.push(itemCarrito);


    guardarCarrito(carrito);
    actualizarContador();
    renderizarCarrito();

  // resetear modal
resetearModal(modalContent);

// cerrar modal
const modal = bootstrap.Modal.getInstance(
  document.getElementById('modalEnsalada1')
);
modal.hide();  
  });
});

//RESETEAR MODAL AL ABRIR
function resetearModal(modalContent) {
  // resetear base (radio)
  const baseDefault = modalContent.querySelector(
    'input[name="base-modal-1"]'
  );
  if (baseDefault) baseDefault.checked = true;

  // resetear adicionales
  modalContent.querySelectorAll('.adicional-checkbox')
    .forEach(check => {
      check.checked = false;
    });

  // resetear cantidad
  const qtySpan = modalContent.querySelector('.qty-value');
  if (qtySpan) qtySpan.textContent = 1;
}

// CALCULAR TOTAL EN MODAL AL CAMBIAR ADICIONALES O CANTIDAD
function calcularTotalModal(modalContent) {
  const productId = parseInt(modalContent.dataset.id);
  const producto = productos.find(p => p.id === productId);
  if (!producto) return;

  // cantidad
  const qty = parseInt(
    modalContent.querySelector('.qty-value').textContent
  );

  // sumar solo adicionales
  let sumaAdicionales = 0;
  modalContent.querySelectorAll('.adicional-checkbox:checked')
    .forEach(check => {
      sumaAdicionales += parseInt(check.dataset.precio);
    });

  const total = (producto.precio + sumaAdicionales) * qty;

  const totalSpan = modalContent.querySelector('#total-modal');
  if (totalSpan) {
    totalSpan.textContent = total.toLocaleString('es-AR');
  }

  
}

// ===============================
// PASAR DATA-ID DE LA CARD AL MODAL + INICIALIZAR TOTAL
// ===============================
const modalEl = document.getElementById('modalEnsalada1');

if (modalEl) {
  modalEl.addEventListener('show.bs.modal', (event) => {
    const button = event.relatedTarget;
    if (!button) return;

    const card = button.closest('.card');
    if (!card) return;

    // 1️⃣ ID correcto
    const productId = card.dataset.id;
    const modalContent = modalEl.querySelector('.modal-content');
    modalContent.dataset.id = productId;

    // 2️⃣ TÍTULO del modal
    const cardTitle = card.querySelector('.card-title')?.textContent;
    const modalTitle = modalEl.querySelector('.modal-title');
    if (cardTitle && modalTitle) {
      modalTitle.textContent = cardTitle;
    }

    // 3️⃣ (opcional ahora) recalcular total correcto
    calcularTotalModal(modalContent);
  });
}

// ===============================
// CARGAR CANTIDADES AL INICIAR
// ===============================

document.addEventListener('DOMContentLoaded', () => {
  const carrito = obtenerCarrito();

  carrito.forEach(item => {
    const card = document.querySelector(`[data-id="${item.id}"]`);
    if (!card) return;
    const valueSpan = card.querySelector('.qty-value');
    valueSpan.textContent = item.cantidad;
  });

  actualizarContador();
  renderizarCarrito();
});
// ===============================
// RENDERIZAR ADICIONALES EN MODAL
// (solo si existe el modal)
// ===============================
const contenedorAdicionales = document.getElementById('lista-adicionales-modal');

if (contenedorAdicionales) {
  const adicionales = productos.filter(
    p => p.id > 5 && p.id < 12
  );

  adicionales.forEach(adicional => {
    const div = document.createElement('div');
    div.classList.add('form-check');

    div.innerHTML = `
      <input 
        class="form-check-input adicional-checkbox"
        type="checkbox"
        data-id="${adicional.id}"
        data-precio="${adicional.precio}"
        id="adicional-${adicional.id}"
      >
      <label class="form-check-label" for="adicional-${adicional.id}">
        ${adicional.nombre} (+$${adicional.precio})
      </label>
    `;

    contenedorAdicionales.appendChild(div);
  });

  // listener SOLO si existe el contenedor
  contenedorAdicionales.addEventListener('change', (e) => {
    if (e.target.classList.contains('adicional-checkbox')) {
      const modalContent = e.target.closest('.modal-content');
      calcularTotalModal(modalContent);
    }
  });
}
// ===============================
// RENDERIZAR CARRITO EN EL HTML
// ===============================
function renderizarCarrito() {
  const carrito = obtenerCarrito();
  const contenedor = document.getElementById('contenedor-carrito');
  if (!contenedor) return;

  // eliminar items renderizados previamente
  contenedor.querySelectorAll('.item-carrito').forEach(e => e.remove());

  carrito.forEach((item, index) => {
    const producto = productos.find(p => p.id === item.id);
    if (!producto) return;

    const subtotal = item.precioUnitario * item.cantidad;

    const div = document.createElement('div');
    div.classList.add('item-carrito', 'border-bottom', 'py-3');

    div.innerHTML = `
      <div class="d-flex justify-content-between align-items-start">
        <div>
          <h6 class="mb-1">${producto.nombre}</h6>

          <small class="text-muted d-block">
            Base: ${item.base}
          </small>

          ${
            item.adicionales && item.adicionales.length > 0
              ? `<ul class="mb-1 ps-3">
                  ${item.adicionales
                    .map(a => `<li class="small">+ ${a.nombre}</li>`)
                    .join('')}
                </ul>`
              : ''
          }

          <small class="text-muted">
            Cantidad: x${item.cantidad}
          </small>
        </div>

        <div class="text-end">
          <div class="fw-bold">
            $${subtotal.toLocaleString('es-AR')}
          </div>

          <button class="btn btn-outline-danger btn-sm mt-2 eliminar-item">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </div>
    `;

    // eliminar SOLO este item
    div.querySelector('.eliminar-item').addEventListener('click', () => {
      eliminarDelCarritoPorIndice(index);
      mostrarToast('Producto eliminado del carrito');
    });

    // insertar antes del total
    const total = contenedor.querySelector('#total-carrito');
    contenedor.insertBefore(div, total);
  });

  actualizarTotal();
}

// ===============================
// ELIMINAR ITEM POR INDICE
// ===============================

function eliminarDelCarritoPorIndice(index) {
  let carrito = obtenerCarrito();

  carrito.splice(index, 1);

  guardarCarrito(carrito);
  renderizarCarrito();
  actualizarContador();
}

// ===============================
// CALCULAR Y MOSTRAR TOTAL
// ===============================

function actualizarTotal() {
  const carrito = obtenerCarrito();
  const totalContainer = document.getElementById('total-carrito');
  if (!totalContainer) return;

  let total = 0;

  carrito.forEach(item => {
    // usamos precioUnitario si existe (ensalada + adicionales)
    const precio = item.precioUnitario ?? 0;
    total += precio * item.cantidad;
  });

  totalContainer.textContent = `Total: $${total.toLocaleString('es-AR')}`;

}
// ===============================
// ELIMINAR ITEM DEL CARRITO
// ==============================

function eliminarDelCarrito(productId) {
  let carrito = obtenerCarrito();
  carrito = carrito.filter(item => item.id !== productId);
  guardarCarrito(carrito);
  renderizarCarrito();

  const card = document.querySelector(`[data-id="${productId}"]`);
  if (card) card.querySelector('.qty-value').textContent = 0;

  actualizarContador();
}
// ===============================
// BOTÓN WHATSAPP EN CART.HTML (VERSIÓN FINAL)
// ===============================

const btnWhatsAppCart = document.querySelector('section.text-center button');

if (btnWhatsAppCart) {
  btnWhatsAppCart.addEventListener('click', () => {

    const carrito = obtenerCarrito();

    if (carrito.length === 0) {
      mostrarToast('El carrito está vacío');
      return;
    }

    let mensaje = 'Hola! Quiero hacer el siguiente pedido:%0A%0A';
    let totalPedido = 0;

    carrito.forEach(item => {
      const producto = productos.find(p => p.id === item.id);
      if (!producto) return;

      const subtotal = item.precioUnitario * item.cantidad;
      totalPedido += subtotal;

      // Nombre del producto
      mensaje += `- ${producto.nombre}%0A`;

      // Base (solo si existe)
      if (item.base) {
        mensaje += `  Base: ${item.base}%0A`;
      }

      // Adicionales (solo si existen)
      if (item.adicionales && item.adicionales.length > 0) {
        item.adicionales.forEach(ad => {
          mensaje += `  + ${ad.nombre}%0A`;
        });
      }

      // Cantidad y subtotal
      mensaje += `  Cantidad: x${item.cantidad}%0A`;
      mensaje += `  Subtotal: $${subtotal}%0A%0A`;
    });

    mensaje += `🧾 Total del pedido: $${totalPedido}%0A`;

    // Datos opcionales (si existen en el HTML)
    const direccion = document.querySelector('input.form-control')?.value;
    const notas = document.querySelector('textarea.form-control')?.value;

    if (direccion) {
      mensaje += `%0A📍 Dirección: ${direccion}`;
    }

    if (notas) {
      mensaje += `%0A📝 Notas: ${notas}`;
    }

    // Abrir WhatsApp
    const url = `https://wa.me/542645768107?text=${mensaje}`;
    window.open(url, '_blank');

    // Limpiar carrito después de enviar
    localStorage.removeItem('carrito');
    renderizarCarrito();
    actualizarContador();

    // Resetear cantidades visibles
    document.querySelectorAll('.qty-value').forEach(span => {
      span.textContent = 0;
    });

    mostrarToast('Pedido enviado y carrito vacío');
  });
}
