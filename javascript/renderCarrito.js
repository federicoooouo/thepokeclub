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