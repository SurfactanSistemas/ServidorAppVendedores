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
const Muestras_1 = require("./../../Modelos/Muestras");
const router = express.Router();
router.get('/:vendedor/:anio', async (req, res) => {
    try {
        let { vendedor, anio } = req.params;
        const resultados = await Muestras_1.getAll(vendedor, anio);
        res.json({ error: false, resultados });
    }
    catch (err) {
        res.json({
            error: true,
            resultados: [],
            ErrorMsg: err
        });
    }
});
router.post('/Observaciones', async (req, res) => {
    try {
        const { Pedido, Producto, Observacion } = req.body;
        const resultados = await Muestras_1.guardarObservacion(Pedido, Producto, Observacion);
        res.json({ error: false, resultados });
    }
    catch (err) {
        res.json({
            error: true,
            resultados: false,
            ErrorMsg: err
        });
    }
});
router.get('/Observaciones/:pedido/:codProducto', async (req, res) => {
    try {
        const { pedido, codProducto } = req.params;
        const resultados = await Muestras_1.getObservaciones(pedido, codProducto);
        res.json({ error: false, resultados });
    }
    catch (err) {
        res.json({
            error: true,
            resultados: [],
            ErrorMsg: err
        });
    }
});
router.get('/Where/:columnas/:condicion?', async (req, res) => {
    try {
        const { columnas, condicion } = req.params;
        const resultados = await Muestras_1.getAllWhere(columnas, condicion);
        res.json({ error: false, resultados });
    }
    catch (err) {
        res.json({
            error: true,
            resultados: [],
            ErrorMsg: err
        });
    }
});
