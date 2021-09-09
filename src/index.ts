import express from "express";
import * as sql from "mssql";
import * as bodyParser from "body-parser";
import * as cors from "cors";
import { ConfigDb } from "./Config/ConfigDb";
import { ProcesarAlarma, ProcesarEstadoAlarma } from "./Utils/ControlAlarmas";

/**
 * Importamos las rutas.
 */

import { Login } from "./Rutas"

/**
 * Conectamos a la base de datos.
 */

const init = async () => {
    // Abrimos la conexión con la BD.
    await sql.connect(ConfigDb);

    // Inicializamos express para manejar el enrutamiento.
    const app = express();

    app.use(express.static('./Vistas'))

}

