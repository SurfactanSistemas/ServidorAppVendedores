import * as express from "express";
import ping from "ping";
import { Graficables, PLCClient, Resumen } from "../../../Modelos/PLC/Lecturas";
import { EQUIPOS } from "../../../Modelos/PLC/_equipos";
import { CustomError } from "../../../Utils/CustomError";

const router = express.Router();

router.get("/datos/realTime/direcciones", async (req, res) => {
	try {
		const resultados = Graficables.AddressRealTime();

		res.json({ error: false, resultados, errorMsg: "" });
	} catch (err) {
		res.json({
			error: true,
			resultados: [],
			ErrorMsg: (err as CustomError).toString(),
		});
	}
});

router.get("/datos/realTime/resumen/actual/:id", async (req, res) => {
	try {
		const { id } = req.params;
		const resultados = await Resumen.Actual(parseInt(id));

		res.json({ error: false, resultados, errorMsg: "" });
	} catch (err) {
		res.json({
			error: true,
			resultados: [],
			ErrorMsg: (err as CustomError).toString(),
		});
	}
});

router.get("/datos/realTime/resumen/historial/partidas/:id", async (req, res) => {
	try {
		const { id } = req.params;
		const resultados = await Graficables.PartidasSeleccionables(parseInt(id));

		res.json({ error: false, resultados, errorMsg: "" });
	} catch (err) {
		res.json({
			error: true,
			resultados: [],
			ErrorMsg: (err as CustomError).toString(),
		});
	}
});

router.get("/datos/realTime/resumen/historial/por_partida/:partida", async (req, res) => {
	try {
		const { partida } = req.params;

		const resultados = await Resumen.Historial(partida);

		res.json({ error: false, resultados, errorMsg: "" });
	} catch (err) {
		res.json({
			error: true,
			resultados: [],
			ErrorMsg: (err as CustomError).toString(),
		});
	}
});

router.get("/datos/realTime/all/:id", async (req, res) => {
	try {
		const { id } = req.params;
		const resultados = await Graficables.RealTimeAll(parseInt(id));

		res.json({ error: false, resultados, errorMsg: "" });
	} catch (err) {
		res.json({
			error: true,
			resultados: [],
			ErrorMsg: JSON.stringify(err as CustomError),
		});
	}
});

router.get("/datos/realTime/producto/:id", async (req, res) => {
	try {
		const { id } = req.params;
		const resultados = await Graficables.ProductoActual(parseInt(id));

		res.json({ error: false, resultados, errorMsg: "" });
	} catch (err) {
		res.json({
			error: true,
			resultados: [],
			ErrorMsg: (err as CustomError).toString(),
		});
	}
});

router.get("/datos/realTime/eventos_fijos/:id", async (req, res) => {
	try {
		const { id } = req.params;
		const resultados = await Graficables.EstadosEventosFijos(parseInt(id));

		res.json({ error: false, resultados, errorMsg: "" });
	} catch (err) {
		res.json({
			error: true,
			resultados: [],
			ErrorMsg: (err as CustomError).toString(),
		});
	}
});

router.get("/datos/graficables/por_partida/:address/:partida", async (req, res) => {
	try {
		const { address, partida } = req.params;

		const resultados = await Graficables.PorPartida(address, partida);

		res.json({ error: false, resultados, errorMsg: "" });
	} catch (err) {
		res.json({
			error: true,
			resultados: [],
			ErrorMsg: (err as CustomError).toString(),
		});
	}
});

router.get("/datos/graficables/:address/:start/:end/:partida/:id", async (req, res) => {
	try {
		const { address, start, end, partida, id } = req.params;

		console.log(address, start, end, partida, id);

		const resultados = await Graficables.PorPeriodo(address, start, end, partida, parseInt(id));

		res.json({ error: false, resultados, errorMsg: "" });
	} catch (err) {
		res.json({
			error: true,
			resultados: [],
			ErrorMsg: (err as CustomError).toString(),
		});
	}
});

router.get("/datos/realTime/:id", async (req, res) => {
	try {
		const { id } = req.params;
		const resultados = await Graficables.GetValoresActuales(parseInt(id));

		res.json({ error: false, resultados, errorMsg: "" });
	} catch (err) {
		res.json({
			error: true,
			resultados: [],
			ErrorMsg: (err as CustomError).toString(),
		});
	}
});

router.get("/datos/realTime/:address/:id", async (req, res) => {
	try {
		const { address, id } = req.params;

		const resultados = await Graficables.GetValorActual(address, parseInt(id));

		res.json({ error: false, resultados, errorMsg: "" });
	} catch (err) {
		res.json({
			error: true,
			resultados: [],
			ErrorMsg: (err as CustomError).toString(),
		});
	}
});

router.get("/status/:id", async (req, res) => {
	try {
		const { id } = req.params;
		const _equipo = EQUIPOS.find((eq) => eq.id == parseInt(id));

		console.log("ID", id, "Equipo", _equipo);

		if (!_equipo) throw new Error(`Equipo no definido para ID ${id}`);

		const SECADORA_IP_LOCAL = _equipo.ip;

		let { alive: resultados } = await ping.promise.probe(SECADORA_IP_LOCAL, {
			timeout: 1,
		});

		if (resultados) {
			const client = await PLCClient(parseInt(id));

			const addrPartidaI = 1712;
			const addrPartidaII = 1727;

			const {
				data: [_partidaI],
			} = await client.readHoldingRegisters(addrPartidaI, 1);

			const {
				data: [_partidaII],
			} = await client.readHoldingRegisters(addrPartidaII, 1);

			let Partida: number = parseInt(
				`${_partidaI.toString().padEnd(3, "0")}${_partidaII.toString().padStart(3, "0")}`
			);

			if (Partida < 300000 || Partida > 399999) resultados = false;
		}

		res.json({ error: false, resultados, errorMsg: "" });
	} catch (error) {
		res.json({
			error: true,
			resultados: [],
			ErrorMsg: error,
		});
	}
});

export default router;
