import * as sql from "mssql";
import { CustomError } from "../Utils/CustomError";
import { IError } from "../Utils/Types";

const logIn = async (clave: string): Promise<sql.IRecordSet<any>> => {
	try {
		clave = clave.toUpperCase();
		const { recordset } = await new sql.Request()
			.query(
				`SELECT Vendedor, ISNULL(PermisosAlarma, '0000') PermisosAlarma FROM Operador WHERE Vendedor <> 0 AND UPPER(Clave) = '${clave}'`
			);
		return recordset;
	} catch (error) {
		throw new CustomError((error as IError).originalError.info.message);
	}
}

export {
	logIn
};