const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/clientes');

router.get('/:id', ctrl.obtenerPorId);
router.post('/', ctrl.crear);

module.exports = router;
