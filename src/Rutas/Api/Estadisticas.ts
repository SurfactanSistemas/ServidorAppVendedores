import * as express from 'express';
import { getAll, getAllProductos } from './../../Modelos/Estadisticas';
import {IError} from "../../Utils/Types";

const router = express.Router();

/*
    Obtiene todas las muestras referidas a un pedido.
    Pueden indicarse las columnas necesarias o bien ninguna para traer todas.
*/
router.get('/:vendedor/:anio?', async (req, res) => {
    try {

        let { vendedor, anio } = req.params;

        if (!anio) anio = (new Date()).getFullYear().toString();

        const resultados = await getAll(vendedor, anio)

        res.json(
            { error: false, resultados }
        )

    } catch (err) {

        res.json(
            {
                error: true,
                resultados: [],
                ErrorMsg: (err as IError).originalError.info.message,
            }
        )

    }
});

router.get('/Productos/:vendedor/:cliente/:anio', async (req, res) => {

    try {

        let { vendedor, cliente, anio } = req.params;

        const resultados = await getAllProductos(vendedor, cliente, anio)

        res.json(
            { error: false, resultados }
        )

    } catch (err) {

        res.json(
            {
                error: true,
                resultados: [],
                ErrorMsg: (err as IError).originalError.info.message,
            }
        )

    }
});

export default router;