const express = require('express');
const Login = require('./../../Modelos/Login');
const router = express.Router();

router.get('/:clave',(req, res) => {
    const {clave} = req.params;

    Login.logIn(clave)
        .then((resultados) => {
            res.json(
                { error: false, resultados }
            );
        })
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