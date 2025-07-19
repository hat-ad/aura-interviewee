import { MessagePackHelper } from "@/serializer";
import { WebSocketResponse } from "@/types/handler";
import WebSocket, { Server } from "ws";
export class WebSocketResponseManager {
  public static sendSuccess(
    ws: WebSocket,
    type: string,
    payload: unknown
  ): void {
    const response: WebSocketResponse = {
      type: type,
      status: "success",
      data: payload,
    };
    ws.send(MessagePackHelper.encode(type, response));
  }

  public static sendError(ws: WebSocket, type: string, error: string): void {
    const response: WebSocketResponse = {
      type: type,
      status: "error",
      message: error,
    };
    ws.send(MessagePackHelper.encode(type, response));
  }

  public static broadcast(wss: Server, type: string, payload: unknown): void {
    const response: WebSocketResponse = {
      type: type,
      status: "error",
      data: payload,
    };
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(response));
      }
    });
  }
}
