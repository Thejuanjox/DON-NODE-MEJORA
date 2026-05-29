let lista_pedidos = [];

function guardar(pedido) {
    lista_pedidos.push(pedido);
}

function obtenerTodos() {
    return lista_pedidos;
}

module.exports = { guardar, obtenerTodos };