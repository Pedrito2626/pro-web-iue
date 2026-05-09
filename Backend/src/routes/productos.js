const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/productos');

router.get('/search', ctrl.buscar);
router.get('/', ctrl.obtenerTodos);
router.get('/:id', ctrl.obtenerPorId);
router.post('/', ctrl.crear);
router.put('/:id', ctrl.actualizar);
router.patch('/:id', ctrl.actualizarCantidad);
router.delete('/:id', ctrl.eliminar);

module.exports = router;
