import config from "@/lib/config.service";
import { MessagePackHelper } from "@/serializer";
import { ClientContext } from "@/types/client";
import { HandlerOptions, IHandler, MessageTypeSchema } from "@/types/handler";
import { getError } from "@/utils/common";
import { HandlerType } from "@/utils/constants";
import { WebSocketResponseManager } from "@/utils/response";
import WebSocket from "ws";
import { transcriptionHandler } from "./transcription.handler";

class HandlerManager {
  private context: ClientContext;
  private messageTypes: Record<string, MessageTypeSchema>;
  private rateLimit?: { maxPerSec: number };

  private timeoutMs?: number;
  private messageTimestampsMap: Record<string, number[]> = {};
  constructor(context: ClientContext, options: HandlerOptions) {
    this.context = context;
    this.messageTypes = options.messageTypes;
    this.rateLimit = {
      maxPerSec: config.RATE_LIMIT_PER_SEC,
    };
    this.timeoutMs = config.TIMEOUT_IN_MS;
  }

  bind(ws: WebSocket) {
    ws.on("message", async (data, isBinary) => {
      try {
        if (!isBinary || !Buffer.isBuffer(data)) {
          throw new Error("Expected binary data");
        }

        const parsed = MessagePackHelper.decode(data);

        // if (!this.checkRateLimit()) {
        //   throw new Error("Rate limit exceeded");
        // }

        const { event } = parsed;
        if (!event || typeof event !== "string") {
          throw new Error("Missing or invalid 'event' field");
        }

        const messageDef = this.messageTypes[event];
        if (!messageDef) {
          throw new Error(`Unknown message type: ${event}`);
        }
        const timeout = new Promise((_, reject) =>
          setTimeout(() => reject("Handler timeout"), this.timeoutMs)
        );

        await Promise.race([
          Promise.resolve(messageDef.handler(parsed, this.context, ws)),
          timeout,
        ]);
      } catch (err) {
        const error = getError(err);
        this.context.logger.error("Handler error: " + err);
        this.sendError(ws, error);
      }
    });
  }

  private sendError(ws: WebSocket, details: string) {
    WebSocketResponseManager.sendError(ws, "CONFIGURATION_ERROR", details);
  }

  private getRateLimitKey(): string {
    if (this.context.sessionID) {
      return `session:${this.context.sessionID}`;
    }
    // Fallback to IP address from context
    if (this.context.ip) {
      return `ip:${this.context.ip}`;
    }
    // If neither is available, use a generic key (no effective rate limiting)
    return "unknown";
  }

  private checkRateLimit(): boolean {
    if (!this.rateLimit) return true;

    const key = this.getRateLimitKey();
    const now = Date.now();
    if (!this.messageTimestampsMap[key]) {
      this.messageTimestampsMap[key] = [];
    }
    // Remove timestamps older than 1 second
    this.messageTimestampsMap[key] = this.messageTimestampsMap[key].filter(
      (ts) => now - ts < 1000
    );
    if (this.messageTimestampsMap[key].length >= this.rateLimit.maxPerSec) {
      return false;
    }
    this.messageTimestampsMap[key].push(now);
    return true;
  }

  static createHandlerMap(defs: Array<{ type: string; handler: IHandler }>) {
    return defs.reduce((acc, { type, handler }) => {
      acc[type] = { handler };
      return acc;
    }, {} as Record<string, MessageTypeSchema>);
  }
}

const registerHandler = (ws: WebSocket, context: ClientContext) => {
  const handlers = HandlerManager.createHandlerMap([
    {
      type: HandlerType.TRANSCRIPTION,
      handler: async (payload, ctx, ws) =>
        transcriptionHandler(payload, ws, ctx),
    },
  ]);

  const handler = new HandlerManager(context, {
    messageTypes: handlers,
  });
  handler.bind(ws);
};

export default registerHandler;
