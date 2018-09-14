const express = require('express');
const Pedidos = require('./../../Modelos/Pedidos');

const router = express.Router();

router.get('/', (req, res) => res.json({ message: 'funciona!'}));

/*
    Obtiene todas los Renglones referidas a un pedido.
    Pueden indicarse las columnas necesarias o bien ninguna para traer todas.
*/
router.get('/:vendedor/:fecha',(req, res) => {

    const {vendedor, fecha} = req.params;

    Pedidos.getAll(vendedor, fecha)
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
    Obtiene todas los Renglones referidas a un pedido.
    Pueden indicarse las columnas necesarias o bien ninguna para traer todas.
*/
router.get('/Detalles/:hojaRuta/:pedido',(req, res) => {

    let {hojaRuta, pedido} = req.params;

    Pedidos.getDetalles(hojaRuta, pedido)
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