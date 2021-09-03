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
exports.getAllProductos = exports.getAll = void 0;
const sql = __importStar(require("mssql"));
const lodash_1 = __importDefault(require("lodash"));
const getAll = async (vendedor, anio) => {
    try {
        let WFiltroVendedor = vendedor == "99" ? "" : ` AND e.Vendedor = '${vendedor}'`;
        const recordset = await new sql.Request()
            .query(`select count(Distinct e.Articulo) CantProductos, e.Cliente, LTRIM(RTRIM(c.Razon)) Razon, e.Vendedor, DesVendedor = CASE WHEN e.Vendedor = 1 THEN 'Directo' ELSE LTRIM(RTRIM(o.Descripcion)) END from Estadistica e LEFT OUTER JOIN Cliente c ON c.Cliente = e.Cliente LEFT OUTER JOIN Operador o ON o.Vendedor = c.Vendedor where e.OrdFecha between '${anio}0101' and '${anio}1231' ${WFiltroVendedor} GROUP BY e.Cliente, c.Razon, e.Vendedor, o.Descripcion`);
        let res = lodash_1.default(recordset)
            .groupBy("Vendedor")
            .map((Ventas, vend) => ({
            Vendedor: vend,
            DesVendedor: Ventas[0]["DesVendedor"],
            Datos: lodash_1.default(Ventas)
                .groupBy("Cliente")
                .map((Clientes, cli) => ({
                Cliente: cli,
                DesCliente: Clientes[0]["Razon"],
                CantProductos: Clientes[0]["CantProductos"],
            }))
                .value(),
        }))
            .value();
        return lodash_1.default.sortBy(res, ["DesVendedor"]);
    }
    catch (error) {
        throw error;
    }
};
exports.getAll = getAll;
const getAllProductos = async (vendedor, cliente, anio) => {
    try {
        let WFiltroVendedor = vendedor == 99 ? "" : ` AND e.Vendedor = '${vendedor}'`;
        const recordset = await new sql.Request()
            .query(`select e.Numero, e.Renglon, Producto = CASE WHEN e.TipoProDy = 'M' THEN e.ArticuloDy ELSE e.Articulo END, e.Cantidad, e.Precio, e.PrecioUs, e.Cliente, LTRIM(RTRIM(c.Razon)) Razon, e.Paridad, e.Vendedor, DesVendedor = CASE WHEN e.Vendedor = 1 THEN 'Directo' ELSE LTRIM(RTRIM(o.Descripcion)) END , e.Fecha, DesTerminado = CASE e.TipoProDy WHEN 'M' then (SELECT RTRIM(Descripcion) FROM Articulo WHERE Codigo = e.ArticuloDy) WHEN 'T' THEN (SELECT RTRIM(Descripcion) FROM Terminado WHERE Codigo = e.Articulo) ELSE e.DescriTerminadoII END from Estadistica e LEFT OUTER JOIN Operador o ON e.Vendedor = o.Vendedor LEFT OUTER JOIN Cliente c ON e.Cliente = c.Cliente where e.OrdFecha >= '${anio}0101' and e.OrdFecha <= '${anio}1231' ${WFiltroVendedor} and e.Cliente = '${cliente}' order by e.Vendedor, e.Cliente, e.Numero, e.Renglon, Producto`);
        let res = lodash_1.default(recordset)
            .groupBy("Vendedor")
            .map((Ventas, vend) => ({
            Vendedor: vend,
            DesVendedor: Ventas[0]["DesVendedor"],
            Datos: lodash_1.default(Ventas)
                .groupBy("Cliente")
                .map((Clientes, cli) => ({
                Cliente: cli,
                DesCliente: Clientes[0]["Razon"],
                Datos: lodash_1.default(Clientes)
                    .groupBy("Producto")
                    .map((Productos, prod) => ({
                    Producto: prod,
                    DescTerminado: Productos[0]["DescTerminado"],
                    Datos: Productos,
                }))
                    .value(),
            }))
                .value(),
        }))
            .value();
        return lodash_1.default.sortBy(res, ["DesVendedor"]);
    }
    catch (error) {
        throw error;
    }
};
exports.getAllProductos = getAllProductos;
