// SpeechClient.ts
import axios, { AxiosInstance } from "axios";
import FormData from "form-data";
import fs from "fs";
import path from "path";

interface SpeechClientOptions {
  baseUrl?: string;
  transcriptionModelId?: string;
  synthesisModelId?: string;
}

interface SynthesisOptions {
  input: string;
  voiceId: string;
  speed?: number;
  outputFile?: string;
}

export class SpeechService {
  private client: AxiosInstance;
  private transcriptionModelId: string;
  private synthesisModelId: string;

  constructor(options: SpeechClientOptions = {}) {
    const baseUrl =
      options.baseUrl ||
      process.env.SPEACHES_BASE_URL ||
      "http://localhost:8000";
    this.client = axios.create({ baseURL: baseUrl });
    this.transcriptionModelId =
      options.transcriptionModelId ||
      process.env.TRANSCRIPTION_MODEL_ID ||
      "Systran/faster-distil-whisper-small.en";
    this.synthesisModelId =
      options.synthesisModelId ||
      process.env.SYNTHESIS_MODEL_ID ||
      "speaches-ai/Kokoro-82M-v1.0-ONNX";
  }

  /**
   * Transcribes a local audio file using the configured model.
   * @param filePath Path to the audio file
   * @returns Transcription result as an object
   */
  async transcribe(filePath: string): Promise<any> {
    const form = new FormData();
    form.append("file", fs.createReadStream(filePath));
    form.append("model", this.transcriptionModelId);

    try {
      const response = await this.client.post(
        "/v1/audio/transcriptions",
        form,
        {
          headers: form.getHeaders(),
        }
      );
      return response.data;
    } catch (error: any) {
      const detail =
        error.response?.data?.detail || error.message || "Transcription failed";
      throw new Error(detail);
    }
  }

  /**
   * Synthesizes speech from text and saves it to an output file.
   * @param options Synthesis options
   */
  async synthesizeText(options: SynthesisOptions): Promise<void> {
    const { input, voiceId, speed = 1, outputFile = "output.mp3" } = options;

    try {
      const response = await this.client.post(
        "/v1/audio/speech",
        {
          model: this.synthesisModelId,
          voice: voiceId,
          input,
          response_format: "mp3",
          speed,
        },
        {
          responseType: "stream",
        }
      );

      const writer = fs.createWriteStream(path.resolve(outputFile));
      response.data.pipe(writer);

      await new Promise<void>((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });
    } catch (error: any) {
      const detail =
        error.response?.data?.detail || error.message || "Synthesis failed";
      throw new Error(detail);
    }
  }
}
