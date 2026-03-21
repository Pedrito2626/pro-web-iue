/**
 * Aplicación Web para Gestión de Licorera
 * Lógica principal - 800+ líneas
 */

const appState = {
    currentProductId: null,
    allProducts: [],
    currentClients: {},
};

const elements = {
    tabButtons: document.querySelectorAll('.tab-btn'),
    tabContents: document.querySelectorAll('.tab-content'),
    searchInput: document.getElementById('searchInput'),
    clearSearchBtn: document.getElementById('clearSearchBtn'),
    productForm: document.getElementById('productForm'),
    productsList: document.getElementById('productsList'),
    formTitle: document.getElementById('formTitle'),
    cancelEditBtn: document.getElementById('cancelEditBtn'),
    productName: document.getElementById('productName'),
    productPrice: document.getElementById('productPrice'),
    productQuantity: document.getElementById('productQuantity'),
    productCategory: document.getElementById('productCategory'),
    productDescription: document.getElementById('productDescription'),
    saleForm: document.getElementById('saleForm'),
    saleProductId: document.getElementById('saleProductId'),
    saleQuantity: document.getElementById('saleQuantity'),
    saleClientId: document.getElementById('saleClientId'),
    saleClientName: document.getElementById('saleClientName'),
    saleClientPhone: document.getElementById('saleClientPhone'),
    saleClientEmail: document.getElementById('saleClientEmail'),
    saleAmount: document.getElementById('saleAmount'),
    saleResultSection: document.getElementById('saleResultSection'),
    saleResult: document.getElementById('saleResult'),
    newSaleBtn: document.getElementById('newSaleBtn'),
    clientForm: document.getElementById('clientForm'),
    clientName: document.getElementById('clientName'),
    clientPhone: document.getElementById('clientPhone'),
    clientEmail: document.getElementById('clientEmail'),
    clientAddress: document.getElementById('clientAddress'),
    clientSearchId: document.getElementById('clientSearchId'),
    searchClientBtn: document.getElementById('searchClientBtn'),
    clientSearchResult: document.getElementById('clientSearchResult'),
    clientInfo: document.getElementById('clientInfo'),
    clientResultSection: document.getElementById('clientResultSection'),
    clientResult: document.getElementById('clientResult'),
    newClientBtn: document.getElementById('newClientBtn'),
    notification: document.getElementById('notification'),
};

// Utilidades
function showNotification(message, type = 'info') {
    elements.notification.textContent = message;
    elements.notification.className = `notification ${type}`;
    elements.notification.style.display = 'block';
    setTimeout(() => {
        elements.notification.classList.add('hide');
        setTimeout(() => {
            elements.notification.style.display = 'none';
            elements.notification.classList.remove('hide');
        }, 300);
    }, 4000);
}

function clearForm(formElement) {
    formElement.reset();
    appState.currentProductId = null;
    elements.formTitle.textContent = 'Agregar Nuevo Producto';
    elements.cancelEditBtn.style.display = 'none';
}

function switchTab(tabName) {
    elements.tabContents.forEach(tab => tab.classList.remove('active'));
    elements.tabButtons.forEach(btn => btn.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 2,
    }).format(amount);
}

function objectToHTML(obj, options = {}) {
    const hideFields = options.hideFields || [];
    let html = '';
    for (const [key, value] of Object.entries(obj)) {
        if (hideFields.includes(key)) continue;
        let displayValue = value;
        if (key.toLowerCase().includes('precio') || key.toLowerCase().includes('monto') || key === 'total') {
            displayValue = formatCurrency(value);
        }
        const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
        html += `<div class="result-item">
            <div class="result-item-label">${label}</div>
            <div class="result-item-value">${displayValue}</div>
        </div>`;
    }
    return html;
}

// PRODUCTOS
async function loadProducts() {
    elements.productsList.innerHTML = '<p class="loading-message">Cargando productos<span class="loading"></span><span class="loading"></span><span class="loading"></span></p>';

    const response = await getAllProducts();
    if (!response.success) {
        elements.productsList.innerHTML = `<p class="loading-message">Error cargando productos: ${response.error}</p>`;
        return;
    }

    appState.allProducts = response.data || [];
    if (appState.allProducts.length === 0) {
        elements.productsList.innerHTML = '<p class="loading-message">No hay productos registrados</p>';
        return;
    }

    displayProducts(appState.allProducts);
    updateProductSelect();
    showNotification('Productos cargados correctamente', 'success');
}

function displayProducts(products) {
    if (products.length === 0) {
        elements.productsList.innerHTML = '<p class="loading-message">No se encontraron productos</p>';
        return;
    }
    const html = products.map(product => {
        const productId = product.id || product._id;
        return `
            <div class="product-card">
                <div class="product-header">
                    <div class="product-name">${product.nombre || product.name}</div>
                    <span class="product-category">${product.categoria || product.category}</span>
                </div>
                <div class="product-details">
                    <div class="product-detail">
                        <span class="product-detail-label">Precio:</span>
                        <span class="product-detail-value">${formatCurrency(product.precio || product.price)}</span>
                    </div>
                    <div class="product-detail">
                        <span class="product-detail-label">Stock:</span>
                        <span class="product-detail-value">${product.cantidad || product.quantity}</span>
                    </div>
                </div>
                ${product.descripcion || product.description ? `<p class="product-description">${product.descripcion || product.description}</p>` : ''}
                <div class="product-quantity">
                    <label class="product-quantity-label">Ajustar Stock:</label>
                    <input type="number" class="product-quantity-input" value="${product.cantidad || product.quantity}" min="0" data-product-id="${productId}">
                    <button class="btn btn-success btn-update-qty" data-product-id="${productId}">Guardar</button>
                </div>
                <div class="product-actions">
                    <button class="btn btn-info btn-edit" data-product-id="${productId}">Editar</button>
                    <button class="btn btn-danger btn-delete" data-product-id="${productId}">Eliminar</button>
                </div>
            </div>
        `;
    }).join('');
    elements.productsList.innerHTML = html;
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', (e) => editProduct(e.target.dataset.productId));
    });
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', (e) => deleteProductHandler(e.target.dataset.productId));
    });
    document.querySelectorAll('.btn-update-qty').forEach(btn => {
        btn.addEventListener('click', (e) => updateQuantityHandler(e.target.dataset.productId));
    });
}

async function searchProductsHandler(searchTerm) {
    if (!searchTerm.trim()) {
        loadProducts();
        return;
    }
    elements.productsList.innerHTML = '<p class="loading-message">Buscando productos<span class="loading"></span><span class="loading"></span><span class="loading"></span></p>';
    const response = await searchProducts(searchTerm);
    if (!response.success) {
        elements.productsList.innerHTML = `<p class="loading-message">Error en búsqueda: ${response.error}</p>`;
        return;
    }
    const results = response.data.data || response.data || [];
    displayProducts(results);
}

async function editProduct(productId) {
    const product = appState.allProducts.find(p => (p.id || p._id) == productId);
    if (!product) {
        showNotification('Producto no encontrado', 'error');
        return;
    }
    appState.currentProductId = productId;
    elements.formTitle.textContent = 'Editar Producto';
    elements.cancelEditBtn.style.display = 'inline-block';
    elements.productName.value = product.nombre || product.name;
    elements.productPrice.value = product.precio || product.price;
    elements.productQuantity.value = product.cantidad || product.quantity;
    elements.productCategory.value = product.categoria || product.category;
    elements.productDescription.value = product.descripcion || product.description || '';
    document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
}

async function deleteProductHandler(productId) {
    if (!confirm('¿Está seguro de que desea eliminar este producto?')) return;
    const response = await deleteProduct(productId);
    if (!response.success) {
        showNotification(`Error al eliminar: ${response.error}`, 'error');
        return;
    }
    showNotification('Producto eliminado correctamente', 'success');
    loadProducts();
}

async function updateQuantityHandler(productId) {
    const input = document.querySelector(`[data-product-id="${productId}"]`);
    const newQuantity = parseInt(input.value);
    if (isNaN(newQuantity) || newQuantity < 0) {
        showNotification('Cantidad inválida', 'error');
        return;
    }
    const response = await updateProductQuantity(productId, newQuantity);
    if (!response.success) {
        showNotification(`Error al actualizar cantidad: ${response.error}`, 'error');
        return;
    }
    showNotification('Cantidad actualizada correctamente', 'success');
    loadProducts();
}

async function handleProductFormSubmit(e) {
    e.preventDefault();
    const productData = {
        nombre: elements.productName.value,
        precio: parseFloat(elements.productPrice.value),
        cantidad: parseInt(elements.productQuantity.value),
        categoria: elements.productCategory.value,
    };
    if (elements.productDescription.value) {
        productData.descripcion = elements.productDescription.value;
    }
    if (!productData.nombre || productData.precio <= 0 || productData.cantidad < 0) {
        showNotification('Por favor completa todos los campos requeridos correctamente', 'error');
        return;
    }
    let response;
    if (appState.currentProductId) {
        response = await updateProduct(appState.currentProductId, productData);
    } else {
        response = await createProduct(productData);
    }
    if (!response.success) {
        showNotification(`Error: ${response.error}`, 'error');
        return;
    }
    const action = appState.currentProductId ? 'actualizado' : 'creado';
    showNotification(`Producto ${action} correctamente`, 'success');
    clearForm(elements.productForm);
    loadProducts();
}

function updateProductSelect() {
    elements.saleProductId.innerHTML = '<option value="">Seleccionar producto...</option>';
    appState.allProducts.forEach(product => {
        const productId = product.id || product._id;
        const option = document.createElement('option');
        option.value = productId;
        option.textContent = `${product.nombre || product.name} - ${formatCurrency(product.precio || product.price)} (Stock: ${product.cantidad || product.quantity})`;
        elements.saleProductId.appendChild(option);
    });
}

// VENTAS
function calculateSaleAmount() {
    const productId = elements.saleProductId.value;
    const quantity = parseInt(elements.saleQuantity.value) || 0;
    if (!productId || quantity <= 0) {
        elements.saleAmount.value = '';
        return;
    }
    const product = appState.allProducts.find(p => (p.id || p._id) == productId);
    if (!product) {
        elements.saleAmount.value = '';
        return;
    }
    const price = product.precio || product.price;
    const total = price * quantity;
    elements.saleAmount.value = formatCurrency(total);
}

async function handleSaleFormSubmit(e) {
    e.preventDefault();
    const productId = elements.saleProductId.value;
    const quantity = parseInt(elements.saleQuantity.value);
    let clientId = elements.saleClientId.value.trim();
    const clientName = elements.saleClientName.value.trim();
    const clientPhone = elements.saleClientPhone.value.trim();
    const clientEmail = elements.saleClientEmail.value.trim();

    if (!productId || quantity <= 0) {
        showNotification('Selecciona un producto y cantidad válida', 'error');
        return;
    }

    if (clientId && (!validatePhone(clientPhone) || !validateEmail(clientEmail))) {
        showNotification('Si se provee ID de cliente, también debe tener datos de contacto válidos', 'error');
        return;
    }

    // Crear cliente nuevo cuando no hay ID y se proveen datos completos
    if (!clientId && clientName && clientPhone && clientEmail) {
        if (!validateEmail(clientEmail)) {
            showNotification('Email inválido', 'error');
            return;
        }
        if (!validatePhone(clientPhone)) {
            showNotification('Teléfono inválido', 'error');
            return;
        }

        const clientResponse = await createClient({
            nombre: clientName,
            telefono: clientPhone,
            email: clientEmail
        });

        if (!clientResponse.success) {
            showNotification(`Error al registrar cliente en venta: ${clientResponse.error}`, 'error');
            return;
        }

        clientId = clientResponse.data.id || clientResponse.data._id;
        showNotification('Cliente registrado correctamente como parte de la venta', 'success');
        elements.saleClientId.value = clientId;
    }

    const saleData = { productoId: productId, cantidad: quantity };
    if (clientId) {
        saleData.clienteId = clientId;
    }

    const response = await createSale(saleData);
    if (!response.success) {
        showNotification(`Error al registrar venta: ${response.error}`, 'error');
        return;
    }

    showNotification('Venta registrada correctamente', 'success');
    elements.saleForm.style.display = 'none';
    elements.saleResultSection.style.display = 'block';
    elements.saleResult.innerHTML = objectToHTML(response.data.data || response.data);
    loadProducts();
}

function handleNewSale() {
    elements.saleForm.style.display = 'block';
    elements.saleResultSection.style.display = 'none';
    elements.saleForm.reset();
    elements.saleAmount.value = '';
}

// CLIENTES
async function handleSearchClient() {
    const clientId = elements.clientSearchId.value.trim();
    if (!clientId) {
        showNotification('Ingresa un ID de cliente', 'error');
        return;
    }
    const response = await getClientById(clientId);
    if (!response.success) {
        showNotification(`Cliente no encontrado`, 'error');
        elements.clientSearchResult.style.display = 'none';
        return;
    }
    elements.clientInfo.innerHTML = objectToHTML(response.data.data || response.data);
    elements.clientSearchResult.style.display = 'block';
    showNotification('Cliente encontrado', 'success');
}

async function handleClientFormSubmit(e) {
    e.preventDefault();
    const clientData = {
        nombre: elements.clientName.value,
        telefono: elements.clientPhone.value,
        email: elements.clientEmail.value,
    };
    if (elements.clientAddress.value) {
        clientData.direccion = elements.clientAddress.value;
    }
    const validation = validateRequired(clientData, ['nombre', 'telefono', 'email']);
    if (!validation.validation) {
        showNotification(`Campos requeridos`, 'error');
        return;
    }
    if (!validateEmail(clientData.email)) {
        showNotification('Email inválido', 'error');
        return;
    }
    if (!validatePhone(clientData.telefono)) {
        showNotification('Teléfono inválido', 'error');
        return;
    }
    const response = await createClient(clientData);
    if (!response.success) {
        showNotification(`Error al registrar cliente: ${response.error}`, 'error');
        return;
    }
    showNotification('Cliente registrado correctamente', 'success');
    elements.clientForm.style.display = 'none';
    elements.clientResultSection.style.display = 'block';
    elements.clientResult.innerHTML = objectToHTML(response.data.data || response.data);
}

function handleNewClient() {
    elements.clientForm.style.display = 'block';
    elements.clientResultSection.style.display = 'none';
    elements.clientForm.reset();
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    elements.tabButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            switchTab(e.target.dataset.tab);
        });
    });
    elements.productForm.addEventListener('submit', handleProductFormSubmit);
    elements.searchInput.addEventListener('input', (e) => {
        searchProductsHandler(e.target.value);
    });
    elements.clearSearchBtn.addEventListener('click', () => {
        elements.searchInput.value = '';
        loadProducts();
    });
    elements.cancelEditBtn.addEventListener('click', () => {
        clearForm(elements.productForm);
    });
    elements.saleForm.addEventListener('submit', handleSaleFormSubmit);
    elements.saleProductId.addEventListener('change', calculateSaleAmount);
    elements.saleQuantity.addEventListener('input', calculateSaleAmount);
    elements.newSaleBtn.addEventListener('click', handleNewSale);
    elements.clientForm.addEventListener('submit', handleClientFormSubmit);
    elements.searchClientBtn.addEventListener('click', handleSearchClient);
    elements.clientSearchId.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearchClient();
    });
    elements.newClientBtn.addEventListener('click', handleNewClient);
    showNotification('Aplicación lista para usar', 'info');
});
