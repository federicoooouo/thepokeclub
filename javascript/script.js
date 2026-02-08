// ===============================
// cards bebidas, sin modales
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
// boton agregar MODAL, logica extendida y completa
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
// ===============================
// carga de cantidades al iniciar
// ===============================
document.addEventListener('DOMContentLoaded', () => {
  const carrito = obtenerCarrito();

  carrito.forEach(item => {
    // buscamo una card con el mismo data-id
    const card = document.querySelector(`[data-id="${item.id}"]`);
    if (card) {
      const valueSpanCard = card.querySelector('.qty-value');
      if (valueSpanCard) {
        valueSpanCard.textContent = item.cantidad;
      } else {
        console.warn(`.qty-value no encontrada en card con data-id="${item.id}"`);
      }
      return; 
    }
    // si no encuentra la cards, se va a los modales (que solo lo tienen ensaladas ah re)
    const modalContent = document.querySelector(`#modalEnsalada1 .modal-content`);
    if (modalContent && modalContent.dataset.id == item.id) {
      const qtySpanModal = modalContent.querySelector('.qty-value');
      if (qtySpanModal) {
        qtySpanModal.textContent = item.cantidad;
        calcularTotalModal(modalContent, productos); 
      }
    }
  });
  actualizarContador();
  renderizarCarrito();
});



