import { EngineType, ITranscriptionEngine } from "@/types/transcription-engine";
import { AzureSpeechTranscriber } from "./azure-transcriber-engine";

export class TranscriptionEngine implements ITranscriptionEngine {
  private engine: ITranscriptionEngine;

  constructor(
    engineType: EngineType,
    config: { language: string },
    callbacks: {
      onRecognized?: (text: string) => void;
      onRecognizing?: (text: string) => void;
      onCancel?: () => void;
      onSessionStopped?: () => void;
      onError?: (error: string) => void;
    }
  ) {
    switch (engineType) {
      case EngineType.AZURE:
        this.engine = new AzureSpeechTranscriber(
          config.language,
          callbacks.onRecognized,
          callbacks.onRecognizing,
          callbacks.onCancel,
          callbacks.onSessionStopped
        );
        break;

      default:
        throw new Error("Unsupported transcription engine");
    }
  }

  startRecognition(onSuccess: () => void, onError: (error: string) => void) {
    this.engine.startRecognition(onSuccess, onError);
  }

  stopRecognition() {
    this.engine.stopRecognition();
  }

  pushAudio(data: ArrayBuffer) {
    this.engine.pushAudio(data);
  }
}
