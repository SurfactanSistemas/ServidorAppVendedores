import * as express from 'express';
import { getAll, getAllCliente } from './../../Modelos/CtasCtes';
import {CustomError} from "../../Utils/CustomError";

const router = express.Router();

router.get('/:vendedor', async (req, res) => {
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

router.get('/:vendedor/:cliente', async (req, res) => {
    try {
        let { cliente } = req.params;

        const resultados = await getAllCliente(cliente)
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
