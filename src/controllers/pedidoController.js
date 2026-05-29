const PedidoModel = require('../models/pedidoModel');

function registrarPedido(req, res) {
    let { nom_cliente, tamano, ingredientes, cantidad } = req.body;

    if (!ingredientes) {
        return res.send(`
            <h2 style="color:red; text-align:center; margin-top:50px;">
                Atencion: Debes seleccionar al menos un ingrediente. 
                <br><a href="/">Volver</a>
            </h2>
        `);
    }

    let arregloIngredientes = [];
    if (Array.isArray(ingredientes)) {
        arregloIngredientes = ingredientes;
    } else {
        arregloIngredientes = [ingredientes];
    }

    const cantIng = arregloIngredientes.length;
    let extras = cantIng - 3;
    if (extras < 0) {
        extras = 0;
    }

    let preBase = 0;
    let valExtra = 0;

    if (tamano === 'Chica') {
        preBase = 3990;
        valExtra = 500;
    } else if (tamano === 'Mediana') {
        preBase = 5990;
        valExtra = 800;
    } else if (tamano === 'Grande') {
        preBase = 8490;
        valExtra = 1200;
    }

    const preUnitario = preBase + (extras * valExtra);
    const numCant = parseInt(cantidad);
    const totalVenta = preUnitario * numCant;

    const nuevoPedido = {
        cliente: nom_cliente,
        tamano: tamano,
        detalleIngredientes: arregloIngredientes.join(', '),
        precio_uni: preUnitario,
        cant: numCant,
        total: totalVenta
    };

    PedidoModel.guardar(nuevoPedido);
    
    res.send(`
        <!DOCTYPE html>
        <html lang="es" data-bs-theme="light">
        <head>
            <meta charset="UTF-8">
            <title>Boleta de Pedido</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
            <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
        </head>
        <body class="d-flex align-items-center justify-content-center bg-secondary-subtle" style="min-height: 100vh; padding: 20px;">
            
            <script>
                if(localStorage.getItem('temaDonNode') === 'dark') {
                    document.documentElement.setAttribute('data-bs-theme', 'dark');
                }
            </script>

            <div class="card shadow p-4" style="max-width: 450px; width: 100%;" id="contenedor-boleta">
                <div class="text-center mb-3">
                    <h2 class="text-danger fw-bold">Don Node</h2>
                    <h5 class="text-muted">Comprobante de Pago</h5>
                    <hr>
                    <p class="fs-5">Pedido recibido, <strong>${nom_cliente}</strong>!</p>
                </div>
                
                <ul class="list-group list-group-flush mb-4 shadow-sm">
                    <li class="list-group-item d-flex justify-content-between">
                        <span>Tamano de Pizza:</span> <strong>${tamano}</strong>
                    </li>
                    <li class="list-group-item d-flex justify-content-between">
                        <span>Ingredientes Extras:</span> <strong>${extras}</strong>
                    </li>
                    <li class="list-group-item d-flex justify-content-between">
                        <span>Precio Unitario:</span> <strong>$${preUnitario.toLocaleString('es-CL')}</strong>
                    </li>
                    <li class="list-group-item d-flex justify-content-between">
                        <span>Cantidad solicitada:</span> <strong>${numCant}</strong>
                    </li>
                    <li class="list-group-item d-flex justify-content-between bg-body-tertiary mt-2">
                        <span class="fs-5"><strong>Total Final:</strong></span> 
                        <strong class="text-success fs-4">$${totalVenta.toLocaleString('es-CL')}</strong>
                    </li>
                </ul>

                <div class="d-grid gap-2" id="panel-botones">
                    <button onclick="bajarPDF()" class="btn btn-primary">Descargar Boleta (PDF)</button>
                    <a href="/pedidos/lista" class="btn btn-danger">Ver todos los pedidos</a>
                    <a href="/" class="btn btn-outline-secondary">Crear nueva orden</a>
                </div>
            </div>

            <script>
                function bajarPDF() {
                    const elemento = document.getElementById('contenedor-boleta');
                    const acciones = document.getElementById('panel-botones');
                    
                    acciones.style.display = 'none';
                    
                    html2pdf().set({
                        margin: 12,
                        filename: 'Boleta_DonNode_${nom_cliente}.pdf',
                        image: { type: 'jpeg', quality: 0.98 },
                        html2canvas: { scale: 2 },
                        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                    }).from(elemento).save().then(() => {
                        acciones.style.display = 'grid';
                    });
                }
            </script>
        </body>
        </html>
    `);
}

function listarPedidos(req, res) {
    const todosLosPedidos = PedidoModel.obtenerTodos();

    let acumuladoFinal = 0;
    let filasTabla = '';

    let ventaMasAlta = 0;
    let nombreMasCaro = '';

    todosLosPedidos.forEach(p => {
        acumuladoFinal += p.total;
        
        if (p.total > ventaMasAlta) {
            ventaMasAlta = p.total;
            nombreMasCaro = p.cliente;
        }

        filasTabla += `
            <tr>
                <td>${p.cliente}</td>
                <td>${p.tamano}</td>
                <td>${p.detalleIngredientes}</td>
                <td>$${p.precio_uni}</td>
                <td>${p.cant}</td>
                <td class="fw-bold">$${p.total}</td>
            </tr>
        `;
    });

    res.send(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>Lista de Pedidos</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
        </head>
        <body class="container mt-5">
            <script>
                if(localStorage.getItem('temaDonNode') === 'dark') {
                    document.documentElement.setAttribute('data-bs-theme', 'dark');
                }
            </script>

            <h1 class="mb-4">Pedidos registrados</h1>
            <a class="btn btn-secondary mb-3" href="/">Volver a registrar</a>

            ${todosLosPedidos.length === 0 ? 
                '<div class="alert alert-warning">Aun no hay pedidos en el sistema</div>' 
                : `
                <table class="table table-bordered table-striped shadow-sm">
                    <thead class="table-dark">
                        <tr>
                            <th>Cliente</th>
                            <th>Tamano</th>
                            <th>Ingredientes</th>
                            <th>Valor unitario</th>
                            <th>Cant.</th>
                            <th>Total pedido</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filasTabla}
                    </tbody>
                    <tfoot class="table-warning">
                        <tr>
                            <th colspan="5" class="text-end">Total acumulado del dia:</th>
                            <th class="fs-5">$${acumuladoFinal}</th>
                        </tr>
                    </tfoot>
                </table>

                ${ventaMasAlta > 0 ? 
                    `<div class="alert alert-success mt-3">
                        <strong> Dato extra:</strong> La compra mas grande la hizo <strong>${nombreMasCaro}</strong> por un total de <strong>$${ventaMasAlta}</strong>.
                    </div>` 
                : ''}
            `}
        </body>
        </html>
    `);
}

module.exports = { registrarPedido, listarPedidos };