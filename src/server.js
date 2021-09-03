const express = require('express');
const sql = require('mssql');
const bodyParser = require('body-parser');
const cors = require('cors');
const config = require('./Config/ConfigDb');
const { ProcesarAlarma, ProcesarEstadoAlarma} = require('./Utils/ControlAlarmas/index');

// Include Nodejs' net module.
const Net = require('net');
sql.connect(config);

// Rutas
const HojaRuta = require('./Rutas/Api/Colectora/HojaRuta');
const Muestras = require('./Rutas/Api/Muestras');
const Estadisticas = require('./Rutas/Api/Estadisticas');
const Precios = require('./Rutas/Api/Precios');
const CtasCtes = require('./Rutas/Api/CtasCtes');
const Pedidos = require('./Rutas/Api/Pedidos');
const Login = require('./Rutas/Api/Login');
const AniosFiltro = require('./Rutas/Api/AniosFiltro');
const Proveedores = require('./Rutas/Api/Proveedores');
const app = express();

app.use(express.static('./Vistas'));

app.use('/proveedores', express.static(__dirname + '/Vistas/surfac-proveedores/build'));
app.use('/static', express.static(__dirname + '/Vistas/surfac-proveedores/build/static'));
app.use('/Alarmas', express.static('./ControlAlarmas'));

app.use(express.json());
app.use(bodyParser.json());

/*
 * Rutas para redireccion de Páginas Estáticas.
 */
app.get('/', (req, res) => res.sendFile('./Vistas/index.html'));
app.get('/proveedores', (req, res) => res.sendFile(__dirname + '/Vistas/surfac-proveedores/build/index.html'));

/*
 * Rutas para la App de los Vendedores. 
 */
app.use('/Api/Muestras', Muestras);

app.use('/Api/Estadisticas', Estadisticas);

app.use('/Api/Precios', Precios);
app.use('/Api/CtasCtes', CtasCtes);

app.use('/Api/Pedidos', Pedidos);

app.use('/Api/Login', Login);

app.use('/Api/AniosFiltro', AniosFiltro);
app.use('/Api/Proveedores', cors(), Proveedores);

/*
 * Ruta para control de alarmas. 
 */
app.get('/Alarmas', (req, res) => res.sendFile(__dirname + '/ControlAlarmas/index.html'));
app.get('/Alarmas/Login', (req, res) => res.sendFile(__dirname + '/ControlAlarmas/login.html'));

app.get('/Alarma/Estado/:ip', async (req, res) => {
    try {
        let {ip} = req.params;
        let WEstado = await ProcesarEstadoAlarma(ip, '00');

        // The client can also receive data from the server by reading from its socket.
        WEstado.on('data', function(chunk) {
            //console.log(`Data received from the server: ${chunk.toString()}.`);
            // Request an end to the connection after the data has been received.
            WEstado.end();

            console.log('Estado alarma: ' + chunk.toString());
            return res.json({Estado: chunk.toString()});
        });
    } catch (error) {
        res.json(error);
    }

});

app.get('/Alarma/:disp/:cmd/:delay?', (req, res) => {
    try {
        let {disp, cmd, delay} = req.params;

        if (!delay) delay = "10";

        cmd = cmd.toUpperCase();

        if (cmd != '2X') cmd += ":" + delay;

        console.log("Comando: " + cmd);
        ProcesarAlarma(disp, cmd);

    } catch (error) {
        res.json(error);
    }
    res.send("");
});

// Rutas para colectora (Android).
app.use('/Api/Colectora/HojaRuta', cors(), HojaRuta);

// app.listen(80, () => console.log('Servidor corriendo...'));

app.listen(5500, () => console.log('Servidor corriendo...'));

