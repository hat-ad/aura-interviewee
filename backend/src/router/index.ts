import express from "express";
import interviewRouter from "./interview.router";
const router = express.Router();

router.use("/interview", interviewRouter);

export default router;
