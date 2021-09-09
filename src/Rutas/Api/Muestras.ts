import * as express from 'express';
import { getAll, getAllWhere, getObservaciones, guardarObservacion } from './../../Modelos/Muestras';
import {CustomError} from "../../Utils/CustomError";

const router = express.Router();

router.get('/:vendedor/:anio', async (req, res) => {
    try {
        let { vendedor, anio } = req.params;

        const resultados = await getAll(vendedor, anio);

        res.json(
            { error: false, resultados }
        );

    } catch (err) {
        res.json(
            {
                error: true,
                resultados: [],
                ErrorMsg: (err as CustomError).toString()
            }
        )
    }
});

router.post('/Observaciones', async (req, res) => {
    try {
        const { Pedido, Producto, Observacion } = req.body;

        const resultados = await guardarObservacion(Pedido, Producto, Observacion);

        res.json(
            { error: false, resultados }
        )

    } catch (err) {
        res.json(
            {
                error: true,
                resultados: false,
                ErrorMsg: (err as CustomError).toString()
            }
        )
    }
});

router.get('/Observaciones/:pedido/:codProducto', async (req, res) => {
    try {
        const { pedido, codProducto } = req.params;

        const resultados = await getObservaciones(pedido, codProducto);

        res.json(
            { error: false, resultados }
        )

    } catch (err) {
        res.json(
            {
                error: true,
                resultados: [],
                ErrorMsg: (err as CustomError).toString()
            }
        )
    }
});

router.get('/Where/:columnas/:condicion?', async (req, res) => {

    try {

        const { columnas, condicion } = req.params;

        const resultados = await getAllWhere(columnas, condicion)

        res.json(
            { error: false, resultados }
        )

    } catch (err) {
        res.json(
            {
                error: true,
                resultados: [],
                ErrorMsg: (err as CustomError).toString()
            }
        )
    }
});

export default router;