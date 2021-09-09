import * as express from 'express';
import { getAll, getDetalles, getPendienteDetalle, getPendientes } from './../../Modelos/Pedidos';
import {CustomError} from "../../Utils/CustomError";

const router = express.Router();

/*
Obtiene todas los Renglones referidas a un pedido.
Pueden indicarse las columnas necesarias o bien ninguna para traer todas.
*/
router.get('/Detalles/:hojaRuta(\\d+)/:pedido(\\d+)', async (req, res) => {

    try {
        let { hojaRuta, pedido } = req.params;

        const resultados = await getDetalles(hojaRuta, pedido)

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

/*
    Obtiene todas los Renglones referidas a un pedido.
    Pueden indicarse las columnas necesarias o bien ninguna para traer todas.
*/
router.get('/Pendientes/:vendedor(\\d+)/:soloAutorizado(\\d+)', async (req, res) => {

    try {
        let { vendedor, soloAutorizado } = req.params;

        const resultados = await getPendientes(vendedor, soloAutorizado)

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

router.get('/Pendientes/Detalles/:pedido(\\d+)', async (req, res) => {

    try {

        let { pedido } = req.params;

        const resultados = await getPendienteDetalle(pedido);
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

/*
    Obtiene todas los Renglones referidas a un pedido.
    Pueden indicarse las columnas necesarias o bien ninguna para traer todas.
*/
router.get('/:vendedor(\\d+)/:fecha', async (req, res) => {

    try {
        const { vendedor, fecha } = req.params;

        const resultados = await getAll(vendedor, fecha)

        res.json({ error: false, resultados });

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