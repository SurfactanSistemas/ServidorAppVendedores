const config = {
	user: "usuarioadmin",
	password: "usuarioadmin",
	server: "193.168.0.7",
	database: "surfactanSa",
	options: {
		encrypt: false,
	},
	pool: {
		max: 10,
		min: 1,
		idleTimeoutMillis: 30000,
	},
};

// const config = {
// 	user: "Desarrollo",
// 	password: "Desarrollo",
// 	server: "localhost",
// 	database: "surfactanSa",
// 	options: {
// 		encrypt: false,
// 	},
// 	pool: {
// 		max: 10,
// 		min: 1,
// 		idleTimeoutMillis: 30000,
// 	},
// };

export { config as ConfigDb };
