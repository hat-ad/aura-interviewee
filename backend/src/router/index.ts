import express from "express";
import transcriptionRouter from "./transcription.router";
const router = express.Router();

router.use("/transcription", transcriptionRouter);

export default router;
