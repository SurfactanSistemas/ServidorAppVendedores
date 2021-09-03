import * as express from "express";
// const express = require('express');
// const Login = require('./../../Modelos/Login');
import { logIn } from "../../Modelos/Login";
const router = express.Router();

router.get('/:clave', async (req, res) => {
    try {
        const { clave } = req.params;

        const resultados = await logIn(clave);
        res.json({ error: false, resultados });

    } catch (err) {
        res.json(
            {
                error: true,
                resultados: [],
                ErrorMsg: err
            }
        )
    }
});