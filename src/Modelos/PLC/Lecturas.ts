import dotenv from "dotenv";
import _ from "lodash";
import ModbusRTU from "modbus-serial";
import moment from "moment";
import * as sql from "mssql";
import { ProcessError } from "../../Utils/Helpers";
import { addresses, addressesRedirected } from "./addresses";
import { getDatos } from "./MongoQuery";
import { EQUIPOS } from "./_equipos";

dotenv.config();

export const PLCClient = async (_id: number) => {
	const _equipo = EQUIPOS.find((eq) => eq.id == _id);

	if (!_equipo) throw new Error(`Equipo no definido para id ${_id}`);

	const client = new ModbusRTU();

	const IP = _equipo.ip;
	const PORT: number = _equipo.port;
	const ID_DEVICE = _equipo.id;

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
		return `${_days} días ${_hours} hs ${minutes} min`;
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

interface IAddressRedirected {
	[key: number]: { from: number; to: number; remove: boolean }[];
}

interface IAddress {
	id: number;
	descripcion: string;
	value: string;
	listable: boolean;
	esEvento: boolean;
	unidad: string;
	precision: number;
	realTime: boolean;
	grupo: number;
}

interface ITemp {
	[key: number]: {
		addr: IAddress;
		addr_index: number;
	};
}

const prepareAddresses = (_id_device: number) => {
	console.log(typeof addresses, addresses.length);
	let _addresses = addresses.map((a) => {
		return { ...a };
	});
	const _redirecciones: IAddressRedirected = addressesRedirected;
	if (_redirecciones[_id_device]) {
		const temp: ITemp = {};

		_redirecciones[_id_device].forEach((_red) => {
			const index = _addresses.findIndex((e) => e.id == _red.from);
			if (index > -1) {
				temp[_red.to] = {
					addr: _addresses[index],
					addr_index: index,
				};
			}
		});

		for (const key in temp) {
			const _red = temp[key];
			const _temp = _red.addr;
			_temp.id = parseInt(key);
			_addresses[_red.addr_index] = _temp;
		}
	}

	return _addresses;
};

const datosAMostrar = (_id: number) => {
	let add_ = 568;

	if ((addressesRedirected as IAddressRedirected)[_id]) {
		const _add = (addressesRedirected as IAddressRedirected)[_id].find((e) => e.from == 568);
		if (_add) add_ = _add.to;
	}
	return _.orderBy(
		prepareAddresses(_id).filter((a) => a.realTime && ![579, 1518, 1523].includes(a.id)),
		["grupo"]
	);
};

const datosEventosFijos = _.orderBy(
	addresses.filter((a) => [512, 513, 514, 515, 516, 517, 520, 3113].includes(a.id)),
	["grupo"]
);

const Resumen = {
	Actual: async (_id: number) => {
		/**
		 * Obtenemos el Producto Actual con sus datos.
		 */
		const Producto = await Graficables.ProductoActual(_id);

		console.log("Producto", Producto);

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
		 * Suponiendo periodos de apagado cuando la bomba no se encuentra funcionando,
		 * encuentro el rango de horas en las que no estuvo trabajando.
		 *
		 * {581} es la dirección en memoria del PLC.
		 */
		const LecturasHorasNetasApagado = Datos.filter((d) => d.Address === 581 && !d.Encendido);

		/**
		 * Con las horas trabajadas, encuentro el Horario de arranque.
		 * El cual sería el momento con valor mas chico, ya que se encuentra en el pasado.
		 */
		const ComienzoTrabajo =
			LecturasHorasNetasTrabajadas.length > 0
				? _.min(LecturasHorasNetasTrabajadas.map((d) => d.StartTime))
				: _.min(LecturasHorasNetasApagado.map((d) => d.StartTime));

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
	Historial: async (_partida: string) => {
		/**
		 * Obtenemos el Producto Actual con sus datos.
		 */
		const Producto = await Graficables.ProductoPorPartida(_partida);

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
				`SELECT Address, StartTime, Value, Descripcion, Dispositivo_ID FROM PLCDatos WHERE Partida = '${partida}' and Address IN (${datosEventosFijos
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
	AddressRealTime: (_id: number) => datosAMostrar(_id),
	RealTimeAll: async (_id: number) => {
		try {
			// La última lectura del address que se le pasa a la consulta.
			const options = { sort: { startTime: -1 }, limit: 2 };

			const query = {
				id: {
					$eq: 0,
				},
				id_device: {
					$eq: _id,
				},
			};

			const _datosPrep = datosEventosFijos.map((e) =>
				getDatos("Eventos", { ...query, ...{ id: { $eq: e.id } } }, options)
			);

			const _datos = await Promise.all(_datosPrep);

			// Al usar Promise.all pueden venir ciertas consultas como null. Las filtramos.
			const datos = _datos.map((d) => d[0]).filter((d) => d !== undefined);

			const eventos: Address[] = [];

			for await (const addr of datosEventosFijos) {
				const dato = datos.find((d) => d.id == addr.id);

				if (dato == undefined) continue;

				const { value: _val } = dato;

				eventos.push({
					id: addr.id,
					descripcion: addr.descripcion.trim().toUpperCase(),
					value: _val.trim(),
				});
			}

			const addrPartidaI = 1712;
			const addrPartidaII = 1727;

			const datosII = await getDatos(
				"Data",
				{ ...query, ...{ id: { $in: [addrPartidaI, addrPartidaII] } } },
				options
			);

			if (!datosII) throw new Error("Partida no determinada");

			const { value: _partidaI } = datosII.find((d) => d.id == addrPartidaI) ?? { value: "0" };
			const { value: _partidaII } = datosII.find((d) => d.id == addrPartidaII) ?? { value: "0" };

			let CodProducto = "";
			let DescProducto = "";
			let KilosProducto = 0.0;

			let Partida = `${_partidaI.padEnd(3, "0")}${_partidaII.padStart(3, "0")}`;

			const {
				recordset: [prod],
			} = await new sql.Request().query(
				`SELECT TOP 1 h.Producto, t.Descripcion, h.Teorico FROM Surfactan_III.dbo.Hoja h INNER JOIN Surfactan_III.dbo.Terminado t ON t.Codigo = h.Producto WHERE h.Hoja = '${Partida}'`
			);

			CodProducto = prod?.Producto;
			DescProducto = prod?.Descripcion;
			KilosProducto = prod?.Teorico;

			const producto = {
				Partida,
				CodProducto,
				DescProducto,
				KilosProducto,
			};

			return { producto, eventos };
		} catch (error) {
			console.log(error);
			throw ProcessError(error);
		}
	},
	EstadosEventosFijos: async (_id: number) => {
		try {
			// La última lectura del address que se le pasa a la consulta.
			const options = { sort: { startTime: -1 }, limit: datosEventosFijos.length };

			const query = {
				id: {
					$eq: 0,
				},
				id_device: {
					$eq: _id,
				},
			};

			const _datosPrep = datosEventosFijos.map((e) =>
				getDatos("Eventos", { ...query, ...{ id: { $eq: e.id } } }, options)
			);

			const _datos = await Promise.all(_datosPrep);
			const datos = _datos.map((d) => d[0]).filter((d) => d !== undefined);

			const resp: Address[] = [];

			for await (const addr of datosEventosFijos) {
				const dato = datos.find((d) => d.id == addr.id);

				if (dato == undefined) continue;

				const { value: _val } = dato;

				resp.push({
					id: addr.id,
					descripcion: addr.descripcion.trim().toUpperCase(),
					value: _val.trim(),
				});
			}

			return resp;
		} catch (error) {
			throw ProcessError(error);
		}
	},
	ProductoActual: async (_id: number) => {
		const options = { sort: { startTime: -1 }, limit: 2 };

		const query = {
			id: {
				$in: [],
			},
			id_device: {
				$eq: _id,
			},
		};

		const addrPartidaI = 1712;
		const addrPartidaII = 1727;

		const datosII = await getDatos(
			"Data",
			{ ...query, ...{ id: { $in: [addrPartidaI, addrPartidaII] } } },
			options
		);

		if (!datosII) throw new Error("Partida no determinada");

		const { value: _partidaI } = datosII.find((d) => d.id == 1712) ?? { value: "0" };
		const { value: _partidaII } = datosII.find((d) => d.id == 1727) ?? { value: "0" };

		console.log(datosII.find((d) => d.id == 1727));

		let CodProducto = "";
		let DescProducto = "";
		let KilosProducto = 0.0;

		let Partida = `${_partidaI}${_partidaII}`;

		const {
			recordset: [prod],
		} = await new sql.Request().query(
			`SELECT TOP 1 h.Producto, t.Descripcion, h.Teorico FROM Surfactan_III.dbo.Hoja h INNER JOIN Surfactan_III.dbo.Terminado t ON t.Codigo = h.Producto WHERE h.Hoja = '${Partida}'`
		);

		CodProducto = prod?.Producto;
		DescProducto = prod?.Descripcion;
		KilosProducto = prod?.Teorico;

		return {
			Partida,
			CodProducto,
			DescProducto,
			KilosProducto,
			bla: datosII.find((d) => d.id == 1727),
		};
	},
	ProductoPorPartida: async (_partida: string) => {
		let CodProducto = ``;
		let DescProducto = ``;
		let KilosProducto = 0.0;

		const {
			recordset: [prod],
		} = await new sql.Request().query(
			`SELECT TOP 1 h.Producto, t.Descripcion, h.Teorico FROM Surfactan_III.dbo.Hoja h INNER JOIN Surfactan_III.dbo.Terminado t ON t.Codigo = h.Producto WHERE h.Hoja = '${_partida}'`
		);

		CodProducto = prod["Producto"];
		DescProducto = prod["Descripcion"];
		KilosProducto = prod["Teorico"];

		return {
			Partida: _partida,
			CodProducto,
			DescProducto,
			KilosProducto,
		};
	},
	GetValoresActuales: async (_id: number): Promise<Address[]> => {
		try {
			// La última lectura del address que se le pasa a la consulta.
			const options = { sort: { startTime: -1 }, limit: datosAMostrar(_id).length };
			const query = {
				id: {
					$in: [
						...datosAMostrar(_id).map((a) => a.id),
						...((addressesRedirected as IAddressRedirected)[_id] || []).map((e) => e.to),
					],
				},
				id_device: {
					$eq: _id,
				},
			};

			const datos = await getDatos("Data", { ...query }, options);

			const resp: Address[] = [];

			let cleanResults = false;

			for await (const addr of datosAMostrar(_id)) {
				const data = datos.find((d) => d.id == addr.id);

				if (data == undefined) continue;

				let _val = data.value.trim();
				let _valSeteo = "0";

				/**
				 * Norma:
				 *  569 -> Real | 568 -> seteo
				 *
				 * Redireccionado:
				 *  568 -> Real | 566 -> Seteo
				 */
				switch (addr.id) {
					case 569:
						// console.log(datos);
						({ value: _valSeteo } = datos.find((d) => d.id == 568) ?? { value: "0" });
						const idx = datos.findIndex((d) => d.id == 568);
						if (idx > -1) cleanResults = true;
						break;
					case 580:
						({ value: _valSeteo } = datos.find((d) => d.id == 579) ?? { value: "0" });
					case 568:
						if ((addressesRedirected as IAddressRedirected)[_id] != undefined) {
							// addr.id == 568 -> d.from deberia ser == 568 y buscar la direccion en d.to de esa redireccion.
							const add_ = (addressesRedirected as IAddressRedirected)[_id].find((d) => d.from == 568);
							if (add_) {
								({ value: _valSeteo } = datos.find((d) => d.id == add_.to) ?? { value: "0" });
							}
						}
						break;
					default:
						break;
				}

				let val = _val;
				let valSeteo = _valSeteo;

				if (addr.precision > 0) {
					val = (parseFloat(_val) / Math.pow(10, addr.precision)).toFixed(addr.precision);
					valSeteo = (parseFloat(_valSeteo) / Math.pow(10, addr.precision)).toFixed(addr.precision);
				}

				// console.log(val, _val, valSeteo, _valSeteo);

				resp.push({
					id: addr.id,
					descripcion: addr.descripcion.trim().toUpperCase(),
					value: val,
					unidad: addr.unidad,
					seteo: valSeteo,
				} as Address);
			}

			// Removemos las redirecciones de los resultados a enviar al consultante.
			if ((addressesRedirected as IAddressRedirected)[_id]) {
				// Busco las redirecciones del equipo.
				const redirecciones = (addressesRedirected as IAddressRedirected)[_id].filter((r) => r.remove);

				// Elimino una por una buscando la referencia de la posicion dentro de los resultados.
				for (const red_ of redirecciones) {
					const idx = resp.findIndex((d) => d.id == red_.to);
					if (idx > -1) resp.splice(idx, 1); // Borro del original
				}
			} else {
				const idx = resp.findIndex((d) => d.id == 568);
				if (idx > -1) resp.splice(idx, 1);
			}

			return resp;
		} catch (error) {
			throw ProcessError(error);
		}
	},
	GetValorActual: async (address: string, _id: number): Promise<Address> => {
		try {
			const client = await PLCClient(_id);

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
	PorPeriodo: async (
		address: string,
		periodo: number | string,
		partida: number | string,
		_id: number,
		_estado: number = 1
	) => {
		try {
			if (partida == "0") {
				const _prod = await Graficables.ProductoActual(_id);
				partida = _prod.Partida;
			}

			let partidaFiltro = partida != "0" ? ` AND Partida = '${partida}'` : "";

			const { recordset } = await new sql.Request().query(
				`SELECT * FROM PLCDatos WHERE Address = '${address}' ${partidaFiltro} AND Encendido = 1 AND StartTime >= (SELECT Max(StartTime) FROM PlcDatos WHERE Address = '${address}' AND Encendido = ${_estado} ${partidaFiltro}) - ${periodo}  AND EndTime <= (SELECT Max(EndTime) FROM PlcDatos WHERE Address = ${address} AND Encendido = ${_estado} ${partidaFiltro}) ORDER BY ID`
			);

			return recordset;
		} catch (error) {
			throw ProcessError(error);
		}
	},
	PorPartida: async (address: string, partida: number | string) => {
		try {
			const { recordset } = await new sql.Request().query(
				`SELECT * FROM PLCDatos WHERE Address = '${address}' AND Partida = '${partida}' ORDER BY ID`
			);

			return recordset;
		} catch (error) {
			throw ProcessError(error);
		}
	},
	PartidasSeleccionables: async (_id: number) => {
		let Prod;

		try {
			Prod = await Graficables.ProductoActual(_id);
		} catch (error) {
			Prod = {
				Partida: 0,
			};
		}

		try {
			const { recordset } = await new sql.Request().query(
				`SELECT h.Hoja as Partida, t.Descripcion FROM (SELECT Partida, min(StartTime) As Inicio FROM PlcDatos GROUP BY Partida) plc INNER JOIN Surfactan_III.dbo.Hoja h ON h.Renglon = 1 AND h.Hoja = plc.Partida INNER JOIN Terminado t ON t.Codigo = h.Producto WHERE plc.Partida <> '${
					Prod.Partida || ""
				}' ORDER BY plc.Inicio DESC`
			);

			return recordset;
		} catch (error) {
			throw ProcessError(error);
		}
	},
};

export { Graficables, Resumen };
