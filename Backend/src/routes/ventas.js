const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/ventas');

router.post('/', ctrl.crear);

module.exports = router;
