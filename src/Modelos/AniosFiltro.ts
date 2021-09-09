import * as sql from "mssql";
import { CustomError } from "../Utils/CustomError";
import { IError } from "../Utils/Types";

const getAll = async (idvendedor: string): Promise<sql.IRecordSet<any>> => {
	try {
		const WhereCondition = idvendedor == "99" ? "" : `and Vendedor = '${idvendedor}'`;

		const { recordset } = await new sql.Request()
			.query(
				`select distinct Anio = LEFT(ordfecha, 4) from Muestra where OrdFecha > '20100101' ${WhereCondition} order by Anio desc`
			);
		return recordset;

	} catch (error) {
		throw new CustomError((error as IError).originalError.info.message);
	}
}
const getAllPedidos = async (idvendedor: string): Promise<sql.IRecordSet<any>> => {
	try {
		const WhereCondition = idvendedor == "99" ? "" : `and c.Vendedor = '${idvendedor}'`;

		const { recordset } = await new sql.Request()
			.query(
				`select distinct Anio = LEFT(p.FechaOrd, 4) FROM Pedido p INNER JOIN Cliente c ON c.Cliente = p.Cliente WHERE p.FechaOrd < '21000101' ${WhereCondition} order by Anio DESC`
			);
		return recordset;
	} catch (error) {
		throw new CustomError((error as IError).originalError.info.message);
	}
}

export {
	getAll,
	getAllPedidos
}