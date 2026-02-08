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
// RESETEAR MODAL
// ===============================
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

// ===============================
// CALCULAR TOTAL EN MODAL
// ===============================
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

    // ID correcto
    const productId = card.dataset.id;
    const modalContent = modalEl.querySelector('.modal-content');
    modalContent.dataset.id = productId;

    // TÍTULO del modal
    const cardTitle = card.querySelector('.card-title')?.textContent;
    const modalTitle = modalEl.querySelector('.modal-title');
    if (cardTitle && modalTitle) {
      modalTitle.textContent = cardTitle;
    }

    // recalcular total correcto
    calcularTotalModal(modalContent);
  });

  modalEl.addEventListener('hidden.bs.modal', () => {
    const modalContent = modalEl.querySelector('.modal-content');
    if (modalContent) {
      resetearModal(modalContent);
    }
  });
}

// ===============================
// RENDERIZAR ADICIONALES EN MODAL
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