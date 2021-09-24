import * as sql from "mssql";
import { ProcessError } from "../../Utils/Helpers";
import { CustomError } from "../../Utils/CustomError";

const Login = async (cuil: string, clave: string): Promise<object> => {
	try {
		const _cuil = cuil.replace(/[^0-9]/gi, ""); // 30-99999999-99 => 309999999999

		const {
			recordset: [result],
		} = await new sql.Request().query(
			`SELECT TOP 1 c.Cliente, c.Razon, cw.Habilitado FROM ClientesWeb cw INNER JOIN Cliente c ON c.Cliente = cw.Cliente WHERE cw.Clave = '${clave}' AND cw.Cuil = '${cuil}'`
		);

		if (result && !result["Habilitado"])
			throw new CustomError(
				"No se encuentra habilitado para consultar la Documentación Técnica, en estos momentos."
			);

		if (!result)
			throw new CustomError(
				"No se encuentra registrado un cliente con las credenciales indicadas. Si es la primera vez, debe registrarse haciendo click en 'Registrarse'."
			);

		return result;
	} catch (error) {
		throw ProcessError(error);
	}
};

const Registrado = async (cuil: string) => {
	try {
		const { recordset } = await new sql.Request().query(
			`SELECT TOP 1 cw.Habilitado FROM ClientesWeb cw WHERE cw.Cuil = '${cuil}'`
		);

		return recordset.length > 0;
	} catch (error) {
		throw ProcessError(error);
	}
};

export { Login, Registrado };
