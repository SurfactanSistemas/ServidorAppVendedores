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
        const { recordset } = await new sql.Request()
            .query(`select cc.Cliente, c.Razon, c.Vendedor, v.Nombre, Saldo = round(sum(cc.Total), 2), SaldoUs = round(sum(cc.Total/cc.paridad), 2), Total = round(sum(cc.Saldo), 2), TotalUs = round(sum(cc.Saldo/cc.Paridad), 2) from ctacte cc INNER JOIN Cliente c ON c.Cliente = cc.Cliente INNER JOIN Vendedor v ON v.Vendedor = c.Vendedor WHERE v.Vendedor = '${vendedor}' And cc.Saldo <> 0 group by cc.Cliente, c.Razon, c.Vendedor, v.Nombre order by cc.Cliente`);
        let res = lodash_1.default(recordset)
            .groupBy("Vendedor")
            .map((Clientes, vend) => ({
            Vendedor: vend,
            DesVendedor: Clientes[0].Nombre,
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
const getAllCliente = async (cliente) => {
    try {
        const { recordset } = await new sql.Request()
            .query(`select cc.Impre, cc.Cliente, c.Razon, c.Vendedor, v.Nombre, cc.Paridad, CC.Numero, cc.Fecha, Total = round(cc.Total, 2), TotalUs = round(cc.Total / cc.Paridad, 2), Saldo = round(cc.Saldo, 2), SaldoUs = round(cc.Saldo / cc.Paridad, 2) from ctacte cc INNER JOIN Cliente c ON c.Cliente = cc.Cliente INNER JOIN Vendedor v ON v.Vendedor = c.Vendedor WHERE cc.cliente = '${cliente}' And cc.Saldo <> 0 order by cc.OrdFecha`);
        let res = lodash_1.default(recordset)
            .groupBy("Cliente")
            .map((Productos, vend) => ({
            Cliente: vend,
            DesCliente: Productos[0].Razon.trim(),
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
