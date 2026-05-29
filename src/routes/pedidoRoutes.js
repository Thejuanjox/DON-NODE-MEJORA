const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedidoController');

router.post('/', pedidoController.registrarPedido);
router.get('/lista', pedidoController.listarPedidos);

module.exports = router;