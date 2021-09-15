import * as express from 'express';
import { getAll, getAllProductos } from './../../Modelos/Estadisticas';
<<<<<<< HEAD
import {CustomError} from "../../Utils/CustomError";
=======
>>>>>>> 2ecc41d (Js to TS refactoring - Rutas Estadisticas)

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
<<<<<<< HEAD
                ErrorMsg: (err as CustomError).toString()
=======
                ErrorMsg: err
>>>>>>> 2ecc41d (Js to TS refactoring - Rutas Estadisticas)
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
<<<<<<< HEAD
                ErrorMsg: (err as CustomError).toString()
=======
                ErrorMsg: err
>>>>>>> 2ecc41d (Js to TS refactoring - Rutas Estadisticas)
            }
        )

    }
<<<<<<< HEAD
});

export default router;
=======
});
>>>>>>> 2ecc41d (Js to TS refactoring - Rutas Estadisticas)
