import winston from "winston";

export function getLogger(name: string) {
  return winston.createLogger({
    level: process.env.DEVELOPMENT ? 'debug' : 'info',
    format: winston.format.combine(
      winston.format.splat(),
      winston.format.colorize({ all: true }),
      winston.format.timestamp({ format: 'MM/DD/YYYY HH:mm:ss' }),
      winston.format.printf(({ level, message, timestamp, ...meta }) =>
        `${timestamp} [${level}-${name}]: ${message}`)
    ),
    transports: [
      new winston.transports.File({ filename: 'error.log', level: 'error', handleExceptions: true }),
      new winston.transports.File({ filename: 'combined.log' }),
      new winston.transports.Console({
        handleExceptions: process.env.DEVELOPMENT ? true : false
      }),
    ],
  });
}