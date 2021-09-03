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
const CtasCtes_1 = require("./../../Modelos/CtasCtes");
const router = express.Router();
router.get('/:vendedor', async (req, res) => {
    try {
        let { vendedor } = req.params;
        const resultados = await CtasCtes_1.getAll(vendedor);
        res.json({ error: false, resultados });
    }
    catch (err) {
        res.json({
            error: true,
            resultados: [],
            ErrorMsg: err.message
        });
    }
});
router.get('/:vendedor/:cliente', async (req, res) => {
    try {
        let { cliente } = req.params;
        const resultados = await CtasCtes_1.getAllCliente(cliente);
        res.json({ error: false, resultados });
    }
    catch (err) {
        res.json({
            error: true,
            resultados: [],
            ErrorMsg: err.message
        });
    }
});
