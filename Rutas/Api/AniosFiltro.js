const express = require('express');
const AniosFiltro = require('./../../Modelos/AniosFiltro');

const router = express.Router();

/*
    Obtiene todas las muestras referidas a un pedido.
    Pueden indicarse las columnas necesarias o bien ninguna para traer todas.
*/
router.get('/:idvendedor(\\d+)',(req, res) => {

    let {idvendedor} = req.params;

    if (!idvendedor) idvendedor = 99;

    AniosFiltro.getAll(idvendedor)
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

router.get('/Pedidos/:idvendedor(\\d+)',(req, res) => {

    let {idvendedor} = req.params;

    if (!idvendedor) idvendedor = 99;

    AniosFiltro.getAllPedidos(idvendedor)
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