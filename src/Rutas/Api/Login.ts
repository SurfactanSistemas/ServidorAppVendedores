import * as express from "express";
import { logIn } from "../../Modelos/Login";
import {CustomError} from "../../Utils/CustomError";

const router = express.Router();

router.get('/:clave', async (req, res) => {
    try {
        const { clave } = req.params;

        const resultados = await logIn(clave);
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