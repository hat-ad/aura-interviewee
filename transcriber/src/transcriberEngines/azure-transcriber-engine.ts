import config from "@/lib/config.service";
import { ITranscriptionEngine } from "@/types/transcription-engine";
import * as sdk from "microsoft-cognitiveservices-speech-sdk";

export class AzureSpeechTranscriber implements ITranscriptionEngine {
  private recognizer: sdk.TranslationRecognizer;
  private pushStream: sdk.PushAudioInputStream;
  constructor(
    transcriptionLanguage: string,
    onRecognized?: (text: string) => void,
    onRecognizing?: (text: string) => void,
    onCancel?: () => void,
    onSessionStopped?: () => void
  ) {
    const speechConfig = sdk.SpeechTranslationConfig.fromSubscription(
      config.AZURE_SPEECH_SUBSCRIPTION_KEY,
      config.AZURE_SPEECH_SUBSCRIPTION_REGION
    );
    speechConfig.speechRecognitionLanguage = transcriptionLanguage;
    speechConfig.addTargetLanguage(transcriptionLanguage);
    speechConfig.enableAudioLogging();
    this.pushStream = sdk.AudioInputStream.createPushStream();
    const audioConfig = sdk.AudioConfig.fromStreamInput(this.pushStream);
    this.recognizer = new sdk.TranslationRecognizer(speechConfig, audioConfig);

    this.handleSpeechRecognizing(onRecognizing);
    this.handleSpeechRecognized(onRecognized);
    this.handleCancelListener(onCancel);
    this.handleSessionStoppedListener(onSessionStopped);
  }

  startRecognition(onSuccess: () => void, onError: (error: string) => void) {
    this.recognizer.startContinuousRecognitionAsync(
      () => onSuccess(),
      (error) => onError(`Failed to start recognition: ${error}`)
    );
  }

  handleSpeechRecognizing(onRecognizing?: (text: string) => void) {
    this.recognizer.recognizing = (_s, e) => {
      onRecognizing && onRecognizing(e.result.text);
    };
  }

  handleSpeechRecognized(onRecognized?: (text: string) => void) {
    this.recognizer.recognized = async (s, e) => {
      onRecognized && onRecognized(e.result.text);
    };
  }

  handleCancelListener(onCancel?: () => void) {
    this.recognizer.canceled = (s, e) => {
      onCancel && onCancel();
    };
  }

  handleSessionStoppedListener(onSessionStopped?: () => void) {
    this.recognizer.sessionStopped = () => {
      onSessionStopped && onSessionStopped();
    };
  }

  stopRecognition() {
    this.recognizer.stopContinuousRecognitionAsync();
  }

  toArrayBuffer(buffer: Buffer) {
    return buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength
    );
  }
  pushAudio(data: ArrayBuffer) {
    this.pushStream.write(this.toArrayBuffer(data as Buffer));
  }
}
