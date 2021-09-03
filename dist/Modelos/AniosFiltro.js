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
exports.getAllPedidos = exports.getAll = void 0;
const sql = __importStar(require("mssql"));
const getAll = async (idvendedor) => {
    try {
        const WhereCondition = idvendedor == "99" ? "" : `and Vendedor = '${idvendedor}'`;
        const { recordset } = await new sql.Request()
            .query(`select distinct Anio = LEFT(ordfecha, 4) from Muestra where OrdFecha > '20100101' ${WhereCondition} order by Anio desc`);
        return recordset;
    }
    catch (error) {
        throw error;
    }
};
exports.getAll = getAll;
const getAllPedidos = async (idvendedor) => {
    try {
        const WhereCondition = idvendedor == "99" ? "" : `and c.Vendedor = '${idvendedor}'`;
        const { recordset } = await new sql.Request()
            .query(`select distinct Anio = LEFT(p.FechaOrd, 4) FROM Pedido p INNER JOIN Cliente c ON c.Cliente = p.Cliente WHERE p.FechaOrd < '21000101' ${WhereCondition} order by Anio DESC`);
        return recordset;
    }
    catch (error) {
        throw error;
    }
};
exports.getAllPedidos = getAllPedidos;
