import * as express from "express";
import { CustomError } from "../../../Utils/CustomError";
import { Graficables, Resumen } from "../../../Modelos/PLC/Lecturas";
import { addresses } from "../../../Modelos/PLC/addresses";

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

export default router;
