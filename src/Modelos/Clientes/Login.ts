import * as sql from "mssql";
import { CustomError } from "../../Utils/CustomError";
import { IError } from "../../Utils/Types";

const Login = async (cuil:string, clave: string): Promise<object> => {
	try {
	
        const { recordset:[result] } = await new sql.Request()
			.query(
				`SELECT TOP 1 Habilitado FROM ClientesWeb WHERE Clave = '${clave}' AND Cuil = '${cuil}'`
			);

        if (!result["Habilitado"]){
            throw new CustomError("No se encuentra habilitado para consultar las Hojas de Seguridad."); 
        }
	
        return result;
	
    } catch (error) {
		throw new CustomError((error as IError).originalError.info.message);
	}
}

export {
	Login,
};