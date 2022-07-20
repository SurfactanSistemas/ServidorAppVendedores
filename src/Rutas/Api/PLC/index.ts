import * as express from "express";
import { CustomError } from "../../../Utils/CustomError";
import { Graficables, Resumen } from "../../../Modelos/PLC/Lecturas";
import ping from "ping";

const router = express.Router();

router.get("/datos/realTime", async (req, res) => {
	try {
		const resultados = await Graficables.GetValoresActuales();

		res.json({ error: false, resultados, errorMsg: "" });
	} catch (err) {
		res.json({
			error: true,
			resultados: [],
			ErrorMsg: (err as CustomError).toString(),
		});
	}
});

router.get("/datos/realTime/resumen/actual", async (req, res) => {
	try {
		const resultados = await Resumen.Actual();

		res.json({ error: false, resultados, errorMsg: "" });
	} catch (err) {
		res.json({
			error: true,
			resultados: [],
			ErrorMsg: (err as CustomError).toString(),
		});
	}
});

router.get("/datos/realTime/resumen/historial/partidas", async (req, res) => {
	try {
		const resultados = await Graficables.PartidasSeleccionables();

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

router.get("/datos/realTime/producto", async (req, res) => {
	try {
		const resultados = await Graficables.ProductoActual();

		res.json({ error: false, resultados, errorMsg: "" });
	} catch (err) {
		res.json({
			error: true,
			resultados: [],
			ErrorMsg: (err as CustomError).toString(),
		});
	}
});

router.get("/datos/realTime/eventos_fijos", async (req, res) => {
	try {
		const resultados = await Graficables.EstadosEventosFijos();

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

router.get("/datos/graficables/:address/:start/:end/:partida", async (req, res) => {
	try {
		const { address, start, end, partida } = req.params;

		const resultados = await Graficables.PorPeriodo(address, start, end, partida);

		res.json({ error: false, resultados, errorMsg: "" });
	} catch (err) {
		res.json({
			error: true,
			resultados: [],
			ErrorMsg: (err as CustomError).toString(),
		});
	}
});

router.get("/datos/realTime/:address", async (req, res) => {
	try {
		const { address } = req.params;

		const resultados = await Graficables.GetValorActual(address);

		res.json({ error: false, resultados, errorMsg: "" });
	} catch (err) {
		res.json({
			error: true,
			resultados: [],
			ErrorMsg: (err as CustomError).toString(),
		});
	}
});

router.get("/status", async (req, res) => {
	try {
		const SECADORA_IP_LOCAL = "193.168.0.21";

		const { alive: resultados } = await ping.promise.probe(SECADORA_IP_LOCAL, {
			timeout: 1,
		});

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
