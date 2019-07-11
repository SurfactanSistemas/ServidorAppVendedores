const sql = require('mssql');
const config = require('./../Config/ConfigDb');

const Login = {
    async logIn(clave) {
        try {
            
            clave = clave.toUpperCase();
            return new sql.Request().query(`SELECT Vendedor, ISNULL(PermisosAlarma, '0000') PermisosAlarma FROM Operador WHERE Vendedor <> 0 AND UPPER(Clave) = '${clave}'`).then(result => {
                const {recordset} = result;
                return recordset;
            });
    
        } catch (error) {
            throw error;        
        }
    }
}

module.exports = Login;