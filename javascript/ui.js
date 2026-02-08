// ===============================
// contador de navbar
// ===============================
function actualizarContador() {
  const carrito = obtenerCarrito();
  const total = carrito.reduce((acc, item) => acc + item.cantidad, 0);
  const contador = document.getElementById('contador-carrito');
  if (contador) contador.textContent = total;
  const floatingCount = document.getElementById('floating-cart-count');
  if (floatingCount) floatingCount.textContent = total;
}

// ===============================
// toast de bootstrap
// ===============================
function mostrarToast(mensaje) {
  const toastEl = document.getElementById('toast-carrito');
  if (!toastEl) return;

  toastEl.querySelector('.toast-body').textContent = mensaje;
  const toast = new bootstrap.Toast(toastEl);
  toast.show();
}
