import winston from "winston"
import DailyRotateFile from "winston-daily-rotate-file"

const info = new DailyRotateFile({
	filename: "ruokalistabot-%DATE%.log",
	datePattern: "YYYY-MM-DD",
	level: "info",
	dirname: Bun.env.LOG_LOCATION || "./logs/",
	zippedArchive: true,
	maxSize: "20m",
	maxFiles: "14d",
})

const debug = new DailyRotateFile({
	filename: "ruokalistabot-debug-%DATE%.log",
	datePattern: "YYYY-MM-DD",
	level: "silly",
	dirname: Bun.env.LOG_LOCATION || "./logs/",
	zippedArchive: true,
	maxSize: "20m",
	maxFiles: "7d",
})
const error = new DailyRotateFile({
	filename: "ruokalistabot-error-%DATE%.log",
	datePattern: "YYYY-MM-DD",
	level: "warn",
	dirname: Bun.env.LOG_LOCATION || "./logs/",
	zippedArchive: true,
	maxSize: "20m",
	maxFiles: "30d",
})

const logger = winston.createLogger({
	level: "info",
	format: winston.format.combine(
		winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
		winston.format.errors({ stack: true }),
		winston.format.metadata(),
		winston.format.json()
	),
	// defaultMeta: { service: "user-service" },
	transports: [
		new winston.transports.Console({
			format: winston.format.combine(
				winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
				winston.format.colorize(),
				winston.format.printf(({ timestamp, level, message }) => {
					return `${timestamp} [${level}]: ${message}`
				})
			),
			level: "silly",
		}),
		new winston.transports.Console({
			format: winston.format.combine(
				winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
				winston.format.printf(({ timestamp, level, message }) => {
					return `${timestamp} [${level}]: ${message}`
				})
			),
			level: "warn",
		}),
		info,
		debug,
		error,
	],
})

export default logger
