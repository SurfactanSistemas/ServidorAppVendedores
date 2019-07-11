const express = require('express');
const Pedidos = require('./../../Modelos/Pedidos');

const router = express.Router();

router.get('/', (req, res) => res.json({ message: 'funciona!'}));

/*
Obtiene todas los Renglones referidas a un pedido.
Pueden indicarse las columnas necesarias o bien ninguna para traer todas.
*/
router.get('/Detalles/:hojaRuta(\\d+)/:pedido(\\d+)',(req, res) => {
    
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

/*
    Obtiene todas los Renglones referidas a un pedido.
    Pueden indicarse las columnas necesarias o bien ninguna para traer todas.
*/
router.get('/Pendientes/:vendedor(\\d+)/:soloAutorizado(\\d+)',(req, res) => {

    let {vendedor, soloAutorizado} = req.params;

    Pedidos.getPendientes(vendedor, soloAutorizado)
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
   
router.get('/Pendientes/Detalles/:pedido(\\d+)',(req, res) => {

    let {pedido} = req.params;

    Pedidos.getPendienteDetalle(pedido)
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
router.get('/:vendedor(\\d+)/:fecha',(req, res) => {

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
        module.exports = router;