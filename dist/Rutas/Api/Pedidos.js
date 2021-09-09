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
const Pedidos_1 = require("./../../Modelos/Pedidos");
const router = express.Router();
/*
Obtiene todas los Renglones referidas a un pedido.
Pueden indicarse las columnas necesarias o bien ninguna para traer todas.
*/
router.get('/Detalles/:hojaRuta(\\d+)/:pedido(\\d+)', async (req, res) => {
    try {
        let { hojaRuta, pedido } = req.params;
        const resultados = await Pedidos_1.getDetalles(hojaRuta, pedido);
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
/*
    Obtiene todas los Renglones referidas a un pedido.
    Pueden indicarse las columnas necesarias o bien ninguna para traer todas.
*/
router.get('/Pendientes/:vendedor(\\d+)/:soloAutorizado(\\d+)', async (req, res) => {
    try {
        let { vendedor, soloAutorizado } = req.params;
        const resultados = await Pedidos_1.getPendientes(vendedor, soloAutorizado);
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
router.get('/Pendientes/Detalles/:pedido(\\d+)', async (req, res) => {
    try {
        let { pedido } = req.params;
        const resultados = await Pedidos_1.getPendienteDetalle(pedido);
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
/*
    Obtiene todas los Renglones referidas a un pedido.
    Pueden indicarse las columnas necesarias o bien ninguna para traer todas.
*/
router.get('/:vendedor(\\d+)/:fecha', async (req, res) => {
    try {
        const { vendedor, fecha } = req.params;
        const resultados = await Pedidos_1.getAll(vendedor, fecha);
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
