import * as express from 'express';
import { Buscar, BuscarEtiqueta } from './../../../Modelos/Colectora/HojaRuta';
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
                ErrorMsg: err
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
                ErrorMsg: err
            }
        )
    }
});

module.exports = router;