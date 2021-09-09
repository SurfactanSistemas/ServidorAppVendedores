import * as express from "express";
import { logIn } from "../../Modelos/Login";
import {IError} from "../../Utils/Types";

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
                ErrorMsg: (err as IError).originalError.info.message,
            }
        )
    }
});

export default router;