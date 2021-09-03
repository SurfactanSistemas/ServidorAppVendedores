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
const Estadisticas_1 = require("./../../Modelos/Estadisticas");
const router = express.Router();
/*
    Obtiene todas las muestras referidas a un pedido.
    Pueden indicarse las columnas necesarias o bien ninguna para traer todas.
*/
router.get('/:vendedor/:anio?', async (req, res) => {
    try {
        let { vendedor, anio } = req.params;
        if (!anio)
            anio = (new Date()).getFullYear().toString();
        const resultados = await Estadisticas_1.getAll(vendedor, anio);
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
router.get('/Productos/:vendedor/:cliente/:anio', async (req, res) => {
    try {
        let { vendedor, cliente, anio } = req.params;
        const resultados = await Estadisticas_1.getAllProductos(vendedor, cliente, anio);
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
