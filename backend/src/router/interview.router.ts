import { InterviewController } from "@/controller/interview.controller";
import express from "express";

const router = express.Router();

router.post("/init", InterviewController.initInterview);

router.post("/continue", InterviewController.continueInterview);

router.post("/end", InterviewController.endInterview);

export default router;
