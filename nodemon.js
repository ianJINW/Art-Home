require("dotenv").config();

module.exports = {
	watch: ["server", "client"],
	ext: "js,ts,json",
	ignore: ["node_modules"],
	exec: "ts-node index.ts",
	env: {
		NODE_ENV: process.env.NODE_ENV || "development",
		PORT: process.env.PORT || 3000,
		JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
		FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
	},
};
