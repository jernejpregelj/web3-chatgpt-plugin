import winston from 'winston'
import expressWinston from 'express-winston'

const transport = new winston.transports.Console()

const format = winston.format.combine(
  winston.format.timestamp(),
  winston.format.printf(({ level, message, timestamp }) => {
    return `${timestamp} - ${level}: ${message}`
  })
)

export const logger = winston.createLogger({
  format,
  transports: [transport]
})

export const expressLogger = expressWinston.logger({
  transports: [transport],
  format
})

export const expressErrorLogger = expressWinston.errorLogger({
  transports: [transport],
  format
})
