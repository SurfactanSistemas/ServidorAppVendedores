import * as sql from "mssql";
import _ from "lodash";
import { ProcessError } from "../Utils/Helpers";

const existeProveedor = async (Cuit:string) => {
	try {
		const req = await new sql.Request().query(`SELECT Proveedor FROM Proveedor WHERE Cuit = '${Cuit}'`);
		return req.recordset.length > 0;
	} catch (error) {
		throw ProcessError(error);
	}
}

const yaRegistrado = async (Cuit:string) => {
	try {
		const req = await new sql.Request().query(`SELECT ID FROM ProveedorWeb WHERE Cuit = '${Cuit}'`);
		return req.recordset.length > 0;
	} catch (error) {
		throw ProcessError(error);
	}
}

const registrarProveedor = async (Cuit:string, Password:string) => {
	try {
		const WDate = new Date();
		const ZDate = `${WDate.getFullYear()}-${(WDate.getMonth() + 1)
			.toString()
			.padStart(2, "0")}-${WDate.getDate().toString().padStart(2, "0")}`;
		const result = await new sql.Request()
			.query(
				`INSERT INTO ProveedorWeb (Cuit, Clave, Habilitado, WDate) VALUES ('${Cuit}', '${Password}', '1', '${ZDate}')`
			);

		return result.rowsAffected.length > 0;

	} catch (error) {
		throw ProcessError(error);
	}
}

const Login = async (Cuit:string, Password:string) => {
	try {
		const { recordset } = await new sql.Request()
			.query(
				`SELECT p.Proveedor, p.Nombre, pw.ID, pw.Habilitado, FechaAnotacion = ISNULL((SELECT pswc.FechaSelectivo FROM ProveedorSelectivoWebConfig pswc INNER JOIN ProveedorSelectivoWeb psw ON psw.IDFechaSelectivo = pswc.ID WHERE ISNULL(pswc.Habilitado, '0') = '1' And psw.IDProveedor = pw.ID), '')  FROM Proveedor p INNER JOIN ProveedorWeb pw ON pw.Cuit = p.Cuit WHERE pw.Cuit = '${Cuit}' And pw.Clave = '${Password}'`
			);

		return recordset;

	} catch (error) {
		throw ProcessError(error);
	}
}

const traerSelectivoConfig = async () => {
	try {
		const { recordset } = await new sql.Request()
			.query(
				`SELECT ID, FechaSelectivo Fecha, FechaInicio, Mensaje Msg FROM ProveedorSelectivoWebConfig WHERE ISNULL(Habilitado, '0') = '1' ORDER BY ID DESC`
			);

		return recordset;

	} catch (error) {
		throw ProcessError(error);
	}
}

const AnotarSelectivo = async (IDSelectivo:string, IDProveedor:string) => {
	try {
		const WDate = new Date();
		const ZDate = `${WDate.getFullYear()}-${(WDate.getMonth() + 1)
			.toString()
			.padStart(2, "0")}-${WDate.getDate().toString().padStart(2, "0")}`;
		const result = await new sql.Request()
			.query(`BEGIN TRAN T1; DELETE FROM ProveedorSelectivoWeb WHERE IDProveedor = '${IDProveedor}' And IDFechaSelectivo = '${IDSelectivo}';
                                                        INSERT INTO ProveedorSelectivoWeb (IDProveedor, WDate, IDFechaSelectivo) VALUES ('${IDProveedor}', '${ZDate}', '${IDSelectivo}'); COMMIT TRAN T1;`);
		return result.rowsAffected.length > 0;

	} catch (error) {
		throw ProcessError(error);
	}
}

export {
	AnotarSelectivo,
	existeProveedor,
	Login,
	traerSelectivoConfig,
	registrarProveedor,
	yaRegistrado,
}