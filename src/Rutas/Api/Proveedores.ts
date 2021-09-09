import * as express from 'express';
import { traerSelectivoConfig, existeProveedor, registrarProveedor, yaRegistrado, AnotarSelectivo, Login } from './../../Modelos/Proveedores';
import {CustomError} from "../../Utils/CustomError";

const router = express.Router();

router.post('/CheckExistencia', async (req, res) => {
    try {
        const { Cuit } = req.body;

        const resultados = await existeProveedor(Cuit);

        res.json({
            error: false,
            resultados
        });
    } catch (err) {
        res.json({
            error: true,
            errMsg: (err as CustomError).toString()
        });
    }
});

router.post('/SelectivoConfig', async (_req, res) => {
    try {
        const resultados = await traerSelectivoConfig()
        res.json({
            error: false,
            resultados
        })
    } catch (err) {
        res.json({
            error: true,
            errMsg: err
        })
    }
});

router.post('/Login', async (req, res) => {
    try {
        const { Cuit, Password } = req.body;

        const resultados = await Login(Cuit, Password)

        res.json({
            error: false,
            resultados
        })
    } catch (err) {
        res.json({
            error: true,
            errMsg: err
        })
    }
});

router.post('/RegistrarNuevoProveedor', async (req, res) => {
    try {
        const { Cuit, Password } = req.body;
        const ExisteProveedor = await existeProveedor(Cuit);

        if (!ExisteProveedor) {
            res.json({
                error: true,
                errMsg: 'El Cuit indicado no se encuentra asociado a ningún '
            });
            return;
        }

        const YaRegistrado = await yaRegistrado(Cuit);
        if (YaRegistrado) {
            res.json({
                error: true,
                errMsg: 'El Cuit indicado ya se encuentra Registrado en nuestro Sistema.'
            });
            return;
        }

        const regProv = await registrarProveedor(Cuit, Password);
        res.json({
            error: false,
            resultados: regProv
        });
    } catch (error) {
        res.json({
            error: false,
            errMsg: error
        });
    }
});

router.post('/AnotarProveedorSelectivo', async (req, res) => {
    try {
        const { IDProveedor } = req.body;

        const resultados: any[] = await traerSelectivoConfig()

        if (!resultados) {
            res.json({
                error: true,
                errMsg: 'No hay Fecha de Pagos habilitada. Pruebe en unos minutos nuevamente.'
            })
        } else {
            const IDSelectivo = resultados[0].ID;
            const anotar = await AnotarSelectivo(IDSelectivo, IDProveedor)

            res.json({
                error: false,
                resultados: anotar
            })
        }

    } catch (err) {
        res.json({
            error: true,
            errMsg: err
        })
    }
});

export default router;