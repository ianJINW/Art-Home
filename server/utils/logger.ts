import morgan from "morgan";
import { createLogger, format, transports } from "winston";

const { combine, timestamp, printf } = format;

const myFormat = printf(({ level, message, timestamp }) => {
	return `${timestamp} ${level}: ${message}`;
});

export const logger = createLogger({
	level: "info",
	format: combine(timestamp(), myFormat),
	transports: [new transports.Console()],
});

export const httpLogger = morgan("combined", {
	stream: { write: (message) => logger.info(message) },
});
