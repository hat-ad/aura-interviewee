import { NextFunction, Request, Response } from "express";
import winston from "winston";

export const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.errors({ stack: true }),
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      const extra = Object.keys(meta).length
        ? JSON.stringify(meta, null, 2)
        : "";
      return `[${timestamp}] ${level}: ${message} ${extra}`;
    })
  ),
  transports: [new winston.transports.Console()],
});

// HTTP logger middleware
export const httpLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime();

  res.on("finish", () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const duration = (seconds * 1000 + nanoseconds / 1e6).toFixed(2);

    let level: "info" | "error" | "debug" | "warn" = "info";
    if (res.statusCode >= 400) level = "error";
    else if (res.statusCode >= 300) level = "warn";

    const msg = `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration} ms`;
    logger.log(level, msg);
  });

  next();
};

export default logger;
