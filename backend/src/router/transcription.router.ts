import { TranscriptionController } from "@/controller/transcription.controller";
import express from "express";
import multer from "multer";

const router = express.Router();
const upload = multer({ dest: "../../public/audio/uploads/" });

router.post(
  "/speech-to-text",
  upload.single("audio"),
  TranscriptionController.speechToText
);

export default router;
