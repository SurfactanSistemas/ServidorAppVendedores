const express = require('express');
const CtasCtes = require('./../../Modelos/CtasCtes');
const router = express.Router();

router.get('/', (req, res) => res.json({ message: 'funciona!'}));

router.get('/:vendedor',(req, res) => {
    let {vendedor} = req.params;

    CtasCtes.getAll(vendedor)
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

router.get('/:vendedor/:cliente',(req, res) => {
    let {vendedor, cliente} = req.params;

    CtasCtes.getAllCliente(vendedor, cliente)
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