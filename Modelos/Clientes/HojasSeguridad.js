const sql = require('mssql');

const BuscarHojasCliente = async (cliente) => {
    try {

        console.log(`Cliente: ${cliente}`)
        
        cliente = cliente.toUpperCase();

        const {recordset} = await new sql.Request().query(`SELECT h.Hoja, h.Pedido, h.Razon, h.Fecha, h.OrdFecha,
        h.Bultos, p.Lote1, p.Lote2, p.Lote3, p.Lote4, p.Lote5, p.UltimoLote1, p.UltimoLote2, p.UltimoLote3, p.UltimoLote4, p.UltimoLote5 
        FROM HojaRuta h INNER JOIN Pedido p ON p.Pedido = h.Pedido And p.Remito = h.Remito WHERE h.Hoja = '${cliente}' ORDER BY h.Pedido`);

        return recordset;

    } catch (error) {
        throw error;        
    }
}

const DescargarHoja = async (nombreHoja) => {
    try {

        console.log(`Nombre Hoja de Seguridad: ${nombreHoja}`)
        
        nombreHoja = nombreHoja.toUpperCase();
        const {recordset} = await new sql.Request().query(`SELECT Estado, Lote, Pedido FROM ProcesoCentroImpresion WHERE CodBarra = '${cliente}'`);

        return recordset;

    } catch (error) {
        throw error;        
    }
}

const HojasSeguridad = {
    BuscarHojasCliente,
    DescargarHoja,
}

module.exports = HojasSeguridad