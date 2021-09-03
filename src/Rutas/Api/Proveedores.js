const express = require('express');
const Proveedor = require('./../../Modelos/Proveedores');
const router = express.Router();
const cors = require('cors');

router.post('/CheckExistencia',(req, res) => {

    const {Cuit} = req.body;

    Proveedor.existeProveedor(Cuit)
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

    Proveedor.traerSelectivoConfig()
        .then(resultados => res.json({
            error: false,
            resultados
        }))
        .catch(err => res.json({
            error: true,
            errMsg: err
        }));
});

router.post('/Login',(req, res) => {

    const {Cuit, Password} = req.body;

    Proveedor.Login(Cuit, Password)
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
        const {Cuit, Password} = req.body;
        const ExisteProveedor = await Proveedor.existeProveedor(Cuit);

        if (!ExisteProveedor){
            res.json({
                error: true,
                errMsg: 'El Cuit indicado no se encuentra asociado a ningún Proveedor.'
            });
            return;
        }

        const YaRegistrado = await Proveedor.yaRegistrado(Cuit);
        if (YaRegistrado){
            res.json({
                error: true,
                errMsg: 'El Cuit indicado ya se encuentra Registrado en nuestro Sistema.'
            });
            return;
        }

        const regProv = await Proveedor.registrarProveedor(Cuit, Password);
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

router.post('/AnotarProveedorSelectivo',(req, res) => {
    const {IDProveedor} = req.body;

    Proveedor.traerSelectivoConfig()
        .then(resultados => {
            if (!resultados){
                res.json({
                    error: true,
                    errMsg: 'No hay Fecha de Pagos habilitada. Pruebe en unos minutos nuevamente.'
                })      
            }else{
                const IDSelectivo = resultados[0].ID;
                Proveedor.AnotarSelectivo(IDSelectivo, IDProveedor).then(resultados => {
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