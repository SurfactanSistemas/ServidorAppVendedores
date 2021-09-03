"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcesarEstadoAlarma = exports.ProcesarAlarma = void 0;
// const Net = require('net');
const Net = __importStar(require("net"));
const ProcesarEstadoAlarma = async (disp, cmd) => {
    // The port number and hostname of the server.
    const port = 6722;
    const host = disp;
    // Create a new TCP client.
    const client = new Net.Socket();
    client.on('end', function () {
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
};
exports.ProcesarEstadoAlarma = ProcesarEstadoAlarma;
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
    client.on('data', function (chunk) {
        console.log(`Data received from the server: ${chunk.toString()}.`);
        // Request an end to the connection after the data has been received.
        client.end();
    });
    client.on('end', function () {
        console.log('Requested an end to the TCP connection');
    });
};
exports.ProcesarAlarma = ProcesarAlarma;
