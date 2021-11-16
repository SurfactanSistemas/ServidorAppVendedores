import express from "express";
import * as sql from "mssql";
import * as bodyParser from "body-parser";
import cors from "cors";
import { ConfigDb } from "./Config/ConfigDb";
import * as dotenv from "dotenv";

dotenv.config();

/**
 * Importamos las rutas.
 */

import {
	Login,
	Muestras,
	Estadisticas,
	Precios,
	CtasCtes,
	Pedidos,
	AniosFiltro,
	Proveedores,
	ColectoraHojaRuta,
	ClientesWeb,
	PLC,
} from "./Rutas";
import path from "path";

/**
 * Conectamos a la base de datos.
 */

const init = async () => {
	// Abrimos la conexión con la BD.
	await sql.connect(ConfigDb);

	// Inicializamos express para manejar el enrutamiento.
	const app = express();

	app.use(express.static(__dirname + "/../Vistas/PLC/Monitor"));
	app.use("/admin/dashboard", express.static(__dirname + "/../Vistas/PLC/Monitor"));
	app.use("/admin/monitoreo", express.static(__dirname + "/../Vistas/PLC/Monitor"));

	app.use("/Alarmas", express.static("./ControlAlarmas"));

	app.use(express.json());
	app.use(bodyParser.json());

	/*
	 * Rutas para redireccion de Páginas Estáticas.
	 */
	app.get("/", (_req, res) => res.sendFile(path.resolve(__dirname + "/../Vistas/PLC/Monitor/index.html")));

	/*
	 * Rutas para la App de los Vendedores.
	 */
	app.use("/Api/Muestras", Muestras);

	app.use("/Api/Estadisticas", Estadisticas);

	app.use("/Api/Precios", Precios);
	app.use("/Api/CtasCtes", CtasCtes);

	app.use("/Api/Pedidos", Pedidos);

	app.use("/Api/Login", Login);

	app.use("/Api/AniosFiltro", AniosFiltro);
	app.use("/Api/Proveedores", cors(), Proveedores);
	app.use("/Api/Colectora/HojaRuta", cors(), ColectoraHojaRuta);
	app.use("/Api/Clientes", cors(), ClientesWeb);
	app.use("/Api/PLC", cors(), PLC);

	const PORT = process.env.PORT;

	app.listen(PORT, () => console.log(`Servidor corriendo en ${PORT}`));
};

init();
