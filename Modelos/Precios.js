const sql = require('mssql');
const config = require('./../Config/ConfigDb');
const _ = require('lodash');

const Precios = {
    async getAll(vendedor, anio) {
        try {
            let WFiltroVendedor = vendedor == 99 ? '' : ` AND c.Vendedor = '${vendedor}'`;

            return new sql.Request().query(`SELECT p.Cliente, LTRIM(RTRIM(ISNULL(c.Razon, ''))) as DesCliente, c.Vendedor, LTRIM(RTRIM(ISNULL(o.descripcion, ''))) as DesVendedor, COUNT(p.Terminado) as CantidadTerminados FROM Precios p INNER JOIN Cliente c ON p.cliente = c.Cliente INNER JOIN Operador o ON c.Vendedor = o.Vendedor WHERE p.Cliente IN (SELECT e.Cliente FROM Estadistica e WHERE e.OrdFecha BETWEEN '${anio}0101' and '${anio}1231') ${WFiltroVendedor} GROUP BY c.Vendedor, o.Descripcion, p.Cliente, c.Razon ORDER BY o.Descripcion, c.Razon`)
                          .then(result => {

                                const {recordset} = result;

                                let res = _(recordset)
                                                    .groupBy('Vendedor')
                                                    .map((Clientes, vend) => (
                                                        {
                                                            Vendedor: vend,
                                                            DesVendedor: Clientes[0].DesVendedor,
                                                            Datos: Clientes
                                                        }
                                                    )).value();
                    
                                return _.sortBy(res, ['DesVendedor']);
                          })

        } catch (error) {
            throw error;        
        }
    },
    async getAllCliente(vendedor, anio, cliente) {
        try {
            
            return new sql.Request().query(`select p.Terminado, LTRIM(RTRIM(ISNULL(p.Descripcion,''))) as DesTerminado, p.Cliente, LTRIM(RTRIM(ISNULL(c.Razon, ''))) as DesCliente, p.Precio from Precios p INNER JOIN Cliente c ON p.Cliente = c.Cliente INNER JOIN Operador o ON c.Vendedor = o.Vendedor WHERE p.Cliente = '${cliente}' and c.Vendedor = '${vendedor}' AND p.Precio <> 0 ORDER BY c.Vendedor, p.Cliente, p.Terminado`)
                        .then(result => {
                            const {recordset} = result;

                            let res = _(recordset)
                                        .groupBy('Cliente')
                                        .map((Productos, vend) => (
                                            {
                                                Cliente: vend,
                                                DesCliente: Productos[0].DesCliente,
                                                Datos: Productos
                                            }
                                        )).value();
                                                
                            return _.sortBy(res, ['DesVendedor']);
                        })
            

        } catch (error) {
            throw error;        
        }
    },
}

module.exports = Precios;