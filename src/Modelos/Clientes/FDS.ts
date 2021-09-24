import * as sql from "mssql";
import { ProcessError } from "../../Utils/Helpers";
import * as fs from "fs";
import _ from "lodash";

interface FDS {
	producto: string;
	descripcion: string;
	archivo: string;
}

let _FDSs: string[] = [];

const getAll = async (cuil: string): Promise<FDS[]> => {
	try {
		const _PATH_FDS = process.env["FDS_PATH"] || "";

		_FDSs = fs.readdirSync(_PATH_FDS);

		const FDSs: FDS[] = [];

		const _cuil = cuil.replace(/[^0-9]/gi, ""); // 30-99999999-99 => 309999999999

		const { recordset } = await new sql.Request().query(
			`SELECT p.Terminado, p.Descripcion, DescTerminado = ISNULL(t.Descripcion, ''), Idioma = ISNULL(c.Idioma, 0) FROM Precios p LEFT OUTER JOIN Terminado t ON t.Codigo = p.Terminado INNER JOIN Cliente c ON c.Cliente = p.Cliente INNER JOIN ClientesWeb cw ON cw.Cuil = c.Cuit  OR replace(cw.Cuil, '-', '') = c.Cuit WHERE cw.Cuil = '${cuil}' OR cw.Cuil = '${_cuil}'`
		);

		recordset.forEach((p) => {
			const desc =
				(p["Descripcion"] as string).trim() === ""
					? (p["DescTerminado"] as string).trim()
					: (p["Descripcion"] as string).trim();
			FDSs.push({
				producto: p["Terminado"],
				descripcion: desc,
				archivo: generateFileName(p["Terminado"], desc, p["DescTerminado"], p["Idioma"]),
			} as FDS);
		});

		const resp = _.sortBy(
			FDSs.filter((fds) => fds.archivo.toLowerCase().endsWith(".pdf")),
			(fds) => fds.descripcion
		);
		return _.uniqBy(resp, "producto");
	} catch (error) {
		throw ProcessError(error);
	}
};

const generateFileName = (codigo: string, desc: string, origDesc: string, idioma: number): string => {
	let fileName = "";

	codigo = codigo.trim();
	desc = desc.trim();
	origDesc = origDesc.trim();

	if (codigo.startsWith("PT")) {
		let _desc = desc.replace(/[^A-z0-9]/gi, "");
		const _cod = codigo.substr(3, 9).replace("-", "");

		if (codigo.replace("PT-", "").startsWith("25")) {
			_desc = origDesc.replace(/\s+/gi, "");

			const searchFile = `${_cod}${idioma === 1 ? " ING" : ""} FARMA.pdf`;
			fileName = _FDSs.find((f) => f.includes(searchFile)) || "";
		} else {
			const searchFile = `${_desc}${_cod}`;
			fileName = _FDSs.find((f) => f.includes(searchFile)) || "";
		}
	} else {
		const searchFile = `${codigo.substr(0, 3)}${codigo.substr(5, 7)}.pdf`;
		fileName = _FDSs.find((f) => f.includes(searchFile)) || "";
	}

	return fileName;
};

export { getAll };
