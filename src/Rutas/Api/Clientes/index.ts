import * as express from "express";
import {Login, Registrado} from "../../../Modelos/Clientes/Login";
import {Register} from "../../../Modelos/Clientes/Register";
import * as FDS from "../../../Modelos/Clientes/FDS";
import * as HojasTecnicas from "../../../Modelos/Clientes/HojasTecnicas";

import {CustomError} from "../../../Utils/CustomError";

const router = express.Router();

router.get('/Registrado/:cuil', async (req, res) => {
    try {

        const { cuil } = req.params;

        const resultados = await Registrado(cuil);

        res.json({ error: false, resultados, errorMsg: '' });

    } catch (err) {
        res.json(
            {
                error: true,
                resultados: [],
                ErrorMsg: (err as CustomError).toString(),
            }
        )
    }
});

router.get('/Registro/:cuil/:clave', async (req, res) => {
    try {

        const { cuil, clave } = req.params;

        const resultados = await Register(cuil, clave);

        res.json({ error: false, resultados, errorMsg: '' });

    } catch (err) {
        res.json(
            {
                error: true,
                resultados: [],
                ErrorMsg: (err as CustomError).toString(),
            }
        )
    }
});

router.get('/FDS/:cuil', async (req, res) => {
    try {

        const { cuil } = req.params;

        const resultados = await FDS.getAll(cuil);

        res.json({ error: false, resultados, errorMsg: '' });

    } catch (err) {
        res.json(
            {
                error: true,
                resultados: [],
                ErrorMsg: (err as CustomError).toString(),
            }
        )
    }
});

router.get('/HojasTecnicas/:cuil', async (req, res) => {
    try {

        const { cuil } = req.params;

        const resultados = await HojasTecnicas.getAll(cuil);

        res.json({ error: false, resultados, errorMsg: '' });

    } catch (err) {
        res.json(
            {
                error: true,
                resultados: [],
                ErrorMsg: (err as CustomError).toString(),
            }
        )
    }
});

router.get('/:cuil/:clave', async (req, res) => {
    try {

        const { cuil, clave } = req.params;

        const resultados = await Login(cuil, clave);

        res.json({ error: false, resultados, errorMsg: '' });

    } catch (err) {
        res.json(
            {
                error: true,
                resultados: [],
                ErrorMsg: (err as CustomError).toString(),
            }
        )
    }
});

export default router;