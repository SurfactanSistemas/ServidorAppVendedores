import * as express from 'express';
import { getAll, getAllPedidos } from "../../Modelos/AniosFiltro";
import {IError} from "../../Utils/Types";

const router = express.Router();

/*
    Obtiene todas las muestras referidas a un pedido.
    Pueden indicarse las columnas necesarias o bien ninguna para traer todas.
*/
router.get('/:idvendedor(\\d+)', async (req, res) => {

    try {

        let { idvendedor } = req.params;

        if (!idvendedor) idvendedor = "99";

        const resultados = await getAll(idvendedor)

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

router.get('/Pedidos/:idvendedor(\\d+)', async (req, res) => {
    try {

        let { idvendedor } = req.params;

        if (!idvendedor) idvendedor = "99";

        const resultados = await getAllPedidos(idvendedor)
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