const express = require('express');
const HojaRuta = require('./../../../Modelos/Colectora/HojaRuta');
const router = express.Router();

router.get('/:codigo', async (req, res) => {

    try {
        const {codigo} = req.params;
        const resultados = await HojaRuta.Buscar(codigo) ;

        res.json(
            [ ...resultados ]
        );

    } catch (err) {
        
        res.json(
            {
                error: true,
                resultados: [],
                ErrorMsg: err.message
            }
        )

    }

});

router.get('/Etiqueta/:codigo', async (req, res) => {

    try {
        const {codigo} = req.params;
        const resultados = await HojaRuta.BuscarEtiqueta(codigo) ;

        res.json(
            [ ...resultados ]
        );

    } catch (err) {
        
        res.json(
            {
                error: true,
                resultados: [],
                ErrorMsg: err.message
            }
        )

    }

});

module.exports = router;