"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = __importStar(require("express"));
const Proveedores_1 = require("./../../Modelos/Proveedores");
const router = express.Router();
router.post('/CheckExistencia', async (req, res) => {
    try {
        const { Cuit } = req.body;
        const resultados = await Proveedores_1.existeProveedor(Cuit);
        res.json({
            error: false,
            resultados
        });
    }
    catch (err) {
        res.json({
            error: true,
            errMsg: err
        });
    }
});
router.post('/SelectivoConfig', async (_req, res) => {
    try {
        const resultados = await Proveedores_1.traerSelectivoConfig();
        res.json({
            error: false,
            resultados
        });
    }
    catch (err) {
        res.json({
            error: true,
            errMsg: err
        });
    }
});
router.post('/Login', async (req, res) => {
    try {
        const { Cuit, Password } = req.body;
        const resultados = await Proveedores_1.Login(Cuit, Password);
        res.json({
            error: false,
            resultados
        });
    }
    catch (err) {
        res.json({
            error: true,
            errMsg: err
        });
    }
});
router.post('/RegistrarNuevoProveedor', async (req, res) => {
    try {
        const { Cuit, Password } = req.body;
        const ExisteProveedor = await Proveedores_1.existeProveedor(Cuit);
        if (!ExisteProveedor) {
            res.json({
                error: true,
                errMsg: 'El Cuit indicado no se encuentra asociado a ningún '
            });
            return;
        }
        const YaRegistrado = await Proveedores_1.yaRegistrado(Cuit);
        if (YaRegistrado) {
            res.json({
                error: true,
                errMsg: 'El Cuit indicado ya se encuentra Registrado en nuestro Sistema.'
            });
            return;
        }
        const regProv = await Proveedores_1.registrarProveedor(Cuit, Password);
        res.json({
            error: false,
            resultados: regProv
        });
    }
    catch (error) {
        res.json({
            error: false,
            errMsg: error
        });
    }
});
router.post('/AnotarProveedorSelectivo', async (req, res) => {
    try {
        const { IDProveedor } = req.body;
        const resultados = await Proveedores_1.traerSelectivoConfig();
        if (!resultados) {
            res.json({
                error: true,
                errMsg: 'No hay Fecha de Pagos habilitada. Pruebe en unos minutos nuevamente.'
            });
        }
        else {
            const IDSelectivo = resultados[0].ID;
            const anotar = await Proveedores_1.AnotarSelectivo(IDSelectivo, IDProveedor);
            res.json({
                error: false,
                resultados: anotar
            });
        }
    }
    catch (err) {
        res.json({
            error: true,
            errMsg: err
        });
    }
});
