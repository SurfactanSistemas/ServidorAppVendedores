import * as express from 'express';
import { getAll, getAllCliente } from './../../Modelos/CtasCtes';
<<<<<<< HEAD
import {CustomError} from "../../Utils/CustomError";

=======
>>>>>>> 8979b82 (Js to TS refactoring - Rutas CtasCtes)
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
<<<<<<< HEAD
                ErrorMsg: (err as CustomError).toString()
=======
                ErrorMsg: err.message
>>>>>>> 8979b82 (Js to TS refactoring - Rutas CtasCtes)
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
<<<<<<< HEAD
                ErrorMsg: (err as CustomError).toString()
            }
        )
    }
});

export default router;
=======
                ErrorMsg: err.message
            }
        )
    }
});
>>>>>>> 8979b82 (Js to TS refactoring - Rutas CtasCtes)
