import * as sql from "mssql";
import { ProcessError } from "../../Utils/Helpers";
import * as fs from "fs";
import _ from "lodash";

interface HojaTecnica {
    producto:string;
    descripcion:string;
    archivo:string;
}

let _HojasTecnicas:string[] = [];

const getAll = async (cuil:string):Promise<HojaTecnica[]> => {
	try {

        const _PATH_HOJAS_TECNICAS = process.env["HOJAS_TECNICAS_PATH"] || "";

        _HojasTecnicas = fs.readdirSync(_PATH_HOJAS_TECNICAS);

        const HojasTecnicas:HojaTecnica[] = [];
        
		const _cuil = cuil.replace(/[^0-9]/gi, ""); // 30-99999999-99 => 309999999999
	
        console.log(`SELECT p.Terminado, DescTerminado = ISNULL(t.Descripcion, '') FROM Precios p LEFT OUTER JOIN Terminado t ON t.Codigo = p.Terminado INNER JOIN Cliente c ON c.Cliente = p.Cliente INNER JOIN ClientesWeb cw ON cw.Cuil = c.Cuit  OR replace(cw.Cuil, '-', '') = c.Cuit WHERE cw.Cuil = '${cuil}' OR cw.Cuil = '${_cuil}'`)

        const { recordset } = await new sql.Request()
			.query(
				`SELECT p.Terminado, DescTerminado = ISNULL(t.Descripcion, '') FROM Precios p LEFT OUTER JOIN Terminado t ON t.Codigo = p.Terminado INNER JOIN Cliente c ON c.Cliente = p.Cliente INNER JOIN ClientesWeb cw ON cw.Cuil = c.Cuit  OR replace(cw.Cuil, '-', '') = c.Cuit WHERE cw.Cuil = '${cuil}' OR cw.Cuil = '${_cuil}'`
			)

        recordset.forEach(p => {
            HojasTecnicas.push({
                producto: p["Terminado"],
                descripcion: (p["DescTerminado"] as string).trim(),
                archivo: generateFileName(p["Terminado"], p["DescTerminado"])
            } as HojaTecnica)
        });

        const _HojasValidas = HojasTecnicas.filter(_Hoja => _Hoja.archivo.toLowerCase().endsWith(".pdf"));

		return _.sortBy(
            _HojasValidas, 
            _Hoja => _Hoja.descripcion
        );
		
    } catch (error) {

		throw ProcessError(error);
		
	}
}

const generateFileName = (codigo:string, origDesc:string):string => {
    let fileName = '';

    codigo = codigo.trim();
    origDesc = origDesc.trim().replace(/[^A-z0-9]/gi, "").replace(/\s+/gi, "");

    const searchFile = `DOC${codigo.substr(0,3)}${codigo.substr(5, 7)}${origDesc}`;
    fileName = _HojasTecnicas.find(f => f.includes(searchFile)) || "";

    return fileName;
}

export {
    getAll
}