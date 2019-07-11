const express = require('express');
const Muestras = require('./../../Modelos/Muestras');

const router = express.Router();

router.get('/', (req, res) => res.json({ message: 'funciona!'}));

router.get('/:vendedor/:anio', (req, res) => {

    let {vendedor, anio} = req.params;

    console.log(req.params);

    Muestras.getAll(vendedor, anio)
        .then((resultados) => res.json(
                { error: false, resultados }
        ))
        .catch((err) => {
            res.json(
                {
                    error: true,
                    resultados: [],
                    ErrorMsg: err.message
                }
            )
        });
});

router.post('/Observaciones',(req, res) => {

    console.log(req.body);

    const {Pedido, Producto, Observacion} = req.body;

    Muestras.guardarObservacion(Pedido, Producto, Observacion)
        .then((resultados) => res.json(
                { error: false, resultados }
        ))
        .catch((err) => {
            res.json(
                {
                    error: true,
                    resultados: false,
                    ErrorMsg: err.message
                }
            )
        });

});

router.get('/Observaciones/:pedido/:codProducto',(req, res) => {

    const {pedido, codProducto} = req.params;

    Muestras.getObservaciones(pedido, codProducto)
        .then((resultados) => res.json(
                { error: false, resultados }
        ))
        .catch((err) => {
            res.json(
                {
                    error: true,
                    resultados: [],
                    ErrorMsg: err.message
                }
            )
        });

});

/*
    Obtiene todas las muestras que cumplan un criterio.
    El criterio puede ser no definido para obtener todos los resultados.
*/
router.get('/Where/:columnas/:condicion?',(req, res) => {

    const {columnas, condicion} = req.params;

    Muestras.getAllWhere(columnas, condicion)
        .then((resultados) => res.json(
                { error: false, resultados }
        ))
        .catch((err) => {
            res.json(
                {
                    error: true,
                    resultados: [],
                    ErrorMsg: err.message
                }
            )
        });

});


module.exports = router;