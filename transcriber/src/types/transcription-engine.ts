export interface ITranscriptionEngine {
  startRecognition(
    onSuccess: () => void,
    onError: (error: string) => void
  ): void;
  stopRecognition(): void;
  pushAudio(data: ArrayBuffer): void;
}

export enum EngineType {
  AZURE,
}
