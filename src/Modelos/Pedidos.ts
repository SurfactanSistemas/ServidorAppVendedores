import * as sql from "mssql";
import _ from "lodash";
import { CustomError } from "../Utils/CustomError";
import { IError } from "../Utils/Types";

const getAll = async (vendedor: string | number, fecha: string) => {
	try {

		fecha = fecha.replace(/-/g, "/");

		const WFiltroVendedor = vendedor == 99 ? "" : ` and c.Vendedor = ${vendedor}`;

		const { recordset } = await new sql.Request()
			.query(
				`select hr.Cliente, c.Razon, c.Vendedor, DesVendedor = CASE WHEN c.Vendedor = 1 then 'Directo' ELSE LTRIM(RTRIM(o.Descripcion)) END , hr.Pedido, hr.Fecha, hr.Hoja, count(p.Terminado) CantItems from HojaRuta hr INNER JOIN Pedido p ON p.Pedido = hr.Pedido and p.HojaRuta = hr.Hoja
                                            INNER JOIN Cliente c ON c.Cliente = p.Cliente INNER JOIN Operador o ON o.Vendedor = c.Vendedor Or c.Vendedor = 1 WHERE hr.fecha = '${fecha}' ${WFiltroVendedor}  GROUP BY hr.cliente, c.Razon, c.Vendedor, o.Descripcion, hr.Pedido, hr.Fecha, hr.Hoja order by hr.hoja, c.Razon, hr.Pedido`
			);

		let res = _(recordset)
			.groupBy("Vendedor")
			.map((Clientes, vend) => ({
				Vendedor: vend,
				DesVendedor: Clientes[0].DesVendedor,
				Datos: _(Clientes)
					.groupBy("Hoja")
					.map((Pedidos, hoja) => ({
						HojaRuta: hoja,
						Fecha: Pedidos[0].Fecha,
						Datos: _(Pedidos)
							.groupBy("Pedido")
							.map((Datos, ped) => ({
								Pedido: ped,
								Cliente: Datos[0].Cliente,
								HojaRuta: Datos[0].Hoja,
								Razon: Datos[0].Razon,
								CantItems: Datos[0].CantItems,
							}))
							.value(),
					}))
					.value(),
			}))
			.value();

		return res;

	} catch (error) {
		throw new CustomError((error as IError).originalError.info.message);
	}
}

const getDetalles = async (hojaRuta: string | number, pedido: string | number) => {
	try {

		const { recordset } = await new sql.Request()
			.query(
				`SELECT p.Pedido, p.Renglon, p.Cliente, RTRIM(LTRIM(c.Razon)) Razon, Producto = CASE WHEN p.TipoPro = 'M' THEN p.Articulo ELSE p.Terminado END, 
                                            DescProducto = CASE WHEN ISNULL(p.NombreComercial, '') = '' THEN LTRIM(RTRIM(p.Descripcion)) ELSE LTRIM(RTRIM(p.NombreComercial)) END, 
                                            CantiLote = ISNULL(p.CantiLote1+p.CantiLote2+p.CantiLote3+p.CantiLote4+p.CantiLote5, 0), 
                                            UltimoCantiLote = ISNULL(p.UltimoCantiLote1+p.UltimoCantiLote2+p.UltimoCantiLote3+p.UltimoCantiLote4+p.UltimoCantiLote5, 0), 
                                            ISNULL(p.Facturado, 0) Facturado, p.Fecha FROM Pedido p INNER JOIN Cliente c ON c.Cliente = p.Cliente 
                                            WHERE p.Pedido = '${pedido}' AND p.HojaRuta = '${hojaRuta}' ORDER BY p.Renglon`
			);

		const res = _(recordset)
			.groupBy("Pedido")
			.map((Productos, ped) => ({
				Pedido: ped,
				Fecha: Productos[0].Fecha,
				Cliente: Productos[0].Cliente,
				Razon: Productos[0].Razon,
				Productos: Productos.map((prod) => ({
					Producto: prod.Producto,
					Renglon: prod.Renglon,
					DescProducto: prod.DescProducto,
					Cantidad: prod.CantiLote == 0 ? prod.UltimoCantiLote : prod.CantiLote,
					Facturado: prod.Facturado,
				})),
			}));

		return res;

	} catch (error) {
		throw new CustomError((error as IError).originalError.info.message);
	}
}

const getPendientes = async (vendedor: string | number, soloAutorizado: string | number) => {
	try {
		const WFiltroSoloAutorizado = soloAutorizado == 1 ? "" : ` And ISNULL(p.Autorizo, '') <> 'N'`;
		const WFiltroVendedor = vendedor == 99 ? "" : ` AND c.Vendedor = '${vendedor}'`;

		const { recordset } = await new sql.Request()
			.query(
				`select p.Pedido, p.Cliente, RTRIM(LTRIM(c.Razon)) Razon, c.Vendedor, DescVendedor = CASE WHEN c.Vendedor = '1' THEN 'Directo' ELSE LTRIM(RTRIM(o.Descripcion)) END, p.Fecha As FechaPedido,
                                             p.FecEntrega As FechaEntrega, Producto = CASE WHEN p.TipoPro = 'M' THEN p.Articulo ELSE p.Terminado END,
                                             DescProducto = LTRIM(RTRIM(p.NombreComercial)), p.Cantidad, p.Facturado, p.FecEntrega as FechaEntrega, ISNULL(p.Autorizo, '') As Autorizado from Pedido p 
                                             INNER JOIN Cliente c ON C.Cliente = p.Cliente ${WFiltroVendedor} LEFT OUTER JOIN Operador o ON o.Vendedor = c.Vendedor where p.Cantidad > p.Facturado ${WFiltroSoloAutorizado}
                                             Order by p.Cliente`
			);

		const res = _(recordset)
			.groupBy("Vendedor")
			.map((Pedidos, vend) => ({
				Vendedor: vend,
				DescVendedor: Pedidos[0].DescVendedor,
				Datos: _(Pedidos)
					.groupBy("Cliente")
					.map((Pedidos, cli) => ({
						Cliente: cli,
						Razon: Pedidos[0].Razon,
						Pedidos: _(Pedidos)
							.groupBy("Pedido")
							.map((Pedidos, ped) => ({
								Pedido: ped,
								Fecha: Pedidos[0].FechaPedido,
								Autorizado: Pedidos[0].Autorizado,
								FechaEntrega: Pedidos[0].FechaEntrega[0],
								CantProd: Pedidos.length,
							})),
					})),
			}));

		return res;

	} catch (error) {
		throw new CustomError((error as IError).originalError.info.message);
	}
}
const getPendienteDetalle = async (pedido: string | number) => {
	try {
		const { recordset } = await new sql.Request()
			.query(
				`select p.Pedido, p.Cliente, RTRIM(LTRIM(c.Razon)) Razon, c.Vendedor, DescVendedor = CASE WHEN c.Vendedor = '1' THEN 'Directo' ELSE LTRIM(RTRIM(o.Descripcion)) END, p.Fecha As FechaPedido,
                                             p.FecEntrega As FechaEntrega, Producto = CASE WHEN p.TipoPro = 'M' THEN p.Articulo ELSE p.Terminado END,
                                             DescProducto = LTRIM(RTRIM(p.NombreComercial)), p.Cantidad, p.Facturado, p.FecEntrega As FechaEntrega, ISNULL(p.Autorizo, '') As Autorizado from Pedido p 
                                             INNER JOIN Cliente c ON C.Cliente = p.Cliente LEFT OUTER JOIN Operador o ON o.Vendedor = c.Vendedor where p.Pedido = '${pedido}' And p.Cantidad > p.Facturado 
                                             Order by p.Pedido, p.FechaOrd DESC`
			);

		const res = _(recordset)
			.groupBy("Pedido")
			.map((Productos, ped) => ({
				Pedido: ped,
				Autorizado: Productos[0].Autorizado,
				Fecha: Productos[0].FechaPedido,
				FechaEntrega: Productos[0].FechaEntrega[0],
				Cliente: Productos[0].Cliente,
				Razon: Productos[0].Razon,
				Productos: Productos.map((prod) => ({
					Producto: prod.Producto,
					DescProducto: prod.DescProducto,
					Cantidad: prod.Cantidad,
					Facturado: prod.Facturado,
				})),
			}));

		return res;

	} catch (error) {
		throw new CustomError((error as IError).originalError.info.message);
	}
}

export {
	getAll, getDetalles, getPendientes, getPendienteDetalle,
}