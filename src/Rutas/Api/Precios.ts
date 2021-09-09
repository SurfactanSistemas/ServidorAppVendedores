import * as express from 'express';
import { getAll, getAllCliente } from './../../Modelos/Precios';
import {CustomError} from "../../Utils/CustomError";

const router = express.Router();

router.get('/:vendedor/:anio', async (req, res) => {

    try {
        let { vendedor } = req.params;

        const resultados = await getAll(vendedor);

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

router.get('/:vendedor/:anio/:cliente', async (req, res) => {

    try {
        let { vendedor, cliente } = req.params;

        const resultados = await getAllCliente(vendedor, cliente);

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