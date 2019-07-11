const express = require('express');
const Estadisticas = require('./../../Modelos/Estadisticas');

const router = express.Router();

router.get('/', (req, res) => res.json({ message: 'funciona!'}));

/*
    Obtiene todas las muestras referidas a un pedido.
    Pueden indicarse las columnas necesarias o bien ninguna para traer todas.
*/
router.get('/:vendedor/:anio?',(req, res) => {

    let {vendedor, anio} = req.params;

    if (!anio) anio = (new Date()).getFullYear();

    Estadisticas.getAll(vendedor, anio)
        .then((resultados) => {
            res.json(
                { error: false, resultados }
            )}
        )
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

router.get('/Productos/:vendedor/:cliente/:anio',(req, res) => {

    let {vendedor, cliente, anio} = req.params;

    Estadisticas.getAllProductos(vendedor, cliente, anio)
        .then((resultados) => {
            res.json(
                { error: false, resultados }
            )}
        )
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