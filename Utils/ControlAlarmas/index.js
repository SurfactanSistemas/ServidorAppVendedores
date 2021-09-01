const Net = require('net');

const ProcesarEstadoAlarma = async (disp, cmd) => {
    
    // The port number and hostname of the server.
    const port = 6722;
    const host = disp;
    
    // Create a new TCP client.
    const client = new Net.Socket();
    
    client.on('end', function() {
        console.log('Requested an end to the TCP connection');
    });
    
    // Send a connection request to the server.
    return client.connect({ port: port, host: host }, () => {
        // If there is no error, the server has accepted the request and created a new 
        // socket dedicated to us.
        console.log('TCP connection established with the server. Consultando Estado de Dispositivo...');
        
        // The client can now send data to the server by writing to its socket.
        client.write(cmd);
    });
}

const ProcesarAlarma = (disp, cmd) => {
    // The port number and hostname of the server.
    const port = 6722;
    const host = disp;
    
    // Create a new TCP client.
    const client = new Net.Socket();
    // Send a connection request to the server.
    client.connect({ port: port, host: host }, () => {
        // If there is no error, the server has accepted the request and created a new 
        // socket dedicated to us.
        console.log('TCP connection established with the server.');
        // The client can now send data to the server by writing to its socket.
        client.write(cmd);
        client.end();
    });
    
    // The client can also receive data from the server by reading from its socket.
    client.on('data', function(chunk) {
        console.log(`Data received from the server: ${chunk.toString()}.`);
        // Request an end to the connection after the data has been received.
        client.end();
    });
    
    client.on('end', function() {
        console.log('Requested an end to the TCP connection');
    });
}

const UtilAlarmas = {
    ProcesarAlarma,
    ProcesarEstadoAlarma
}

module.exports = UtilAlarmas;