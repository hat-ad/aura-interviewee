export enum PROMPT_TYPE {
  SETUP_INTERVIEW_ENVIRONMENT,
  CONTINUE_INTERVIEW,
  OVERALL_EVALUATION,
}

interface SetupInterviewEnvironmentPromptPayload {
  type: PROMPT_TYPE.SETUP_INTERVIEW_ENVIRONMENT;
  meta: {
    type: "skill" | "jd";
    seniorityLevel: string;
    skill?: string;
    jobDescription?: string;
  };
}

interface ConcludeInterviewPromptPayload {
  type: PROMPT_TYPE.OVERALL_EVALUATION;
  meta: {
    history: {
      role: string;
      content: {
        type: string;
        text: string;
      }[];
    }[];
  };
}
interface ContinueInterviewPromptPayload {
  type: PROMPT_TYPE.CONTINUE_INTERVIEW;
  meta: {
    userResponse: string;
    history: {
      role: string;
      content: {
        type: string;
        text: string;
      }[];
    }[];
  };
}

export type PromptPayload =
  | SetupInterviewEnvironmentPromptPayload
  | ConcludeInterviewPromptPayload
  | ContinueInterviewPromptPayload;
