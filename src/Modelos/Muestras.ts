import * as sql from "mssql";

const _ = require("lodash");

const getAll = async (vendedor: string | number, anio: string | number) => {
	try {
		let WFiltroVendedor = vendedor == 99 ? "" : ` AND m.Vendedor = '${vendedor}'`;

		const { recordset } = await new sql.Request().query(
			`SELECT Producto = CASE p.TipoPro WHEN 'T' THEN m.Producto ELSE m.Articulo END, RTRIM(LTRIM(m.Cantidad)) Cantidad, m.Fecha, m.Cliente, RTRIM(LTRIM(m.Razon)) Razon, RTRIM(LTRIM(m.DescriCliente)) as DesProducto, m.Pedido, m.Vendedor, LTRIM(RTRIM(ISNULL(m.DesVendedor, ''))) DesVendedor, ISNULL(m.Remito, '0') Remito from Muestra m LEFT JOIN Pedido p ON m.ClavePedido = p.Clave WHERE m.OrdFecha >= 20100101 AND ISNULL(m.Cliente, '') <> '' AND m.OrdFecha >= '${anio}0101' AND m.OrdFecha <= '${anio}1231' ${WFiltroVendedor} order by m.Vendedor, m.Razon`
		);

		let res = _(recordset)
			.groupBy("Vendedor")

			.map((muestras: { DesVendedor: any; }[], vend: any) => ({
				Vendedor: vend,

				DesVendedor: muestras[0].DesVendedor,

				Datos: _(muestras)
					.groupBy("Cliente")

					.map((pedidos: { Razon: any; }[], cli: any) => ({
						Cliente: cli,

						Razon: pedidos[0].Razon,

						Datos: _(pedidos)
							.groupBy("Pedido")

							.map((pedido: any, ped: any) => ({
								Pedido: ped,

								Datos: pedido,
							}))
							.value(),
					}))
					.value(),
			}))
			.value();

		return _.sortBy(res, ["DesVendedor"]);

	} catch (error) {
		throw error;
	}
}

const guardarObservacion = async (pedido: string | number, codProducto: string, Observacion: string): Promise<Boolean> => {
	try {
		const result = await new sql.Request()
			.query(
				`BEGIN TRAN T1;DELETE FROM MuestrasObservaciones WHERE Pedido = '${pedido}' AND Producto = '${codProducto}'; INSERT INTO MuestrasObservaciones (Clave, Pedido, Producto, Observacion) VALUES ('${pedido}${codProducto}', '${pedido}', '${codProducto}', '${Observacion}'); COMMIT TRAN T1;`
			);

		return result.rowsAffected.length > 0;

	} catch (error) {
		throw error;
	}
}

const getObservaciones = async (pedido: string | number, codProducto: string) => {
	try {

		const { recordset } = await new sql.Request().query(
			`SELECT Pedido, LTRIM(RTRIM(Observacion)) Observacion, Producto FROM MuestrasObservaciones WHERE Pedido = '${pedido}' AND Producto = '${codProducto}'`
		);

		return recordset;

	} catch (error) {
		throw error;
	}
}

const getAllWhere = async (columnas: string, condicion?: string) => {
	try {

		if (!columnas) columnas = "*";

		const whereCondicion = condicion ? `WHERE ${condicion}` : "";

		const { recordset } = await new sql.Request().query(
			`select m.Vendedor, LTRIM(RTRIM(ISNULL(v.Nombre, ''))) DesVendedor , m.Cliente, LTRIM(RTRIM(ISNULL(c.Razon, ''))) Razon, Count(Distinct m.Pedido) Pedidos from Muestra m LEFT OUTER JOIN Vendedor v ON v.Vendedor = m.Vendedor LEFT OUTER JOIN Cliente c ON c.Cliente = m.Cliente ${whereCondicion} GROUP BY m.Vendedor, v.Nombre, m.Cliente, c.Razon order by m.Vendedor, c.Razon`
		);

		return recordset;

	} catch (error) {
		throw error;
	}
}

export {
	getAll, getAllWhere, getObservaciones, guardarObservacion,
}
