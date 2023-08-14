import mongoose from "mongoose";

export interface IData {
	id: number;
	descripcion: string;
	value: string;
	startTime: number;
	endTime: number;
	sincronized: boolean;
	id_device: number;
}

const PLCDataSchema = () =>
	new mongoose.Schema({
		id: Number,
		descripcion: String,
		value: String,
		startTime: Number,
		endTime: Number,
		sincronized: Boolean,
		id_device: Number,
	});

const connectMongoDb = async () => await mongoose.connect("mongodb://usuarioadmin:usuarioadmin@193.168.0.12:27017/plc");

export const getDatos = async (model: string, query: object, options: object = {}): Promise<IData[]> => {
	await connectMongoDb();

	const DataModel = mongoose.models[model] || mongoose.model(model, PLCDataSchema());

	let data = DataModel.find({ ...query }, null, { ...options });

	return await data.exec();
};
