// ===============================
// UTILIDADES DE CARRITO
// ===============================

// Trae el carrito o crea uno vacío
function obtenerCarrito() {
  const carrito = localStorage.getItem('carrito');
  return carrito ? JSON.parse(carrito) : [];
}

// Guarda el carrito
function guardarCarrito(carrito) {
  localStorage.setItem('carrito', JSON.stringify(carrito));
}

// ===============================
// LOGICA DE LAS CARDS
// ===============================

const buttons = document.querySelectorAll('.qty-btn');

buttons.forEach(button => {
  button.addEventListener('click', () => {

    const quantityContainer = button.parentElement;
    const valueSpan = quantityContainer.querySelector('.qty-value');
    let value = parseInt(valueSpan.textContent);

    if (button.textContent === '+') value++;
    else if (value > 0) value--;

    valueSpan.textContent = value;

    const col = button.closest('[data-id]');
    const productId = parseInt(col.dataset.id);

    let carrito = obtenerCarrito();
    const productoEnCarrito = carrito.find(item => item.id === productId);

    if (productoEnCarrito) {
      productoEnCarrito.cantidad = value;
      if (value === 0) carrito = carrito.filter(item => item.id !== productId);
    } else if (value > 0) {
      carrito.push({ id: productId, cantidad: value });
    }

    guardarCarrito(carrito);
    renderizarCarrito();
    console.log('Carrito actualizado:', carrito);
  });
});

// ===============================
// CARGAR CANTIDADES AL INICIAR
// ===============================

document.addEventListener('DOMContentLoaded', () => {
  const carrito = obtenerCarrito();

  carrito.forEach(item => {
    const col = document.querySelector(`[data-id="${item.id}"]`);
    if (!col) return;
    const valueSpan = col.querySelector('.qty-value');
    valueSpan.textContent = item.cantidad;
  });

  renderizarCarrito();
});

// ===============================
// RENDERIZAR CARRITO EN EL HTML
// ===============================

function renderizarCarrito() {
  const carrito = obtenerCarrito();
  const contenedor = document.querySelector('main section:first-of-type .card'); // sección "Mi pedido"
  if (!contenedor) return;

  // Limpiamos los items antiguos excepto el título
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

    // Botón eliminar
    div.querySelector('.eliminar-item').addEventListener('click', () => {
      eliminarDelCarrito(item.id);
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

  // Actualizamos cantidad en las cards
  const col = document.querySelector(`[data-id="${productId}"]`);
  if (col) col.querySelector('.qty-value').textContent = 0;

  console.log('Item eliminado. Carrito actual:', carrito);
}

// ===============================
// BOTÓN WHATSAPP
// ===============================

const btnWhatsApp = document.querySelector('section.text-center .btn');
if (btnWhatsApp) {
  btnWhatsApp.addEventListener('click', () => {
    const carrito = obtenerCarrito();
    if (carrito.length === 0) {
      alert('El carrito está vacío.');
      return;
    }

    let mensaje = 'Hola! Quiero hacer el siguiente pedido:%0A';
    carrito.forEach(item => {
      const producto = productos.find(p => p.id === item.id);
      mensaje += `- ${producto.nombre} x${item.cantidad}%0A`;
    });

    // Datos de dirección si existen
    const direccion = document.querySelector('input.form-control')?.value;
    const notas = document.querySelector('textarea.form-control')?.value;
    if (direccion) mensaje += `%0ADirección: ${direccion}`;
    if (notas) mensaje += `%0ANotas: ${notas}`;

    // Abrimos WhatsApp
    const url = `https://wa.me/5491123456789?text=${mensaje}`;
    window.open(url, '_blank');

    // Limpiamos carrito
    localStorage.removeItem('carrito');
    renderizarCarrito();

    // Reseteamos cantidades en las cards
    document.querySelectorAll('.qty-value').forEach(span => span.textContent = 0);
  });
}

