/**
 * API Service - Gestor de peticiones REST
 */

const API_CONFIG = {
    baseURL: 'http://localhost:3000/api',
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json',
    }
};

// Datos de prueba para desarrollo sin backend
const mockData = {
    products: [
        { id: '1', nombre: 'Whisky Johnnie Walker Red Label', precio: 45.99, cantidad: 25, categoria: 'Whisky', descripcion: 'Whisky escocés clásico, suave y accesible' },
        { id: '2', nombre: 'Vodka Absolut', precio: 29.99, cantidad: 40, categoria: 'Vodka', descripcion: 'Vodka sueco premium, puro y cristalino' },
        { id: '9', nombre: 'Licor de Café Kahlúa', precio: 34.50, cantidad: 22, categoria: 'Licor', descripcion: 'Sabor intenso a café y vainilla, ideal para cócteles y postres' },
        { id: '10', nombre: 'Coñac Hennessy VS', precio: 99.99, cantidad: 12, categoria: 'Coñac', descripcion: 'Coñac francés fino con notas de frutas secas y roble' },
        { id: '11', nombre: 'Cerveza artesanal IPA', precio: 6.99, cantidad: 72, categoria: 'Cerveza', descripcion: 'IPA con lúpulo cítrico y amargor balanceado' },
        { id: '3', nombre: 'Ron Bacardi Superior', precio: 24.99, cantidad: 30, categoria: 'Ron', descripcion: 'Ron blanco cubano, versátil para cócteles' },
        { id: '4', nombre: 'Tequila Jose Cuervo Especial', precio: 39.99, cantidad: 20, categoria: 'Tequila', descripcion: 'Tequila 100% de agave, perfecto para margaritas' },
        { id: '5', nombre: 'Gin Tanqueray London Dry', precio: 34.99, cantidad: 15, categoria: 'Gin', descripcion: 'Gin inglés premium con notas cítricas' },
        { id: '6', nombre: 'Cerveza Corona Extra', precio: 2.49, cantidad: 100, categoria: 'Cerveza', descripcion: 'Cerveza mexicana lager, refrescante' },
        { id: '7', nombre: 'Vino Tinto Cabernet Sauvignon', precio: 19.99, cantidad: 35, categoria: 'Vino', descripcion: 'Vino tinto robusto con taninos suaves' },
        { id: '8', nombre: 'Champagne Moët & Chandon', precio: 89.99, cantidad: 10, categoria: 'Champagne', descripcion: 'Champagne francés premium para ocasiones especiales' }
    ],
    clients: [
        { id: '1', nombre: 'Juan Pérez', email: 'juan.perez@email.com', telefono: '+1234567890', direccion: 'Calle Principal 123' },
        { id: '2', nombre: 'María García', email: 'maria.garcia@email.com', telefono: '+1234567891', direccion: 'Avenida Central 456' },
        { id: '3', nombre: 'Carlos Rodríguez', email: 'carlos.rodriguez@email.com', telefono: '+1234567892', direccion: 'Plaza Mayor 789' }
    ],
    sales: [
        { id: '1', clienteId: '1', productos: [{ productoId: '1', cantidad: 2, precio: 45.99 }, { productoId: '6', cantidad: 6, precio: 2.49 }], total: 107.94, fecha: '2024-01-15' },
        { id: '2', clienteId: '2', productos: [{ productoId: '3', cantidad: 1, precio: 24.99 }, { productoId: '5', cantidad: 1, precio: 34.99 }], total: 59.98, fecha: '2024-01-16' }
    ]
};

// Función para simular delay de red
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Función para simular respuesta de API con datos de prueba
async function mockAPIResponse(data, success = true) {
    await delay(300); // Simular delay de red
    return success ? { success: true, status: 200, data: data } : { success: false, error: 'Error simulado', data: null };
}

async function fetchAPI(endpoint, method = 'GET', data = null) {
    // Para desarrollo, usar datos de prueba en lugar de llamadas reales
    // Descomenta la siguiente línea para usar backend real
    // return fetchAPIReal(endpoint, method, data);
    
    return mockAPIResponse(await handleMockRequest(endpoint, method, data));
}

async function handleMockRequest(endpoint, method, data) {
    const path = endpoint.split('?')[0];
    const query = endpoint.includes('?') ? new URLSearchParams(endpoint.split('?')[1]) : null;
    
    if (path === '/productos') {
        if (method === 'GET') {
            return mockData.products;
        } else if (method === 'POST') {
            const newProduct = { ...data, id: String(mockData.products.length + 1) };
            mockData.products.push(newProduct);
            return newProduct;
        }
    } else if (path.startsWith('/productos/') && !path.includes('/search')) {
        const productId = path.split('/productos/')[1];
        if (method === 'GET') {
            const product = mockData.products.find(p => p.id === productId);
            return product || null;
        } else if (method === 'PUT') {
            const index = mockData.products.findIndex(p => p.id === productId);
            if (index !== -1) {
                mockData.products[index] = { ...mockData.products[index], ...data };
                return mockData.products[index];
            }
        } else if (method === 'PATCH') {
            const index = mockData.products.findIndex(p => p.id === productId);
            if (index !== -1) {
                mockData.products[index] = { ...mockData.products[index], ...data };
                return mockData.products[index];
            }
        } else if (method === 'DELETE') {
            const index = mockData.products.findIndex(p => p.id === productId);
            if (index !== -1) {
                mockData.products.splice(index, 1);
                return { message: 'Producto eliminado' };
            }
        }
    } else if (path === '/productos/search') {
        const searchTerm = query.get('q').toLowerCase();
        const results = mockData.products.filter(p => 
            p.nombre.toLowerCase().includes(searchTerm) || 
            p.categoria.toLowerCase().includes(searchTerm) ||
            p.descripcion.toLowerCase().includes(searchTerm)
        );
        return results;
    } else if (path === '/clientes') {
        if (method === 'POST') {
            const newClient = { ...data, id: String(mockData.clients.length + 1) };
            mockData.clients.push(newClient);
            return newClient;
        }
    } else if (path.startsWith('/clientes/')) {
        const clientId = path.split('/clientes/')[1];
        if (method === 'GET') {
            const client = mockData.clients.find(c => c.id === clientId);
            return client || null;
        }
    } else if (path === '/ventas') {
        if (method === 'POST') {
            const newSale = { ...data, id: String(mockData.sales.length + 1), fecha: new Date().toISOString().split('T')[0] };
            mockData.sales.push(newSale);
            return newSale;
        }
    }
    
    return null;
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
        let responseData = contentType?.includes('application/json') 
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
        return error.status ? {
            success: false,
            status: error.status,
            error: error.message,
            data: error.data
        } : {
            success: false,
            error: error.message || 'Error de conexión',
            data: null
        };
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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePhone(phone) {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone) && phone.length >= 7;
}
