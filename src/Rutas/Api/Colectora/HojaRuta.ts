import * as express from 'express';
import { Buscar, BuscarEtiqueta } from './../../../Modelos/Colectora/HojaRuta';
import {CustomError} from "../../../Utils/CustomError";

const router = express.Router();

router.get('/:codigo', async (req, res) => {

    try {
        const { codigo } = req.params;
        const resultados = await Buscar(codigo);

        res.json(
            [...resultados]
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

router.get('/Etiqueta/:codigo', async (req, res) => {

    try {
        const { codigo } = req.params;
        const resultados = await BuscarEtiqueta(codigo);

        res.json(
            [...resultados]
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

export default router;