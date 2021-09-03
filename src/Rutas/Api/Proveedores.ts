import * as express from 'express';
import { traerSelectivoConfig, existeProveedor, registrarProveedor, yaRegistrado, AnotarSelectivo, Login } from './../../Modelos/Proveedores';
const router = express.Router();

router.post('/CheckExistencia', (req, res) => {

    const { Cuit } = req.body;

    existeProveedor(Cuit)
        .then(resultados => res.json({
            error: false,
            resultados
        }))
        .catch(err => res.json({
            error: true,
            errMsg: err
        }));
});

router.post('/SelectivoConfig', (req, res) => {

    traerSelectivoConfig()
        .then(resultados => res.json({
            error: false,
            resultados
        }))
        .catch(err => res.json({
            error: true,
            errMsg: err
        }));
});

router.post('/Login', (req, res) => {

    const { Cuit, Password } = req.body;

    Login(Cuit, Password)
        .then(resultados => res.json({
            error: false,
            resultados
        }))
        .catch(err => res.json({
            error: true,
            errMsg: err
        }));
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

router.post('/AnotarProveedorSelectivo', (req, res) => {
    const { IDProveedor } = req.body;

    traerSelectivoConfig()
        .then(resultados => {
            if (!resultados) {
                res.json({
                    error: true,
                    errMsg: 'No hay Fecha de Pagos habilitada. Pruebe en unos minutos nuevamente.'
                })
            } else {
                const IDSelectivo = resultados[0].ID;
                AnotarSelectivo(IDSelectivo, IDProveedor).then(resultados => {
                    res.json({
                        error: false,
                        resultados
                    })
                }).catch(err => res.json({
                    error: true,
                    errMsg: err
                }));
            }
        })
        .catch(err => res.json({
            error: true,
            errMsg: err
        }));
});

module.exports = router;