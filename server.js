const express = require('express');
const sql = require('mssql');
const bodyParser = require('body-parser');
const config = require('./Config/ConfigDb');

sql.connect(config);

// Rutas
const Muestras = require('./Rutas/Api/Muestras');
const Estadisticas = require('./Rutas/Api/Estadisticas');
const Precios = require('./Rutas/Api/Precios');
const Pedidos = require('./Rutas/Api/Pedidos');
const Login = require('./Rutas/Api/Login');
const AniosFiltro = require('./Rutas/Api/AniosFiltro');

const app = express();

app.use(express.static('./Vistas'))
app.use(express.json());
app.use(bodyParser.json());

//app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => res.sendFile('./Vistas/index.html'));

app.use('/Api/Muestras', Muestras);
app.use('/Api/Estadisticas', Estadisticas);
app.use('/Api/Precios', Precios);
app.use('/Api/Pedidos', Pedidos);
app.use('/Api/Login', Login);
app.use('/Api/AniosFiltro', AniosFiltro);

app.listen(80, () => console.log('Servidor corriendo...'));
// app.listen(3000, () => console.log('Servidor corriendo...'));