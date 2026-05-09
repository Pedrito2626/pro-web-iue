const API_CONFIG = {
    baseURL: 'http://localhost:3000/api',
    headers: { 'Content-Type': 'application/json' }
};

async function fetchAPI(endpoint, method = 'GET', data = null) {
    return fetchAPIReal(endpoint, method, data);
}

async function fetchAPIReal(endpoint, method = 'GET', data = null) {
    const url = `${API_CONFIG.baseURL}${endpoint}`;
    const options = { method, headers: API_CONFIG.headers };

    if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(url, options);
        if (response.status === 204) return { success: true, status: 204 };

        const contentType = response.headers.get('content-type');
        const responseData = contentType?.includes('application/json')
            ? await response.json()
            : await response.text();

        if (!response.ok) {
            throw {
                status: response.status,
                message: responseData.error || responseData.message || 'Error en la petición',
                data: responseData
            };
        }

        return { success: true, status: response.status, data: responseData };
    } catch (error) {
        return error.status
            ? { success: false, status: error.status, error: error.message, data: error.data }
            : { success: false, error: error.message || 'Error de conexión', data: null };
    }
}

// PRODUCTOS
async function getAllProducts() {
    return fetchAPI('/productos', 'GET');
}

async function searchProducts(searchTerm) {
    return fetchAPI(`/productos/search?q=${encodeURIComponent(searchTerm)}`, 'GET');
}

async function createProduct(productData) {
    return fetchAPI('/productos', 'POST', productData);
}

async function updateProduct(productId, productData) {
    return fetchAPI(`/productos/${productId}`, 'PUT', productData);
}

async function updateProductQuantity(productId, quantity) {
    return fetchAPI(`/productos/${productId}`, 'PATCH', { cantidad: quantity });
}

async function deleteProduct(productId) {
    return fetchAPI(`/productos/${productId}`, 'DELETE');
}

// CLIENTES
async function getClientById(clientId) {
    return fetchAPI(`/clientes/${clientId}`, 'GET');
}

async function createClient(clientData) {
    return fetchAPI('/clientes', 'POST', clientData);
}

// VENTAS
async function createSale(saleData) {
    return fetchAPI('/ventas', 'POST', saleData);
}

// VALIDACIÓN
function validateRequired(data, requiredFields) {
    const errors = [];
    requiredFields.forEach(field => {
        if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
            errors.push(`${field} es requerido`);
        }
    });
    return { validation: errors.length === 0, errors };
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
    return /^[\d\s\-\+\(\)]+$/.test(phone) && phone.length >= 7;
}
