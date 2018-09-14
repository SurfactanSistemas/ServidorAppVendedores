const sql = require('mssql');
const config = require('./../Config/ConfigDb');
const _ = require('lodash');

const Estadisticas = {

    async getAll(vendedor, anio) {
        try {
            let WFiltroVendedor = vendedor == 99 ? '' : ` AND e.Vendedor = '${vendedor}'`;

            //return new sql.Request().query(`select Count(Distinct e.Numero),e.Cliente, LTRIM(RTRIM(c.Razon)) Razon, e.Vendedor, DesVendedor = CASE WHEN e.Vendedor = 1 THEN 'Directo' ELSE LTRIM(RTRIM(o.Descripcion)) END from Estadistica e LEFT OUTER JOIN Operador o ON e.Vendedor = o.Vendedor LEFT OUTER JOIN Cliente c ON e.Cliente = c.Cliente where e.DescriTerminadoII <> '' and e.OrdFecha >= '${anio}0101' and e.OrdFecha <= '${anio}1231' ${WFiltroVendedor} GROUP BY e.Numero, e.Cliente, c.Razon, e.Vendedor, o.Descripcion order by e.Vendedor, e.Cliente, e.Numero`)
            return new sql.Request().query(`select count(Distinct e.Articulo) CantProductos, e.Cliente, LTRIM(RTRIM(c.Razon)) Razon, e.Vendedor, DesVendedor = CASE WHEN e.Vendedor = 1 THEN 'Directo' ELSE LTRIM(RTRIM(o.Descripcion)) END from Estadistica e LEFT OUTER JOIN Cliente c ON c.Cliente = e.Cliente LEFT OUTER JOIN Operador o ON o.Vendedor = c.Vendedor where e.OrdFecha between '${anio}0101' and '${anio}1231' ${WFiltroVendedor} GROUP BY e.Cliente, c.Razon, e.Vendedor, o.Descripcion`)
                            .then(result => {
                                                
                                const {recordset} = result;

                                let res = _(recordset)
                                            .groupBy('Vendedor')
                                            .map((Ventas, vend) => (
                                                {
                                                    Vendedor: vend,
                                                    DesVendedor: Ventas[0].DesVendedor,
                                                    Datos: _(Ventas).groupBy('Cliente')
                                                                    .map((Clientes, cli) => (
                                                                        {
                                                                            Cliente: cli,
                                                                            DesCliente: Clientes[0].Razon,
                                                                            CantProductos: Clientes[0].CantProductos
                                                                        }
                                                                    )).value()
                                                }
                                            )).value();
                                
                                return _.sortBy(res, ['DesVendedor']);
                            })

        } catch (error) {
            throw error;        
        }
    },

    async getAllProductos(vendedor, cliente, anio) {
        try {
            let WFiltroVendedor = vendedor == 99 ? '' : ` AND e.Vendedor = '${vendedor}'`;

            return new sql.Request().query(`select e.Numero, e.Renglon, Producto = CASE WHEN e.TipoProDy = 'M' THEN e.ArticuloDy ELSE e.Articulo END, e.Cantidad, e.Precio, e.PrecioUs, e.Cliente, LTRIM(RTRIM(c.Razon)) Razon, e.Paridad, e.Vendedor, DesVendedor = CASE WHEN e.Vendedor = 1 THEN 'Directo' ELSE LTRIM(RTRIM(o.Descripcion)) END , e.Fecha, LTRIM(RTRIM(e.DescriTerminadoII)) DesTerminado from Estadistica e LEFT OUTER JOIN Operador o ON e.Vendedor = o.Vendedor LEFT OUTER JOIN Cliente c ON e.Cliente = c.Cliente where e.DescriTerminadoII <> '' and e.OrdFecha >= '${anio}0101' and e.OrdFecha <= '${anio}1231' ${WFiltroVendedor} and e.Cliente = '${cliente}' order by e.Vendedor, e.Cliente, e.Numero, e.Renglon, Producto`)
                            .then(result => {
                                                
                                const {recordset} = result;

                                let res = _(recordset)
                                            .groupBy('Vendedor')
                                            .map((Ventas, vend) => (
                                                {
                                                    Vendedor: vend,
                                                    DesVendedor: Ventas[0].DesVendedor,
                                                    Datos: _(Ventas).groupBy('Cliente')
                                                                    .map((Clientes, cli) => (
                                                                        {
                                                                            Cliente: cli,
                                                                            DesCliente: Clientes[0].Razon,
                                                                            Datos: _(Clientes).groupBy('Producto')
                                                                                            .map((Productos, prod) => (
                                                                                                {
                                                                                                    Producto: prod,
                                                                                                    DescTerminado: Productos[0].DescTerminado,
                                                                                                    Datos: Productos
                                                                                                }
                                                                                            )).value()
                                                                        }
                                                                    )).value()
                                                }
                                            )).value();
                                
                                return _.sortBy(res, ['DesVendedor']);
                            })

        } catch (error) {
            throw error;        
        }
    },
}

module.exports = Estadisticas;