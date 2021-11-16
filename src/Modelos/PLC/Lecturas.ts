import ModbusRTU from "modbus-serial";
import * as sql from "mssql";
import { ProcessError } from "../../Utils/Helpers";
import { addresses } from "./addresses";
import dotenv from "dotenv";
import _ from "lodash";
import moment from "moment";
import { parse } from "path/posix";

dotenv.config();

const PLCClient = async () => {
	const client = new ModbusRTU();

	const IP = process.env["PLC_IP"] || "127.0.0.1";
	const PORT: number = (process.env["PLC_PORT"] || 502) as number;
	const ID_DEVICE = (process.env["PLC_ID_DEVICE"] || 0) as number;

	await client.connectTCP(IP, { port: PORT });

	client.setID(ID_DEVICE);

	client.setTimeout(10000);

	return client;
};

/**
 * Genero el string que se va a mostrar en la UI.
 */
const generarFechaComoString = (resto: number, diasCompletos: number) => {
	let hours = Math.floor(resto / 3600);
	let minutes = Math.ceil((resto / 3600 - hours) * 60);

	if (minutes == 60) {
		hours += 1;
		minutes = 0;
	}

	const _hours = hours.toString().padStart(2, "0");
	const _minutes = minutes.toString().padStart(2, "0");
	const _days = Math.floor(diasCompletos / 86400)
		.toString()
		.padStart(2, "0");

	if (diasCompletos > 0) {
		return `${_days} días con ${_hours} hs ${minutes} min`;
	} else {
		return `${_hours} hs ${_minutes} min`;
	}
};

export interface Address {
	id: number;
	descripcion: string;
	value: string;
}

export interface Data {
	values: Address[];
	start: number;
	end: number;
}

export interface Values {
	data: Data[];
}

const datosAMostrar = _.orderBy(
	addresses.filter((a) => a.realTime && ![568, 579, 1518, 1523].includes(a.id)),
	["grupo"]
);

const datosEventosFijos = _.orderBy(
	addresses.filter((a) => [512, 513, 514, 515, 516, 517, 520, 3113].includes(a.id)),
	["grupo"]
);

const Resumen = {
	Actual: async () => {
		/**
		 * Obtenemos el Producto Actual con sus datos.
		 */
		const Producto = await Graficables.ProductoActual();

		/**
		 * Obtengo todos los datos que tenga guardados hasta el momento para esta Partida.
		 */
		const Datos = await Resumen.DatosPorPartida(Producto.Partida); // Para uso en producción.
		// const Datos = await Resumen.DatosPorPartida("313027"); // Sólo para debug o preparación del algoritmo.

		const MOMENTO_ACTUAL = moment().unix();

		/**
		 * Suponiendo que la bomba se encuentra encendida cuando el equipo se encuentra secando,
		 * encuentro las horas netas trabajadas.
		 *
		 * {581} es la dirección en memoria del PLC.
		 */
		const LecturasHorasNetasTrabajadas = Datos.filter((d) => d.Address === 581 && d.Encendido);

		/**
		 * Con las horas trabajadas, encuentro el Horario de arranque.
		 * El cual sería el momento con valor mas chico, ya que se encuentra en el pasado.
		 */
		const ComienzoTrabajo =
			LecturasHorasNetasTrabajadas.length > 0 ? _.min(LecturasHorasNetasTrabajadas.map((d) => d.StartTime)) : 0;

		/**
		 * Suponiendo periodos de apagado cuando la bomba no se encuentra funcionando,
		 * encuentro el rango de horas en las que no estuvo trabajando.
		 *
		 * {581} es la dirección en memoria del PLC.
		 */
		const LecturasHorasNetasApagado = Datos.filter((d) => d.Address === 581 && !d.Encendido);

		/**
		 * Puedo saber si en algun momento detuvieron el equipo.
		 * No se si va a ser de utilidad...
		 */
		const SeDetuvo = LecturasHorasNetasApagado.length > 0;

		/**
		 * Encuentro la primera detencion inmediatamente posterior al arranque.
		 *
		 * Sería el valor de Comienzo de la lectura con valor mas chico.
		 */
		const PrimeraDetencion = SeDetuvo
			? _.min(LecturasHorasNetasApagado.filter((d) => d.StartTime >= ComienzoTrabajo).map((d) => d.StartTime))
			: 0;

		/**
		 * Guardo el primer período.
		 */
		const Periodos = [
			{
				inicio: ComienzoTrabajo,
				fin: PrimeraDetencion,
			},
		];

		/**
		 * Definimos el fin del período de Detención buscando el primer cambio de estado a Encendido
		 * inmediatamente posterior a la primera detención.
		 *
		 * En estos filtrados, en caso de no encontrar coincidencia, se devuelve {undefined}.
		 */
		let proximoArranque = _.min(
			LecturasHorasNetasTrabajadas.filter((d) => d.StartTime >= PrimeraDetencion).map((d) => d.StartTime)
		);

		/**
		 * En caso de que se haya encontrado un nuevo arranque, buscamos recursivamente la próxima detención.
		 */
		while (proximoArranque != undefined) {
			/** Busco detención */
			let proximaDetencion = _.min(
				LecturasHorasNetasApagado.filter((d) => d.StartTime > proximoArranque).map((d) => d.StartTime)
			);

			/**
			 * Guardo la información con su respectivo encendido. Toma 0 en caso de no tener alguno de los dos valores.
			 * Esto puede ocurrir en caso de que el filtro no devuelva alguna ocurrencia.
			 */
			Periodos.push({
				inicio: proximoArranque || 0,
				fin: proximaDetencion || 0,
			});

			/**
			 * Busco si hay un nuevo encendido. Si no lo hubiera, termina el ciclo.
			 * Ya que, o bien no finalizó todavía el proceso o porque sigue apagado el equipo.
			 */
			proximoArranque = _.min(
				LecturasHorasNetasTrabajadas.filter((d) => d.StartTime > proximaDetencion).map((d) => d.StartTime)
			);
		}

		/**
		 * Teniendo los Periodos, busco el rango de trabajo definido como:
		 *  - Inicio = Primer [inicio]
		 *  - Final = último [final] o [MOMENTO ACTUAL].
		 */
		const Inicio = Periodos[0].inicio;
		const Final = Periodos[Periodos.length - 1].fin > 0 ? Periodos[Periodos.length - 1].fin : MOMENTO_ACTUAL;

		/**
		 * Sumo los segundos entre [inicio] y [fin] de cada periodo, usando `reduce` por cuestiones de performance.
		 */
		let _horasEnc = Periodos.reduce(
			// Si curr.fin es 0, significa que el período actual que estamos calculando todavía no finalizó. En estos casos, tomamos el momento actual como 'fin' parcial.
			(pre, curr) => pre + (curr.fin > 0 ? curr.fin - curr.inicio : MOMENTO_ACTUAL - curr.inicio),
			0
		);

		/**
		 * Sabiendo la cantidad de segundos que pasó el equipo encendio,
		 * el tiempo que paso apagado se puede calcular como la diferencia entre estos ...
		 * */
		const _horasApagado = Final - Inicio - _horasEnc;

		const TiempoTotalProceso = Final - Inicio;

		/**
		 * Aca se hace un chanchuyo. Prestar atención. Al haber calculado el Tiempo Total de Trabajo como Inicio - Final, nos quedan sólo
		 * los segundos que pasaron desde el Inicio del proceso. Ahora hacemos uso de la librería para que nos calcule la fecha en UNIX EPOCH
		 * que correspondería a esa cantidad de segundos. Como UNIX EPOCH es en UTC y nosotros tenemos los segundos calculados en UTC-3,
		 * tenemos que agregarle la diferencia de horas. Ahora bien, UNIX EPOCH comienza a contar desde el 1 de enero de 1970,
		 * por lo que hay que retrotraer un día para que comience a calcular desde las 00 del 31 de diciembre de 1969 (comienzo del día 1).
		 *
		 * Pasando de esto { 1 dias 5 horas 3 minutos 50 segundos } a { 0 dias 5 horas 3 minutos 50 segundos }.
		 *
		 * ...easy-peasy
		 */
		// const encendido = { ...moment.unix(_horasEnc).add(3, "hours").subtract(1, "day").toObject(), asString: "" };
		// const apagado = { ...moment.unix(_horasApagado).add(3, "hours").subtract(1, "day").toObject(), asString: "" };
		// const total = {
		// 	...moment.unix(TiempoTotalProceso).add(3, "hours").subtract(1, "day").toObject(),
		// 	asString: "",
		// };

		const restoHorasEncendidas = _horasEnc % 86400; // 60 seg * 60 min * 24 hrs = 86400 seg.
		const cantDiasCompletosEncendida = _horasEnc - restoHorasEncendidas;

		const encendido = { asString: generarFechaComoString(restoHorasEncendidas, cantDiasCompletosEncendida) };

		const restoHorasApagadas = _horasApagado % 86400; // 60 seg * 60 min * 24 hrs = 86400 seg.
		const cantDiasCompletosApagadas = _horasApagado - restoHorasApagadas;

		const apagado = { asString: generarFechaComoString(restoHorasApagadas, cantDiasCompletosApagadas) };

		const restoHorasTotales = TiempoTotalProceso % 86400; // 60 seg * 60 min * 24 hrs = 86400 seg.
		const cantDiasCompletosTotales = TiempoTotalProceso - restoHorasTotales;

		const total = { asString: generarFechaComoString(restoHorasTotales, cantDiasCompletosTotales) };

		// encendido.asString = generarFechaComoString(encendido);
		// apagado.asString = generarFechaComoString(apagado);
		// total.asString = generarFechaComoString(total);

		/**
		 * Traemos los eventos ocurridos hasta el momento.
		 */
		const eventos = (await Resumen.EventosPorPartida(Producto.Partida)).map((e) => {
			return {
				Address: e["Address"] as number,
				Descripcion: (e["Descripcion"] as string).trim(),
				Value: parseInt((e["Value"] as string).trim()),
				StartTime: e["StartTime"] as number,
			};
		});

		const EVENTOS = [] as object[];
		datosEventosFijos.forEach((e) => {
			const datos = eventos.filter((_e) => _e.Address == e.id);

			/**
			 * Suponemos que arrancan apagados.
			 */
			let ultimo = 0;

			datos.forEach((d) => {
				if (d.Value != ultimo) {
					EVENTOS.push({ ...d, asString: moment.unix(d.StartTime).format("DD/MM/YYYY HH:mm:ss") });
					ultimo = d.Value;
				}
			});
		});

		const Eventos = _.orderBy(EVENTOS, ["StartTime"], ["desc"]);

		/**
		 * Envío los datos procesados.
		 */
		return { encendido, apagado, total, Periodos, Eventos };
	},
	DatosPorPartida: async (partida: string) => {
		try {
			const { recordset } = await new sql.Request().query(
				`SELECT * FROM PLCDatos WHERE Partida = '${partida}' ORDER BY ID`
			);

			return recordset;
		} catch (error) {
			throw ProcessError(error);
		}
	},
	EventosPorPartida: async (partida: string) => {
		try {
			const { recordset } = await new sql.Request().query(
				`SELECT Address, StartTime, Value, Descripcion FROM PLCDatos WHERE Partida = '${partida}' and Address IN (${datosEventosFijos
					.map((e) => e.id)
					.join(",")}) ORDER BY Address, StartTime`
			);

			return recordset;
		} catch (error) {
			throw ProcessError(error);
		}
	},
};

const Graficables = {
	AddressRealTime: () => datosAMostrar,
	EstadosEventosFijos: async () => {
		try {
			const client = await PLCClient();

			const resp: Address[] = [];

			for await (const addr of datosEventosFijos) {
				const {
					data: [_val],
				} = await client.readHoldingRegisters(addr.id, 1);

				resp.push({
					id: addr.id,
					descripcion: addr.descripcion.trim().toUpperCase(),
					value: _val.toString(),
				});
			}

			client.close(() => {});

			return resp;
		} catch (error) {
			throw ProcessError(error);
		}
	},
	ProductoActual: async () => {
		const client = await PLCClient();

		const addrPartidaI = 1712;
		const addrPartidaII = 1727;

		const {
			data: [_partidaI],
		} = await client.readHoldingRegisters(addrPartidaI, 1);

		const {
			data: [_partidaII],
		} = await client.readHoldingRegisters(addrPartidaII, 1);

		let CodProducto = ``;
		let DescProducto = ``;
		let KilosProducto = 0.0;

		let Partida = `${_partidaI.toString().padEnd(3, "0")}${_partidaII.toString().padStart(3, "0")}`;

		const {
			recordset: [prod],
		} = await new sql.Request().query(
			`SELECT TOP 1 h.Producto, t.Descripcion, h.Teorico FROM Surfactan_III.dbo.Hoja h INNER JOIN Surfactan_III.dbo.Terminado t ON t.Codigo = h.Producto WHERE h.Hoja = '${Partida}'`
		);

		CodProducto = prod["Producto"];
		DescProducto = prod["Descripcion"];
		KilosProducto = prod["Teorico"];

		client.close(() => {});

		return {
			Partida,
			CodProducto,
			DescProducto,
			KilosProducto,
		};
	},
	GetValoresActuales: async (): Promise<Address[]> => {
		try {
			const client = await PLCClient();

			const resp: Address[] = [];

			for await (const addr of datosAMostrar) {
				const {
					data: [_val],
				} = await client.readHoldingRegisters(addr.id, 1);

				let _valSeteo = 0;

				switch (addr.id) {
					case 569:
						({
							data: [_valSeteo],
						} = await client.readHoldingRegisters(568, 1));
						break;
					case 580:
						({
							data: [_valSeteo],
						} = await client.readHoldingRegisters(579, 1));
						break;
					default:
						break;
				}

				let val = _val.toString().trim();
				let valSeteo = _valSeteo.toString();

				if (addr.precision > 0) val = (_val / Math.pow(10, addr.precision)).toFixed(addr.precision);
				if (addr.precision > 0) valSeteo = (_valSeteo / Math.pow(10, addr.precision)).toFixed(addr.precision);

				resp.push({
					id: addr.id,
					descripcion: addr.descripcion.trim().toUpperCase(),
					value: val,
					unidad: addr.unidad,
					seteo: valSeteo,
				} as Address);
			}

			client.close(() => {});

			return resp;
		} catch (error) {
			throw ProcessError(error);
		}
	},
	GetValorActual: async (address: string): Promise<Address> => {
		try {
			const client = await PLCClient();

			const _addr = addresses.find((a) => a.id === parseInt(address));

			const _desc = _addr ? _addr.descripcion.trim() : "";

			const {
				data: [_val],
			} = await client.readHoldingRegisters(parseInt(address), 1);

			client.close(() => {});

			return {
				id: parseInt(address),
				descripcion: _desc,
				value: _val.toString(),
			} as Address;
		} catch (error) {
			throw ProcessError(error);
		}
	},
	PorPeriodo: async (address: string, start: number | string, end: number | string, partida: number | string) => {
		try {
			if (partida == "0") {
				const _prod = await Graficables.ProductoActual();
				partida = _prod.Partida;
			}

			let partidaFiltro = partida != "0" ? ` AND Partida = '${partida}'` : "";

			const { recordset } = await new sql.Request().query(
				`SELECT * FROM PLCDatos WHERE Address = '${address}' ${partidaFiltro} AND StartTime >= '${start}' AND EndTime <= '${end}' ORDER BY ID`
			);

			return recordset;
		} catch (error) {
			throw ProcessError(error);
		}
	},
};

export { Graficables, Resumen };
