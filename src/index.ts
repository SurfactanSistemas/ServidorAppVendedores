import { Express } from "express";
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
    // Descomentar despuest.
    // await sql.connect(ConfigDb);



}

