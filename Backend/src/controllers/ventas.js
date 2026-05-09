const serviceVentas = require('../services/ventas');
const serviceProductos = require('../services/productos');
const serviceClientes = require('../services/clientes');

const crear = (req, res) => {
    const { productoId, cantidad, clienteId } = req.body;

    if (!productoId || cantidad === undefined) {
        return res.status(400).json({ error: 'Los campos productoId y cantidad son obligatorios' });
    }

    const cantidadNum = parseInt(cantidad);
    if (isNaN(cantidadNum) || cantidadNum <= 0) {
        return res.status(400).json({ error: 'La cantidad debe ser un número positivo' });
    }

    const productos = serviceProductos.leer();
    const idProducto = parseInt(productoId);
    const indiceProducto = productos.findIndex(p => p.id === idProducto);

    if (indiceProducto === -1) {
        return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const producto = productos[indiceProducto];

    if (producto.cantidad < cantidadNum) {
        return res.status(400).json({ error: `Stock insuficiente. Disponible: ${producto.cantidad}` });
    }

    if (clienteId) {
        const clientes = serviceClientes.leer();
        const cliente = clientes.find(c => c.id === parseInt(clienteId));
        if (!cliente) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }
    }

    const total = parseFloat((producto.precio * cantidadNum).toFixed(2));

    const ventas = serviceVentas.leer();
    const nuevaVenta = {
        id: ventas.length > 0 ? Math.max(...ventas.map(v => v.id)) + 1 : 1,
        productoId: idProducto,
        cantidad: cantidadNum,
        total,
        fecha: new Date().toISOString().split('T')[0],
        ...(clienteId && { clienteId: parseInt(clienteId) })
    };

    productos[indiceProducto].cantidad -= cantidadNum;
    serviceProductos.guardar(productos);

    ventas.push(nuevaVenta);
    serviceVentas.guardar(ventas);

    res.status(201).json(nuevaVenta);
};

module.exports = { crear };
