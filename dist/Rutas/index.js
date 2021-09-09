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
exports.ColectoraHojaRuta = exports.Proveedor = exports.Precios = exports.Pedidos = exports.Muestras = exports.Login = exports.Estadisticas = exports.CtasCtes = exports.AniosFiltro = void 0;
const AniosFiltro = __importStar(require("./Api/AniosFiltro"));
exports.AniosFiltro = AniosFiltro;
const CtasCtes = __importStar(require("./Api/CtasCtes"));
exports.CtasCtes = CtasCtes;
const Estadisticas = __importStar(require("./Api/Estadisticas"));
exports.Estadisticas = Estadisticas;
const Login = __importStar(require("./Api/Login"));
exports.Login = Login;
const Muestras = __importStar(require("./Api/Muestras"));
exports.Muestras = Muestras;
const Pedidos = __importStar(require("./Api/Pedidos"));
exports.Pedidos = Pedidos;
const Precios = __importStar(require("./Api/Precios"));
exports.Precios = Precios;
const Proveedor = __importStar(require("./Api/Proveedores"));
exports.Proveedor = Proveedor;
const ColectoraHojaRuta = __importStar(require("./Api/Colectora/HojaRuta"));
exports.ColectoraHojaRuta = ColectoraHojaRuta;
