import { PROMPT_TYPE, PromptPayload } from "@/types/prompts";
import {
  continueSessionPrompt,
  evaluateSessionPrompt,
  getInterviewSetupPrompt,
} from "./interview.prompt";

export class PromptsManager {
  static getPrompt(payload: PromptPayload) {
    switch (payload.type) {
      case PROMPT_TYPE.SETUP_INTERVIEW_ENVIRONMENT:
        return getInterviewSetupPrompt(
          payload.meta.type,
          payload.meta.seniorityLevel,
          payload.meta.skill,
          payload.meta.jobDescription
        );
      case PROMPT_TYPE.CONTINUE_INTERVIEW:
        return continueSessionPrompt(
          payload.meta.userResponse,
          payload.meta.history
        );
      case PROMPT_TYPE.OVERALL_EVALUATION:
        return evaluateSessionPrompt(payload.meta.history);
      default:
        return [];
    }
  }
}
