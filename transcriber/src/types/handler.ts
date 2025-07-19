import WebSocket from "ws";
import { ClientContext } from "./client";
export interface MessagePackEvent {
  event: string;
  subevent?: string;
  payload: Record<string, any> | Buffer;
}
export interface WebSocketResponse<T = unknown> {
  type: string;
  status: "success" | "error";
  message?: string;
  data?: T;
}

export type IHandler = (
  payload: MessagePackEvent,
  context: ClientContext,
  ws: WebSocket
) => Promise<void> | void;

export interface MessageTypeSchema {
  handler: IHandler;
}

export interface HandlerOptions {
  messageTypes: Record<string, MessageTypeSchema>;
}
