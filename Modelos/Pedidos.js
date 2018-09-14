const sql = require('mssql');
const config = require('./../Config/ConfigDb');
const _ = require('lodash');

const Pedidos = {
    async getAll(vendedor, fecha) {
        try {
            fecha = fecha.replace(/-/g, '/');

            const WFiltroVendedor = vendedor == 99 ? '' : ` and c.Vendedor = ${vendedor}`;

            return new sql.Request().query(`select hr.Cliente, c.Razon, c.Vendedor, DesVendedor = CASE WHEN c.Vendedor = 1 then 'Directo' ELSE LTRIM(RTRIM(o.Descripcion)) END , hr.Pedido, hr.Fecha, hr.Hoja, count(p.Terminado) CantItems from HojaRuta hr INNER JOIN Pedido p ON p.Pedido = hr.Pedido and p.HojaRuta = hr.Hoja
                                            INNER JOIN Cliente c ON c.Cliente = p.Cliente INNER JOIN Operador o ON o.Vendedor = c.Vendedor Or c.Vendedor = 1 WHERE hr.fecha = '${fecha}' ${WFiltroVendedor}  GROUP BY hr.cliente, c.Razon, c.Vendedor, o.Descripcion, hr.Pedido, hr.Fecha, hr.Hoja order by hr.hoja, c.Razon, hr.Pedido`)
                        .then(result => {
                            const {recordset} = result;

                            let res = _(recordset)
                                        .groupBy('Vendedor')
                                        .map((Clientes, vend) => (
                                            {
                                                Vendedor: vend,
                                                DesVendedor: Clientes[0].DesVendedor,
                                                Datos: _(Clientes)
                                                            .groupBy('Hoja')
                                                            .map((Pedidos, hoja) => (
                                                                {
                                                                    HojaRuta: hoja,
                                                                    Fecha: Pedidos[0].Fecha,
                                                                    Datos: _(Pedidos)
                                                                            .groupBy('Pedido')
                                                                            .map((Datos, ped) => (
                                                                                {
                                                                                    Pedido: ped,
                                                                                    Cliente: Datos[0].Cliente,
                                                                                    HojaRuta: Datos[0].Hoja,
                                                                                    Razon: Datos[0].Razon,
                                                                                    CantItems: Datos[0].CantItems
                                                                                }
                                                                            )).value()
                                                                }
                                                            )).value()
                                            }
                                        )).value();


                            return res;
                        })

        } catch (error) {
            throw error;        
        }
    },
    async getDetalles(hojaRuta, pedido) {
        try {

            return new sql.Request().query(`SELECT p.Pedido, p.Renglon, p.Cliente, RTRIM(LTRIM(c.Razon)) Razon, Producto = CASE WHEN p.TipoPro = 'M' THEN p.Articulo ELSE p.Terminado END, 
                                            DescProducto = CASE WHEN ISNULL(p.NombreComercial, '') = '' THEN LTRIM(RTRIM(p.Descripcion)) ELSE LTRIM(RTRIM(p.NombreComercial)) END, 
                                            CantiLote = ISNULL(p.CantiLote1+p.CantiLote2+p.CantiLote3+p.CantiLote4+p.CantiLote5, 0), 
                                            UltimoCantiLote = ISNULL(p.UltimoCantiLote1+p.UltimoCantiLote2+p.UltimoCantiLote3+p.UltimoCantiLote4+p.UltimoCantiLote5, 0), 
                                            ISNULL(p.Facturado, 0) Facturado, p.Fecha FROM Pedido p INNER JOIN Cliente c ON c.Cliente = p.Cliente 
                                            WHERE p.Pedido = '${pedido}' AND p.HojaRuta = '${hojaRuta}' ORDER BY p.Renglon`)
                        .then(result => {
                            const {recordset} = result;

                            const res = _(recordset).groupBy('Pedido')
                                                    .map((Productos, ped) => (
                                                        {
                                                            Pedido: ped,
                                                            Fecha: Productos[0].Fecha,
                                                            Cliente: Productos[0].Cliente,
                                                            Razon: Productos[0].Razon,
                                                            Productos: Productos.map(prod => (
                                                                {
                                                                    Producto: prod.Producto,
                                                                    Renglon: prod.Renglon,
                                                                    DescProducto: prod.DescProducto,
                                                                    Cantidad: prod.CantiLote == 0 ? prod.UltimoCantiLote : prod.CantiLote,
                                                                    Facturado: prod.Facturado,
                                                                }
                                                            ))
                                                        }
                                                    ))

                            return res;
                        })

        } catch (error) {
            throw error;        
        }
    },
}

module.exports = Pedidos;