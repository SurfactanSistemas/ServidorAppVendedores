import * as sql from "mssql";
import { ProcessError, ValidEmail } from "../../Utils/Helpers";
import { CustomError } from "../../Utils/CustomError";
import moment from "moment";

const Register = async (cuil: string, mail: string): Promise<boolean> => {
	try {
		if (!ValidEmail(mail)) {
			throw new CustomError(`El Mail indicado (${mail}),no tiene un formato válido.`);
		}

		const registrado: boolean = await Registrado(cuil);

		if (registrado) {
			throw new CustomError(`Ya se encuentra registrado el Cuit ${cuil}`);
		}

		const CodCliente = await BuscarCodigoCliente(cuil);

		const now = moment();

		const fecha = now.format("DD/MM/YYYY");
		const fechaOrd = now.format("YYYYMMDD");

		const result = await new sql.Request().query(
			`INSERT INTO ClientesWeb (Cliente, Mail, Cuil, Fecha, FechaOrd) VALUES ('${CodCliente}', '${mail}', '${cuil}', '${fecha}', '${fechaOrd}');`
		);

		return result.rowsAffected.length > 0;
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

const BuscarCodigoCliente = async (cuil: string): Promise<string> => {
	try {
		const _cuil = cuil.replace(/[^0-9]/gi, ""); // 30-99999999-99 => 309999999999

		const { recordset } = await new sql.Request().query(
			`SELECT TOP 1 Cliente FROM Cliente c WHERE c.Cuit = '${cuil}' OR c.Cuit = '${_cuil}'`
		);

		let codCliente = "S00102"; // Invitado es Surfactan por defecto.

		if (recordset.length > 0) codCliente = recordset[0]["Cliente"]; //throw new CustomError("No se encuentra un Cliente con el Cuit indicado.");

		return codCliente;
	} catch (error) {
		throw ProcessError(error);
	}
};

export { Register, Registrado, BuscarCodigoCliente };
