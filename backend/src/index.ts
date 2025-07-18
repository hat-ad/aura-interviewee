import http, { Server } from "http";

import app from "./app";
import config from "./config/env.config";
import logger from "./lib/logger.service";

const port: number = config.PORT || 8000;

const server: Server = http.createServer(app);

const onError = (error: NodeJS.ErrnoException) => {
  if (error.syscall !== "listen") {
    throw error;
  }
  const addr = server.address();
  const bind = typeof addr === "string" ? `pipe ${addr}` : `port ${port}`;
  switch (error.code) {
    case "EACCES":
      logger.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case "EADDRINUSE":
      logger.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
};

const onListening = () => {
  const addr = server.address();
  const bind = typeof addr === "string" ? `pipe ${addr}` : `port ${port}`;
  logger.info(`Listening on ${bind}`);
};

server.on("error", onError);
server.on("listening", onListening);

server.listen(port, () => {
  logger.info(
    `\n\nServer Started:\n>> http://localhost:${port}\n>> ${process.env.NODE_ENV} mode\n\n`
  );
});
