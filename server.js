const express = require('express');
const rutasPedidos = require('./src/routes/pedidoRoutes');

const app = express();
const PORT = 3000;

app.use(express.urlencoded({extended: true}));

app.use(express.static('public'));

app.use('/pedidos', rutasPedidos);

app.listen(PORT, () => {
    console.log('Servidor de Don node corriendo');
});
