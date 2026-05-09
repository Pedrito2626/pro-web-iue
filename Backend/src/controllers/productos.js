const service = require('../services/productos');

const obtenerTodos = (req, res) => {
    res.json(service.leer());
};

const buscar = (req, res) => {
    const q = (req.query.q || '').toLowerCase();
    const productos = service.leer();
    const resultados = productos.filter(p =>
        p.nombre.toLowerCase().includes(q) ||
        p.categoria.toLowerCase().includes(q) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(q))
    );
    res.json(resultados);
};

const obtenerPorId = (req, res) => {
    const id = parseInt(req.params.id);
    const productos = service.leer();
    const producto = productos.find(p => p.id === id);
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(producto);
};

const crear = (req, res) => {
    const { nombre, precio, cantidad, categoria, descripcion } = req.body;
    if (!nombre || precio === undefined || cantidad === undefined || !categoria) {
        return res.status(400).json({ error: 'Los campos nombre, precio, cantidad y categoria son obligatorios' });
    }
    const productos = service.leer();
    const nuevo = {
        id: productos.length > 0 ? Math.max(...productos.map(p => p.id)) + 1 : 1,
        nombre,
        precio: parseFloat(precio),
        cantidad: parseInt(cantidad),
        categoria,
        descripcion: descripcion || ''
    };
    productos.push(nuevo);
    service.guardar(productos);
    res.status(201).json(nuevo);
};

const actualizar = (req, res) => {
    const id = parseInt(req.params.id);
    const productos = service.leer();
    const indice = productos.findIndex(p => p.id === id);
    if (indice === -1) return res.status(404).json({ error: 'Producto no encontrado' });

    const { nombre, precio, cantidad, categoria, descripcion } = req.body;
    if (!nombre || precio === undefined || cantidad === undefined || !categoria) {
        return res.status(400).json({ error: 'Los campos nombre, precio, cantidad y categoria son obligatorios' });
    }

    productos[indice] = { id, nombre, precio: parseFloat(precio), cantidad: parseInt(cantidad), categoria, descripcion: descripcion || '' };
    service.guardar(productos);
    res.json(productos[indice]);
};

const actualizarCantidad = (req, res) => {
    const id = parseInt(req.params.id);
    const productos = service.leer();
    const indice = productos.findIndex(p => p.id === id);
    if (indice === -1) return res.status(404).json({ error: 'Producto no encontrado' });

    const { cantidad } = req.body;
    if (cantidad === undefined || isNaN(parseInt(cantidad))) {
        return res.status(400).json({ error: 'El campo cantidad es obligatorio' });
    }

    productos[indice].cantidad = parseInt(cantidad);
    service.guardar(productos);
    res.json(productos[indice]);
};

const eliminar = (req, res) => {
    const id = parseInt(req.params.id);
    const productos = service.leer();
    const indice = productos.findIndex(p => p.id === id);
    if (indice === -1) return res.status(404).json({ error: 'Producto no encontrado' });

    productos.splice(indice, 1);
    service.guardar(productos);
    res.status(204).send();
};

module.exports = { obtenerTodos, buscar, obtenerPorId, crear, actualizar, actualizarCantidad, eliminar };
