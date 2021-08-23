const sql = require('mssql');
const config = require('./../Config/ConfigDb');

const AniosFiltro = {
    async getAll(idvendedor) {
        try {
            const WhereCondition = idvendedor == 99 ? '' : `and Vendedor = '${idvendedor}'`

            return new sql.Request().query(`select distinct Anio = LEFT(ordfecha, 4) from Muestra where OrdFecha > '20100101' ${WhereCondition} order by Anio desc`)
                    .then(result => {
                        const {recordset} = result;
                        return recordset;
                    })

        } catch (error) {
            throw error;        
        }
    },
    async getAllPedidos(idvendedor) {
        try {
            const WhereCondition = idvendedor == 99 ? '' : `and c.Vendedor = '${idvendedor}'`

            return new sql.Request().query(`select distinct Anio = LEFT(p.FechaOrd, 4) FROM Pedido p INNER JOIN Cliente c ON c.Cliente = p.Cliente WHERE p.FechaOrd < '21000101' ${WhereCondition} order by Anio DESC`)
                    .then(result => {
                        const {recordset} = result;
                        return recordset;
                    })

        } catch (error) {
            throw error;        
        }
    }
}

module.exports = AniosFiltro;