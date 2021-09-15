import * as sql from "mssql";
import _ from "lodash";
import { ProcessError } from "../Utils/Helpers";

const getAll = async (vendedor: string | number) => {
	try {
		let WFiltroVendedor = vendedor == 99 ? "" : ` c.Vendedor = '${vendedor}'`;

		const { recordset } = await new sql.Request()
			.query(
				`SELECT p.Cliente, LTRIM(RTRIM(ISNULL(c.Razon, ''))) as DesCliente, c.Vendedor, LTRIM(RTRIM(ISNULL(o.descripcion, ''))) as DesVendedor, COUNT(DISTINCT p.Terminado) as CantidadTerminados FROM Precios p INNER JOIN Cliente c ON p.cliente = c.Cliente INNER JOIN Operador o ON c.Vendedor = o.Vendedor WHERE ${WFiltroVendedor} GROUP BY c.Vendedor, o.Descripcion, p.Cliente, c.Razon ORDER BY o.Descripcion, c.Razon`
			);

		let res = _(recordset)
			.groupBy("Vendedor")
			.map((Clientes, vend) => ({
				Vendedor: vend,
				DesVendedor: Clientes[0].DesVendedor,
				Datos: Clientes,
			}))
			.value();

		return _.sortBy(res, ["DesVendedor"]);

	} catch (error) {
		throw ProcessError(error);
	}
}

const getAllCliente = async (vendedor: string | number, cliente: string) => {
	try {
		const { recordset } = await new sql.Request()
			.query(
				`select p.Terminado, LTRIM(RTRIM(ISNULL(p.Descripcion,''))) as DesTerminado, p.Cliente, LTRIM(RTRIM(ISNULL(c.Razon, ''))) as DesCliente, p.Precio from Precios p INNER JOIN Cliente c ON p.Cliente = c.Cliente INNER JOIN Operador o ON c.Vendedor = o.Vendedor WHERE p.Cliente = '${cliente}' and c.Vendedor = '${vendedor}' UNION select p.Articulo Terminado, LTRIM(RTRIM(ISNULL(a.Descripcion,''))) as DesTerminado, p.Cliente, LTRIM(RTRIM(ISNULL(c.Razon, ''))) as DesCliente, p.Precio from Preciosmp p LEFT OUTER JOIN Articulo a ON a.Codigo = p.Articulo INNER JOIN Cliente c ON p.Cliente = c.Cliente INNER JOIN Operador o ON c.Vendedor = o.Vendedor WHERE p.Cliente = '${cliente}' and c.Vendedor = '${vendedor}' Order By Terminado, DesTerminado`
			);
		let res = _(recordset)
			.groupBy("Cliente")
			.map((Productos, vend) => ({
				Cliente: vend,
				DesCliente: Productos[0].DesCliente,
				Datos: Productos,
			}))
			.value();

		return _.sortBy(res, ["DesVendedor"]);

	} catch (error) {
		throw ProcessError(error);
	}
}

export {
	getAll, getAllCliente,
}