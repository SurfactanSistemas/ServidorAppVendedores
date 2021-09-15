import * as sql from "mssql";
import _ from "lodash";
<<<<<<< HEAD
import { ProcessError } from "../Utils/Helpers";
=======
>>>>>>> 2ecc41d (Js to TS refactoring - Rutas Estadisticas)

const getAll = async (vendedor: string, anio: string) => {
	try {
		let WFiltroVendedor = vendedor == "99" ? "" : ` AND e.Vendedor = '${vendedor}'`;

<<<<<<< HEAD
		const { recordset } = await new sql.Request()
=======
		const recordset = await new sql.Request()
>>>>>>> 2ecc41d (Js to TS refactoring - Rutas Estadisticas)
			.query(
				`select count(Distinct e.Articulo) CantProductos, e.Cliente, LTRIM(RTRIM(c.Razon)) Razon, e.Vendedor, DesVendedor = CASE WHEN e.Vendedor = 1 THEN 'Directo' ELSE LTRIM(RTRIM(o.Descripcion)) END from Estadistica e LEFT OUTER JOIN Cliente c ON c.Cliente = e.Cliente LEFT OUTER JOIN Operador o ON o.Vendedor = c.Vendedor where e.OrdFecha between '${anio}0101' and '${anio}1231' ${WFiltroVendedor} GROUP BY e.Cliente, c.Razon, e.Vendedor, o.Descripcion`
			);

		let res = _(recordset)
			.groupBy("Vendedor")
			.map((Ventas: { [x: string]: any; }[], vend: any) => ({
				Vendedor: vend,
				DesVendedor: Ventas[0]["DesVendedor"],
				Datos: _(Ventas)
					.groupBy("Cliente")
					.map((Clientes: { [x: string]: any; }[], cli: any) => ({
						Cliente: cli,
						DesCliente: Clientes[0]["Razon"],
						CantProductos: Clientes[0]["CantProductos"],
					}))
					.value(),
			}))
			.value();

		return _.sortBy(res, ["DesVendedor"]);

	} catch (error) {
<<<<<<< HEAD
		throw ProcessError(error);
=======
		throw error;
>>>>>>> 2ecc41d (Js to TS refactoring - Rutas Estadisticas)
	}
}

const getAllProductos = async (vendedor: string | number, cliente: string, anio: string) => {
	try {
		let WFiltroVendedor = vendedor == 99 ? "" : ` AND e.Vendedor = '${vendedor}'`;

<<<<<<< HEAD
		const { recordset } = await new sql.Request()
=======
		const recordset = await new sql.Request()
>>>>>>> 2ecc41d (Js to TS refactoring - Rutas Estadisticas)
			.query(
				`select e.Numero, e.Renglon, Producto = CASE WHEN e.TipoProDy = 'M' THEN e.ArticuloDy ELSE e.Articulo END, e.Cantidad, e.Precio, e.PrecioUs, e.Cliente, LTRIM(RTRIM(c.Razon)) Razon, e.Paridad, e.Vendedor, DesVendedor = CASE WHEN e.Vendedor = 1 THEN 'Directo' ELSE LTRIM(RTRIM(o.Descripcion)) END , e.Fecha, DesTerminado = CASE e.TipoProDy WHEN 'M' then (SELECT RTRIM(Descripcion) FROM Articulo WHERE Codigo = e.ArticuloDy) WHEN 'T' THEN (SELECT RTRIM(Descripcion) FROM Terminado WHERE Codigo = e.Articulo) ELSE e.DescriTerminadoII END from Estadistica e LEFT OUTER JOIN Operador o ON e.Vendedor = o.Vendedor LEFT OUTER JOIN Cliente c ON e.Cliente = c.Cliente where e.OrdFecha >= '${anio}0101' and e.OrdFecha <= '${anio}1231' ${WFiltroVendedor} and e.Cliente = '${cliente}' order by e.Vendedor, e.Cliente, e.Numero, e.Renglon, Producto`
			);

		let res = _(recordset)
			.groupBy("Vendedor")
			.map((Ventas: { [x: string]: any; }[], vend: any) => ({
				Vendedor: vend,
				DesVendedor: Ventas[0]["DesVendedor"],
				Datos: _(Ventas)
					.groupBy("Cliente")
					.map((Clientes: { [x: string]: any; }[], cli: any) => ({
						Cliente: cli,
						DesCliente: Clientes[0]["Razon"],
						Datos: _(Clientes)
							.groupBy("Producto")
							.map((Productos: { [x: string]: any; }[], prod: any) => ({
								Producto: prod,
								DescTerminado: Productos[0]["DescTerminado"],
								Datos: Productos,
							}))
							.value(),
					}))
					.value(),
			}))
			.value();

		return _.sortBy(res, ["DesVendedor"]);

	} catch (error) {
<<<<<<< HEAD
		throw ProcessError(error);
=======
		throw error;
>>>>>>> 2ecc41d (Js to TS refactoring - Rutas Estadisticas)
	}
}

export {
	getAll,
	getAllProductos,
}