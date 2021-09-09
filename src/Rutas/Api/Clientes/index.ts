import * as express from "express";
import {Login} from "../../../Modelos/Clientes/Login";
import {CustomError} from "../../../Utils/CustomError";

const router = express.Router();

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