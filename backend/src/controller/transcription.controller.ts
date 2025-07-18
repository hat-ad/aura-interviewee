import { SpeechService } from "@/lib/speech.service";
import { ERROR, OK } from "@/utils/response.utils";
import { Request, Response } from "express";

export class TranscriptionController {
  static async speechToText(req: Request, res: Response) {
    try {
      const file = req.file;
      if (!file) return ERROR(res, "File not found");

      const speechService = new SpeechService();
      const transcription = await speechService.transcribe(file.destination);

      return OK(res, transcription, "Transcription done successfully");
    } catch (error) {
      return ERROR(res, error);
    }
  }
}
