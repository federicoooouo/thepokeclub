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
  });
});

// ===============================
// BOTONES AGREGAR (actualizan carrito y toast)
// ===============================

const addButtons = document.querySelectorAll('.card .btn-primary');

addButtons.forEach(button => {
  button.addEventListener('click', (e) => {
    e.preventDefault(); // evita que el link "#" recargue

    const card = button.closest('.card');
    const productId = parseInt(card.dataset.id);
    const qty = parseInt(card.querySelector('.qty-value').textContent);

    if (qty === 0) {
      mostrarToast('Selecciona al menos 1 producto');
      return;
    }

    let carrito = obtenerCarrito();
    const productoEnCarrito = carrito.find(item => item.id === productId);

    if (productoEnCarrito) {
      productoEnCarrito.cantidad = qty;
      mostrarToast('Producto actualizado en el carrito');
    } else {
      carrito.push({ id: productId, cantidad: qty });
      mostrarToast('Producto agregado al carrito');
    }

    guardarCarrito(carrito);
    actualizarContador();
    renderizarCarrito(); // actualiza sección "Mi pedido" si estamos en cart.html
    console.log('Carrito actualizado:', carrito);
  });
});

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
// RENDERIZAR CARRITO EN EL HTML
// ===============================

function renderizarCarrito() {
  const carrito = obtenerCarrito();
  const contenedor = document.querySelector('main section:first-of-type .card'); // sección "Mi pedido"
  if (!contenedor) return;

  contenedor.querySelectorAll('.item-carrito').forEach(e => e.remove());

  carrito.forEach(item => {
    const producto = productos.find(p => p.id === item.id);
    if (!producto) return;

    const div = document.createElement('div');
    div.classList.add('d-flex', 'justify-content-between', 'align-items-center', 'border-bottom', 'py-3', 'item-carrito');

    div.innerHTML = `
      <div>
        <h6 class="mb-1">${producto.nombre}</h6>
        <small class="text-muted">Cantidad: x${item.cantidad}</small>
      </div>
      <button class="btn btn-outline-danger btn-sm eliminar-item">
        <i class="bi bi-trash"></i>
      </button>
    `;

    div.querySelector('.eliminar-item').addEventListener('click', () => {
      eliminarDelCarrito(item.id);
      mostrarToast('Producto eliminado del carrito');
    });

    contenedor.appendChild(div);
  });
}

// ===============================
// ELIMINAR ITEM DEL CARRITO
// ===============================

function eliminarDelCarrito(productId) {
  let carrito = obtenerCarrito();
  carrito = carrito.filter(item => item.id !== productId);
  guardarCarrito(carrito);
  renderizarCarrito();

  const card = document.querySelector(`[data-id="${productId}"]`);
  if (card) card.querySelector('.qty-value').textContent = 0;

  actualizarContador();
  console.log('Item eliminado. Carrito actual:', carrito);
}

// BOTÓN WHATSAPP EN CART.HTML
const btnWhatsAppCart = document.querySelector('section.text-center button');
if (btnWhatsAppCart) {
  btnWhatsAppCart.addEventListener('click', () => {
    const carrito = obtenerCarrito();
    if (carrito.length === 0) {
      mostrarToast('El carrito está vacío'); // usamos toast en lugar de alert
      return;
    }

    let mensaje = 'Hola! Quiero hacer el siguiente pedido:%0A';
    carrito.forEach(item => {
      const producto = productos.find(p => p.id === item.id);
      if (!producto) return;
      mensaje += `- ${producto.nombre} x${item.cantidad}%0A`;
    });

    const direccion = document.querySelector('input.form-control')?.value;
    const notas = document.querySelector('textarea.form-control')?.value;
    if (direccion) mensaje += `%0ADirección: ${direccion}`;
    if (notas) mensaje += `%0ANotas: ${notas}`;

    const url = `https://wa.me/542645768107?text=${mensaje}`;
    window.open(url, '_blank');

    // Limpiar carrito
    localStorage.removeItem('carrito');
    renderizarCarrito();
    document.querySelectorAll('.qty-value').forEach(span => span.textContent = 0);
    actualizarContador();
    mostrarToast('Pedido enviado y carrito vacío');
  });
}
