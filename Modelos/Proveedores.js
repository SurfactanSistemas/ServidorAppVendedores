const sql = require('mssql');
const _ = require('lodash');
const config = require('./../Config/ConfigDb');

const Proveedores = {

    async existeProveedor(Cuit){
        try {
            const req = await new sql.Request().query(`SELECT Proveedor FROM Proveedor WHERE Cuit = '${Cuit}'`);
            return req.recordset.length > 0;

        } catch (error) {
            throw error;
        }
    },
    async yaRegistrado(Cuit){
        try {
            const req = await new sql.Request().query(`SELECT ID FROM ProveedorWeb WHERE Cuit = '${Cuit}'`);
            return req.recordset.length > 0;
        } catch (error) {
            throw error;
        }
    },
    async registrarProveedor(Cuit, Password){
        try {
            const WDate = new Date();
            const ZDate = `${WDate.getFullYear()}-${(WDate.getMonth() + 1).toString().padStart(2, '0')}-${WDate.getDate().toString().padStart(2, '0')}`;
            return new sql.Request().query(`INSERT INTO ProveedorWeb (Cuit, Clave, Habilitado, WDate) VALUES ('${Cuit}', '${Password}', '1', '${ZDate}')`)
                                    .then(result => result.rowsAffected > 0);
        } catch (error) {
            throw error;
        }
    },
    async Login(Cuit, Password){
        try {
            return new sql.Request().query(`SELECT p.Proveedor, p.Nombre, pw.ID, pw.Habilitado, FechaAnotacion = ISNULL((SELECT pswc.FechaSelectivo FROM ProveedorSelectivoWebConfig pswc INNER JOIN ProveedorSelectivoWeb psw ON psw.IDFechaSelectivo = pswc.ID WHERE ISNULL(pswc.Habilitado, '0') = '1' And psw.IDProveedor = pw.ID), '')  FROM Proveedor p INNER JOIN ProveedorWeb pw ON pw.Cuit = p.Cuit WHERE pw.Cuit = '${Cuit}' And pw.Clave = '${Password}'`)
                                    .then(result => result.recordset);
        } catch (error) {
            throw error;
        }
    },
    async traerSelectivoConfig(){
        try {
            const req =  await new sql.Request().query(`SELECT ID, FechaSelectivo Fecha, FechaInicio, Mensaje Msg FROM ProveedorSelectivoWebConfig WHERE ISNULL(Habilitado, '0') = '1' ORDER BY ID DESC`)
                                    .then(result => result.recordset);
            return req;

        } catch (error) {
            throw error;
        }
    },
    async AnotarSelectivo(IDSelectivo, IDProveedor){
        try {
            const WDate = new Date();
            const ZDate = `${WDate.getFullYear()}-${(WDate.getMonth() + 1).toString().padStart(2, '0')}-${WDate.getDate().toString().padStart(2, '0')}`;
            const req = await new sql.Request().query(`BEGIN TRAN T1; DELETE FROM ProveedorSelectivoWeb WHERE IDProveedor = '${IDProveedor}' And IDFechaSelectivo = '${IDSelectivo}';
                                                        INSERT INTO ProveedorSelectivoWeb (IDProveedor, WDate, IDFechaSelectivo) VALUES ('${IDProveedor}', '${ZDate}', '${IDSelectivo}'); COMMIT TRAN T1;`);
            // console.log(req);
           return req.rowsAffected.length > 0;

        } catch (error) {
            throw error;
        }
    },
}

module.exports = Proveedores;