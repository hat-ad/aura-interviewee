import InterviewService from "@/lib/interview.service";
import { ERROR, OK } from "@/utils/response.utils";
import { Request, Response } from "express";

export class InterviewController {
  static async initInterview(req: Request, res: Response) {
    try {
      const initInterviewResponse =
        await InterviewService.getInstance().initInterview({
          type: req.body.type,
          seniorityLevel: req.body.seniorityLevel,
          skill: req.body.skill,
          jobDescription: req.body.jobDescription,
        });
      return OK(
        res,
        initInterviewResponse,
        "Interview initialized successfully"
      );
    } catch (error) {
      return ERROR(res, error);
    }
  }

  static async continueInterview(req: Request, res: Response) {
    try {
      const continueInterviewResponse =
        await InterviewService.getInstance().continueInterview({
          sessionID: req.body.sessionID,
          userResponse: req.body.userResponse,
        });
      return OK(
        res,
        continueInterviewResponse,
        "Interview continued successfully"
      );
    } catch (error) {
      return ERROR(res, error);
    }
  }

  static async endInterview(req: Request, res: Response) {
    try {
      const endInterviewResponse =
        await InterviewService.getInstance().endInterview({
          sessionID: req.body.sessionID,
        });

      return OK(res, endInterviewResponse, "Interview evaluated successfully");
    } catch (error) {
      return ERROR(res, error);
    }
  }
}
