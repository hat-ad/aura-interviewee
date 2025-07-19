import { randomUUID } from "crypto";
import http, { IncomingMessage } from "http";
import WebSocket, { WebSocketServer as WSS } from "ws";
import registerHandler from "./handlers/handler";
import config from "./lib/config.service";
import logger, { createLoggerWithCorrelation } from "./lib/logger.service";
import { ClientContext } from "./types/client";
import { WebSocketResponseManager } from "./utils/response";

export class SocketServer {
  private clientContextMap = new WeakMap<WebSocket, ClientContext>();
  private wss: WSS;
  private server: http.Server;

  constructor() {
    this.server = http.createServer();
    this.wss = new WebSocket.Server({ noServer: true });
    this.setup();
  }

  private setup() {
    this.server.on("upgrade", async (request, socket, head) => {
      try {
        const sessionID = "sessionID:" + randomUUID();
        this.wss.handleUpgrade(request, socket, head, (ws) => {
          const ip = request.socket.remoteAddress;
          if (!ip) {
            logger.error("No IP address found in request");
            socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
            socket.destroy();
            return;
          }

          const context: ClientContext = {
            ip,
            sessionID: sessionID,
            logger: createLoggerWithCorrelation(sessionID, ip),
            retryAttempts: 0,
          };
          this.clientContextMap.set(ws, context);
          this.wss.emit("connection", ws, request);
        });
      } catch (error) {
        socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
        socket.destroy();
        logger.error(error);
      }
    });

    this.wss.on("connection", (ws: WebSocket, _req: IncomingMessage) => {
      logger.info(
        "New WebSocket connection from " + this.clientContextMap.get(ws)!.ip
      );

      WebSocketResponseManager.sendSuccess(ws, "connected", {});

      registerHandler(ws, this.clientContextMap.get(ws)!);

      ws.on("close", () => {
        const context = this.clientContextMap.get(ws);
        if (context?.retryTimeout) {
          clearTimeout(context.retryTimeout);
        }
        this.clientContextMap.delete(ws);
        this.clientContextMap
          .get(ws)
          ?.logger.info("WebSocket connection closed");
      });

      ws.on("error", (err) => {
        logger.error(`[WebSocket Error]`, err.message);
      });
    });

    this.server.listen(config.PORT, () =>
      logger.info(`Websocket Server running on port ${config.PORT}`)
    );
  }
}

new SocketServer();
