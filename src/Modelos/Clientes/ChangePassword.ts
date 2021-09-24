import * as sql from "mssql";
import { ProcessError } from "../../Utils/Helpers";
import { CustomError } from "../../Utils/CustomError";

const CambiarClave = async (cuil: string, claveAnterior: string, clave: string): Promise<boolean> => {
	try {
		const { recordset } = await new sql.Request().query(
			`SELECT TOP 1 cw.Habilitado FROM ClientesWeb cw WHERE cw.Cuil = '${cuil}' And Clave = '${claveAnterior}'`
		);

		const registrado: boolean = recordset.length > 0;

		if (!registrado) {
			throw new CustomError(
				`No se puede modificar la clave para el Cuit ${cuil}. La clave anterior no es válida.`
			);
		}

		const result = await new sql.Request().query(
			`UPDATE ClientesWeb SET Clave = '${clave}' WHERE Cuil = '${cuil}'`
		);

		return result.rowsAffected.length > 0;
	} catch (error) {
		throw ProcessError(error);
	}
};

export { CambiarClave };
