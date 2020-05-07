import winston, { format } from "winston";
import winstonDaily from "winston-daily-rotate-file";
import moment from "moment";

const timeStampFormat = () => {
	return moment().format("YYYY-MM-DD HH:mm:ss ZZ");
};

const { combine, label, printf } = format;
const myFormat = printf(({ level, message, label }) => {
	const now = new Date();
	const timestamp = moment(now).format("YYYY-MM-DD HH:mm:ss");
	return `${timestamp} [${label}] ${level}: ${message}`;
});

var logger = new winston.createLogger({
	transports: [
		new winstonDaily({
			name: "info-file",
			filename: "./log/server__%DATE%.log",
			datePattern: "yyyy-MM-DD",
			colorize: false,
			format: combine(label({ label: "server" }), myFormat),
			maxsize: 50000000,
			maxFiles: 1000,
			level: "info",
			showLevel: true,
			json: false,
			timestamp: timeStampFormat,
		}),
		new winston.transports.Console({
			name: "debug-console",
			colorize: true,
			level: "debug",
			showLevel: true,
			json: false,
			timestamp: timeStampFormat,
		}),
	],
	exceptionHandlers: [
		new winstonDaily({
			name: "exception-file",
			filename: "./log/server__%DATE%.log",
			datePattern: "yyyy-MM-DD",
			colorize: false,
			format: combine(label({ label: "server" }), myFormat),
			maxsize: 50000000,
			maxFiles: 1000,
			level: "error",
			showLevel: true,
			json: false,
			timestamp: timeStampFormat,
		}),
		new winston.transports.Console({
			name: "exception-console",
			colorize: true,
			level: "debug",
			showLevel: true,
			json: false,
			timestamp: timeStampFormat,
		}),
	],
});

export default logger;
