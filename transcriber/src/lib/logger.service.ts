import winston from "winston";

const logger = winston.createLogger({
  level: "debug",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    })
  ),
  transports: [new winston.transports.Console()],
});

export const createLoggerWithCorrelation = (sessionID: string, ip?: string) => {
  return winston.createLogger({
    level: "debug",
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.printf(({ timestamp, level, message }) => {
        return `[
                  Timestamp : ${timestamp}
                  Level     : ${level.toUpperCase()}
                  IP        : ${ip}
                  Session ID   : ${sessionID}
                  Message   : ${message}
                ]`;
      })
    ),
    transports: [new winston.transports.Console()],
  });
};

export default logger;
