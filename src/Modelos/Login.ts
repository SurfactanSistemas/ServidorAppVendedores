import * as sql from "mssql";
import { ProcessError } from "../Utils/Helpers";

const logIn = async (clave: string): Promise<sql.IRecordSet<any>> => {
	try {
		clave = clave.toUpperCase();
		const { recordset } = await new sql.Request()
			.query(
				`SELECT Vendedor, ISNULL(PermisosAlarma, '0000') PermisosAlarma FROM Operador WHERE Vendedor <> 0 AND UPPER(Clave) = '${clave}'`
			);
		return recordset;
	} catch (error) {
		throw ProcessError(error);
	}
}

export {
	logIn
};