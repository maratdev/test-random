import { createLogger, format, transports } from 'winston';

const logger = createLogger({
	level: 'info',
	format: format.combine(
		format.colorize(),
		format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
		format.printf((info: Record<string, any>) => `[${info.timestamp}] ${info.level}: ${String(info.message)}`)
	),
	transports: [
		new transports.Console(),
	],
});

export default logger;