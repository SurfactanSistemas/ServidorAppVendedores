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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllCliente = exports.getAll = void 0;
const sql = __importStar(require("mssql"));
const lodash_1 = __importDefault(require("lodash"));
const getAll = async (vendedor) => {
    try {
        let WFiltroVendedor = vendedor == 99 ? "" : ` c.Vendedor = '${vendedor}'`;
        const { recordset } = await new sql.Request()
            .query(`SELECT p.Cliente, LTRIM(RTRIM(ISNULL(c.Razon, ''))) as DesCliente, c.Vendedor, LTRIM(RTRIM(ISNULL(o.descripcion, ''))) as DesVendedor, COUNT(DISTINCT p.Terminado) as CantidadTerminados FROM Precios p INNER JOIN Cliente c ON p.cliente = c.Cliente INNER JOIN Operador o ON c.Vendedor = o.Vendedor WHERE ${WFiltroVendedor} GROUP BY c.Vendedor, o.Descripcion, p.Cliente, c.Razon ORDER BY o.Descripcion, c.Razon`);
        let res = lodash_1.default(recordset)
            .groupBy("Vendedor")
            .map((Clientes, vend) => ({
            Vendedor: vend,
            DesVendedor: Clientes[0].DesVendedor,
            Datos: Clientes,
        }))
            .value();
        return lodash_1.default.sortBy(res, ["DesVendedor"]);
    }
    catch (error) {
        throw error;
    }
};
exports.getAll = getAll;
const getAllCliente = async (vendedor, cliente) => {
    try {
        const { recordset } = await new sql.Request()
            .query(`select p.Terminado, LTRIM(RTRIM(ISNULL(p.Descripcion,''))) as DesTerminado, p.Cliente, LTRIM(RTRIM(ISNULL(c.Razon, ''))) as DesCliente, p.Precio from Precios p INNER JOIN Cliente c ON p.Cliente = c.Cliente INNER JOIN Operador o ON c.Vendedor = o.Vendedor WHERE p.Cliente = '${cliente}' and c.Vendedor = '${vendedor}' UNION select p.Articulo Terminado, LTRIM(RTRIM(ISNULL(a.Descripcion,''))) as DesTerminado, p.Cliente, LTRIM(RTRIM(ISNULL(c.Razon, ''))) as DesCliente, p.Precio from Preciosmp p LEFT OUTER JOIN Articulo a ON a.Codigo = p.Articulo INNER JOIN Cliente c ON p.Cliente = c.Cliente INNER JOIN Operador o ON c.Vendedor = o.Vendedor WHERE p.Cliente = '${cliente}' and c.Vendedor = '${vendedor}' Order By Terminado, DesTerminado`);
        let res = lodash_1.default(recordset)
            .groupBy("Cliente")
            .map((Productos, vend) => ({
            Cliente: vend,
            DesCliente: Productos[0].DesCliente,
            Datos: Productos,
        }))
            .value();
        return lodash_1.default.sortBy(res, ["DesVendedor"]);
    }
    catch (error) {
        throw error;
    }
};
exports.getAllCliente = getAllCliente;
