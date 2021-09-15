import * as sql from "mssql";
<<<<<<< HEAD
<<<<<<< HEAD
import _ from "lodash";
import { ProcessError } from "../Utils/Helpers";

const getAll = async (vendedor: string) => {
=======
import * as _ from "lodash";

const getAll = async (vendedor) => {
>>>>>>> 8979b82 (Js to TS refactoring - Rutas CtasCtes)
=======
import _ from "lodash";

const getAll = async (vendedor: string) => {
>>>>>>> 2ecc41d (Js to TS refactoring - Rutas Estadisticas)
	try {

		const { recordset } = await new sql.Request()
			.query(
				`select cc.Cliente, c.Razon, c.Vendedor, v.Nombre, Saldo = round(sum(cc.Total), 2), SaldoUs = round(sum(cc.Total/cc.paridad), 2), Total = round(sum(cc.Saldo), 2), TotalUs = round(sum(cc.Saldo/cc.Paridad), 2) from ctacte cc INNER JOIN Cliente c ON c.Cliente = cc.Cliente INNER JOIN Vendedor v ON v.Vendedor = c.Vendedor WHERE v.Vendedor = '${vendedor}' And cc.Saldo <> 0 group by cc.Cliente, c.Razon, c.Vendedor, v.Nombre order by cc.Cliente`
			);

		let res = _(recordset)
			.groupBy("Vendedor")
			.map((Clientes, vend) => ({
				Vendedor: vend,
				DesVendedor: Clientes[0].Nombre,
				Datos: Clientes,
			}))
			.value();

		return _.sortBy(res, ["DesVendedor"]);

	} catch (error) {
<<<<<<< HEAD
		throw ProcessError(error);
	}
}

const getAllCliente = async (cliente: string) => {
=======
		throw error;
	}
}

<<<<<<< HEAD
const getAllCliente = async (cliente) => {
>>>>>>> 8979b82 (Js to TS refactoring - Rutas CtasCtes)
=======
const getAllCliente = async (cliente: string) => {
>>>>>>> 2ecc41d (Js to TS refactoring - Rutas Estadisticas)
	try {

		const { recordset } = await new sql.Request()
			.query(
				`select cc.Impre, cc.Cliente, c.Razon, c.Vendedor, v.Nombre, cc.Paridad, CC.Numero, cc.Fecha, Total = round(cc.Total, 2), TotalUs = round(cc.Total / cc.Paridad, 2), Saldo = round(cc.Saldo, 2), SaldoUs = round(cc.Saldo / cc.Paridad, 2) from ctacte cc INNER JOIN Cliente c ON c.Cliente = cc.Cliente INNER JOIN Vendedor v ON v.Vendedor = c.Vendedor WHERE cc.cliente = '${cliente}' And cc.Saldo <> 0 order by cc.OrdFecha`
			);

		let res = _(recordset)
			.groupBy("Cliente")
			.map((Productos, vend) => ({
				Cliente: vend,
				DesCliente: Productos[0].Razon.trim(),
				Datos: Productos,
			}))
			.value();

		return _.sortBy(res, ["DesVendedor"]);

	} catch (error) {
<<<<<<< HEAD
		throw ProcessError(error);
=======
		throw error;
>>>>>>> 8979b82 (Js to TS refactoring - Rutas CtasCtes)
	}
}

export { getAll, getAllCliente, };
