export interface IEquipo {
	id: number;
	ip: string;
	port: number;
	name: string;
	enabled: boolean;
}

export const EQUIPOS: IEquipo[] = [
	{
		id: 1,
		ip: "193.168.0.21",
		port: 502,
		name: "SPRAY 3",
		enabled: true,
	},
	{
		id: 2,
		ip: "193.168.0.38",
		port: 502,
		name: "SPRAY 1",
		enabled: true,
	},
	{
		id: 3,
		ip: "193.168.0.117",
		port: 502,
		name: "SPRAY 2",
		enabled: true,
	},
];
