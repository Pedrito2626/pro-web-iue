const service = require('../services/clientes');

const obtenerPorId = (req, res) => {
    const id = parseInt(req.params.id);
    const clientes = service.leer();
    const cliente = clientes.find(c => c.id === id);
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(cliente);
};

const crear = (req, res) => {
    const { nombre, telefono, email, direccion } = req.body;
    if (!nombre || !telefono || !email) {
        return res.status(400).json({ error: 'Los campos nombre, telefono y email son obligatorios' });
    }
    const clientes = service.leer();
    const nuevo = {
        id: clientes.length > 0 ? Math.max(...clientes.map(c => c.id)) + 1 : 1,
        nombre,
        telefono,
        email,
        direccion: direccion || ''
    };
    clientes.push(nuevo);
    service.guardar(clientes);
    res.status(201).json(nuevo);
};

module.exports = { obtenerPorId, crear };
