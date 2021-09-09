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
exports.BuscarEtiqueta = exports.Buscar = void 0;
const sql = __importStar(require("mssql"));
const Buscar = async (codigo) => {
    try {
        console.log(codigo);
        codigo = codigo.toUpperCase();
        const { recordset } = await new sql.Request().query(`SELECT h.Hoja, h.Pedido, h.Razon, h.Fecha, h.OrdFecha,
        h.Bultos, p.Lote1, p.Lote2, p.Lote3, p.Lote4, p.Lote5, p.UltimoLote1, p.UltimoLote2, p.UltimoLote3, p.UltimoLote4, p.UltimoLote5 
        FROM HojaRuta h INNER JOIN Pedido p ON p.Pedido = h.Pedido And p.Remito = h.Remito WHERE h.Hoja = '${codigo}' ORDER BY h.Pedido`);
        return recordset;
    }
    catch (error) {
        throw error;
    }
};
exports.Buscar = Buscar;
const BuscarEtiqueta = async (codigo) => {
    try {
        console.log(codigo);
        codigo = codigo.toUpperCase();
        const { recordset } = await new sql.Request().query(`SELECT Estado, Lote, Pedido FROM ProcesoCentroImpresion WHERE CodBarra = '${codigo}'`);
        return recordset;
    }
    catch (error) {
        throw error;
    }
};
exports.BuscarEtiqueta = BuscarEtiqueta;
