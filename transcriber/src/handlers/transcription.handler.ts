import WebSocket from "ws";

import { TranscriptionEngine } from "@/transcriberEngines/transcription-engine";
import { ClientContext } from "@/types/client";
import { MessagePackEvent } from "@/types/handler";
import { EngineType } from "@/types/transcription-engine";
import { WebSocketResponseManager } from "@/utils/response";
import { BinaryStreamHandler } from "./binary-stream.handler";
const transcriptionHandlers = new Map<
  String,
  {
    translator: TranscriptionHandler;
    ws: WebSocket;
  }
>();

class TranscriptionHandler {
  private engine: TranscriptionEngine;
  private streamHandler: BinaryStreamHandler;
  private clientContext: ClientContext;
  private ws: WebSocket;

  constructor(ws: WebSocket, clientContext: ClientContext, language: string) {
    this.ws = ws;
    this.clientContext = clientContext;

    this.engine = new TranscriptionEngine(
      EngineType.AZURE,
      {
        language,
      },
      {
        onRecognized: (text) => {
          clientContext.logger.info("Recognized: " + text);
          WebSocketResponseManager.sendSuccess(
            this.ws,
            "transcription:stream:recognized",
            {
              text,
            }
          );
        },
        onRecognizing: (text) => {
          clientContext.logger.info("Recognizing: " + text);
          WebSocketResponseManager.sendSuccess(
            this.ws,
            "transcription:stream:recognizing",
            {
              text,
            }
          );
        },
        onError: (err) => {
          clientContext.logger.error("Transcription error: " + err);
          WebSocketResponseManager.sendError(
            this.ws,
            "transcription:stream:error",
            err
          );
        },
        onCancel: () => {
          clientContext.logger.info("Transcription canceled");
          WebSocketResponseManager.sendSuccess(
            this.ws,
            "transcription:stream:cancelled",
            {}
          );
        },
      }
    );

    this.streamHandler = new BinaryStreamHandler({
      onBinaryData: (data, context) => {
        if (!context.paused) this.engine.pushAudio(data);
      },
      onPause: () => {
        clientContext.logger.info("Engine paused");
        WebSocketResponseManager.sendSuccess(
          this.ws,
          "transcription:stream:pause",
          {}
        );
      },
      onResume: () => {
        clientContext.logger.info("Engine resumed");
        WebSocketResponseManager.sendSuccess(
          this.ws,
          "transcription:stream:resume",
          {}
        );
      },
      onFailure: () => {
        this.engine.stopRecognition();
        WebSocketResponseManager.sendSuccess(
          this.ws,
          "transcription:stream:failed",
          {}
        );
        transcriptionHandlers.get(clientContext.sessionID)?.translator.close();
        transcriptionHandlers.delete(clientContext.sessionID);
        clientContext.logger.error("Stream failed, cleaning up");
      },
    });
  }

  public startRecognition() {
    this.streamHandler.initStreamHandler(this.ws, this.clientContext);
    this.engine.startRecognition(
      () => this.clientContext.logger.info("Recognition started"),
      (err) => this.clientContext.logger.error("Start failed: " + err)
    );
  }

  public handleBinary(data: Buffer) {
    this.streamHandler.handleBinary(this.ws, data);
  }

  public close() {
    this.engine.stopRecognition();
    this.streamHandler.cleanup();
  }
}

export function transcriptionHandler(
  body: MessagePackEvent,
  ws: WebSocket,
  clientContext: ClientContext
) {
  switch (body.subevent) {
    case "transcription:stream:init":
      if (!transcriptionHandlers.has(clientContext.sessionID)) {
        const language = (body.payload as { language: string }).language;
        transcriptionHandlers.set(clientContext.sessionID, {
          translator: new TranscriptionHandler(ws, clientContext, language),
          ws,
        });
        transcriptionHandlers
          .get(clientContext.sessionID)
          ?.translator.startRecognition();
        WebSocketResponseManager.sendSuccess(
          ws,
          "transcription:stream:initiated",
          {}
        );
      }
      break;

    case "transcription:stream:binary":
      if (body.payload instanceof Uint8Array) {
        body.payload = Buffer.from(body.payload);
      } else {
        WebSocketResponseManager.sendError(
          ws,
          body.event,
          "Payload is not a uint8array"
        );
        break;
      }
      if (!Buffer.isBuffer(body.payload)) {
        WebSocketResponseManager.sendError(
          ws,
          body.event,
          "Payload is not a buffer"
        );
        break;
      }
      transcriptionHandlers
        .get(clientContext.sessionID)
        ?.translator.handleBinary(body.payload);

      break;
    case "transcription:stream:close":
      transcriptionHandlers.get(clientContext.sessionID)?.translator.close();
      transcriptionHandlers.delete(clientContext.sessionID);
      clientContext.logger.info("Stream closed");
      WebSocketResponseManager.sendSuccess(
        ws,
        "transcription:stream:closed",
        {}
      );
      break;

    default:
      break;
  }
}
