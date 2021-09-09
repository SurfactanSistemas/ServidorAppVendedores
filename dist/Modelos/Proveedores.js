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
exports.yaRegistrado = exports.registrarProveedor = exports.traerSelectivoConfig = exports.Login = exports.existeProveedor = exports.AnotarSelectivo = void 0;
const sql = __importStar(require("mssql"));
const existeProveedor = async (Cuit) => {
    try {
        const req = await new sql.Request().query(`SELECT Proveedor FROM Proveedor WHERE Cuit = '${Cuit}'`);
        return req.recordset.length > 0;
    }
    catch (error) {
        throw error;
    }
};
exports.existeProveedor = existeProveedor;
const yaRegistrado = async (Cuit) => {
    try {
        const req = await new sql.Request().query(`SELECT ID FROM ProveedorWeb WHERE Cuit = '${Cuit}'`);
        return req.recordset.length > 0;
    }
    catch (error) {
        throw error;
    }
};
exports.yaRegistrado = yaRegistrado;
const registrarProveedor = async (Cuit, Password) => {
    try {
        const WDate = new Date();
        const ZDate = `${WDate.getFullYear()}-${(WDate.getMonth() + 1)
            .toString()
            .padStart(2, "0")}-${WDate.getDate().toString().padStart(2, "0")}`;
        const result = await new sql.Request()
            .query(`INSERT INTO ProveedorWeb (Cuit, Clave, Habilitado, WDate) VALUES ('${Cuit}', '${Password}', '1', '${ZDate}')`);
        return result.rowsAffected.length > 0;
    }
    catch (error) {
        throw error;
    }
};
exports.registrarProveedor = registrarProveedor;
const Login = async (Cuit, Password) => {
    try {
        const { recordset } = await new sql.Request()
            .query(`SELECT p.Proveedor, p.Nombre, pw.ID, pw.Habilitado, FechaAnotacion = ISNULL((SELECT pswc.FechaSelectivo FROM ProveedorSelectivoWebConfig pswc INNER JOIN ProveedorSelectivoWeb psw ON psw.IDFechaSelectivo = pswc.ID WHERE ISNULL(pswc.Habilitado, '0') = '1' And psw.IDProveedor = pw.ID), '')  FROM Proveedor p INNER JOIN ProveedorWeb pw ON pw.Cuit = p.Cuit WHERE pw.Cuit = '${Cuit}' And pw.Clave = '${Password}'`);
        return recordset;
    }
    catch (error) {
        throw error;
    }
};
exports.Login = Login;
const traerSelectivoConfig = async () => {
    try {
        const { recordset } = await new sql.Request()
            .query(`SELECT ID, FechaSelectivo Fecha, FechaInicio, Mensaje Msg FROM ProveedorSelectivoWebConfig WHERE ISNULL(Habilitado, '0') = '1' ORDER BY ID DESC`);
        return recordset;
    }
    catch (error) {
        throw error;
    }
};
exports.traerSelectivoConfig = traerSelectivoConfig;
const AnotarSelectivo = async (IDSelectivo, IDProveedor) => {
    try {
        const WDate = new Date();
        const ZDate = `${WDate.getFullYear()}-${(WDate.getMonth() + 1)
            .toString()
            .padStart(2, "0")}-${WDate.getDate().toString().padStart(2, "0")}`;
        const result = await new sql.Request()
            .query(`BEGIN TRAN T1; DELETE FROM ProveedorSelectivoWeb WHERE IDProveedor = '${IDProveedor}' And IDFechaSelectivo = '${IDSelectivo}';
                                                        INSERT INTO ProveedorSelectivoWeb (IDProveedor, WDate, IDFechaSelectivo) VALUES ('${IDProveedor}', '${ZDate}', '${IDSelectivo}'); COMMIT TRAN T1;`);
        return result.rowsAffected.length > 0;
    }
    catch (error) {
        throw error;
    }
};
exports.AnotarSelectivo = AnotarSelectivo;
