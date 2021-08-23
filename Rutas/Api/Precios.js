const express = require('express');
const Precios = require('./../../Modelos/Precios');

const router = express.Router();

router.get('/', (req, res) => res.json({ message: 'funciona!'}));

/*
    Obtiene todas las muestras referidas a un pedido.
    Pueden indicarse las columnas necesarias o bien ninguna para traer todas.
*/
router.get('/:vendedor/:anio',(req, res) => {

    let {vendedor, anio} = req.params;

    if (!anio) anio = (new Date()).getFullYear();

    Precios.getAll(vendedor, anio)
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

router.get('/:vendedor/:anio/:cliente',(req, res) => {

    let {vendedor, anio, cliente} = req.params;

    if (!anio) anio = (new Date()).getFullYear();

    Precios.getAllCliente(vendedor, anio, cliente)
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