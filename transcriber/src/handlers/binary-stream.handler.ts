import { BinaryStreamContext, ClientContext } from "@/types/client";
import { getError } from "@/utils/common";
import WebSocket from "ws";

export type StreamEvents = {
  onBinaryData?: (data: Buffer, context: BinaryStreamContext) => void;
  onPause?: (context: BinaryStreamContext) => void;
  onResume?: (context: BinaryStreamContext) => void;
  onRetry?: (context: BinaryStreamContext) => void;
  onFailure?: (context: BinaryStreamContext, error?: string) => void;
};

const HIGH_WATER_MARK = 5 * 1024 * 1024;
const LOW_WATER_MARK = 1 * 1024 * 1024;
const MAX_RETRY_ATTEMPTS = 3;
const STREAM_TIMEOUT_MS = 30000;

export class BinaryStreamHandler {
  private context: BinaryStreamContext | null = null;
  private events: StreamEvents;

  constructor(events: StreamEvents = {}) {
    this.events = events;
  }

  initStreamHandler(ws: WebSocket, clientContext: ClientContext) {
    try {
      this.context = {
        ...clientContext,
        paused: false,
        retryAttempts: 0,
      };

      this.context.logger.info("Stream initialized");

      this.startStreamTimeout(ws, this.context);
    } catch (err) {
      clientContext.logger.error(
        "Failed to parse stream-init payload: " + getError(err)
      );
      this.events.onFailure?.(
        this.context as BinaryStreamContext,
        getError(err)
      );
    }
  }

  handleBinary(ws: WebSocket, data: Buffer) {
    const context = this.context;
    if (!context) return;

    clearTimeout(context.retryTimeout);
    this.startStreamTimeout(ws, context);

    this.events.onBinaryData?.(data, context);

    const buffered = ws.bufferedAmount;

    if (buffered > HIGH_WATER_MARK && !context.paused) {
      context.paused = true;
      context.logger.info(`Backpressure detected: ${buffered} bytes`);

      this.events.onPause?.(context);
    } else if (context.paused && buffered < LOW_WATER_MARK) {
      context.paused = false;
      context.logger.info(`Backpressure relieved: ${buffered} bytes`);

      this.events.onResume?.(context);
    }
  }

  private startStreamTimeout(ws: WebSocket, context: BinaryStreamContext) {
    context.retryTimeout = setTimeout(() => {
      if (context.retryAttempts < MAX_RETRY_ATTEMPTS) {
        context.retryAttempts++;
        context.logger.warn(
          `Stream timeout. Retrying attempt ${context.retryAttempts}`
        );

        this.events.onRetry?.(context);

        this.startStreamTimeout(ws, context);
      } else {
        context.logger.error(
          `Stream failed after ${MAX_RETRY_ATTEMPTS} attempts.`
        );

        this.events.onFailure?.(context);
        ws.close();
      }
    }, STREAM_TIMEOUT_MS);
  }

  cleanup() {
    clearTimeout(this.context?.retryTimeout);
  }
}
