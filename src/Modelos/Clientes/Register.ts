import * as sql from "mssql";
import { ProcessError } from "../../Utils/Helpers";
import { CustomError } from "../../Utils/CustomError";

const Register = async (cuil:string, clave: string): Promise<boolean> => {
	try {

        const registrado:boolean = await Registrado(cuil);
        
        if (registrado){
            throw new CustomError(`Ya se encuentra registrado el Cuit ${cuil}`);
        }

        const CodCliente = await BuscarCodigoCliente(cuil);

        const result = await new sql.Request()
			.query(
				`INSERT INTO ClientesWeb (Cliente, Clave, Cuil) VALUES ('${CodCliente}', '${clave}', '${cuil}');`
			);

		return result.rowsAffected.length > 0;

    } catch (error) {

		throw ProcessError(error);
		
	}
}

const Registrado = async (cuil:string) => {
	try {
	
        const { recordset } = await new sql.Request()
			.query(
				`SELECT TOP 1 cw.Habilitado FROM ClientesWeb cw WHERE cw.Cuil = '${cuil}'`
			)

		return recordset.length > 0;
		
    } catch (error) {

		throw ProcessError(error);
		
	}
}

const BuscarCodigoCliente = async (cuil:string):Promise<string> => {
	try {
		
		const _cuil = cuil.replace(/[^0-9]/gi, ""); // 30-99999999-99 => 309999999999

        const { recordset } = await new sql.Request()
			.query(
				`SELECT TOP 1 Cliente FROM Cliente c WHERE c.Cuit = '${cuil}' OR c.Cuit = '${_cuil}'`
			)
        
        if (recordset.length === 0) throw new CustomError("No se encuentra un Cliente con el Cuit indicado.");
        
		return recordset[0]["Cliente"];
		
    } catch (error) {

		throw ProcessError(error);
		
	}
}

export {
    Register,
}