import { PromptsManager } from "@/prompts/prompts-manager";
import { PROMPT_TYPE } from "@/types/prompts";
import { getUniqueID } from "@/utils/common.utils";
import { Cache } from "./cache.service";
import logger from "./logger.service";
import { OpenAIService } from "./openai.service";

class InterviewService {
  private static instance: InterviewService;

  cache: Cache<any>;
  private constructor() {
    this.cache = new Cache();
  }

  static getInstance(): InterviewService {
    if (!InterviewService.instance) {
      InterviewService.instance = new InterviewService();
    }
    return InterviewService.instance;
  }

  async initInterview(data: {
    type: "skill" | "jd";
    seniorityLevel: string;
    skill?: string;
    jobDescription?: string;
  }) {
    const id = getUniqueID();
    const cacheKey = `interview-${id}`;

    const interviewSetupPrompt = PromptsManager.getPrompt({
      type: PROMPT_TYPE.SETUP_INTERVIEW_ENVIRONMENT,
      meta: {
        type: data.type,
        seniorityLevel: data.seniorityLevel,
        skill: data.skill,
        jobDescription: data.jobDescription,
      },
    });

    const openAIResponse = await OpenAIService.getInstance().requestOpenAI(
      interviewSetupPrompt
    );

    if (!openAIResponse) {
      logger.error("No response received from OpenAI for interview setup");
      return undefined;
    }
    interviewSetupPrompt.push({
      role: "assistant",
      content: [
        {
          type: "text",
          text: openAIResponse,
        },
      ],
    });
    this.cache.put(cacheKey, interviewSetupPrompt);

    return {
      sessionID: cacheKey,
      response: openAIResponse,
    };
  }

  async continueInterview(data: { sessionID: string; userResponse: string }) {
    const cacheKey = data.sessionID;

    const cachedResponse = this.cache.get(cacheKey);
    logger.error(
      "🚀 ~ InterviewService ~ continueInterview ~ cachedResponse:",
      cachedResponse
    );

    if (!cachedResponse) {
      logger.error("No cached response found for interview");
      return undefined;
    }

    const continuePrompt = PromptsManager.getPrompt({
      type: PROMPT_TYPE.CONTINUE_INTERVIEW,
      meta: {
        userResponse: data.userResponse,
        history: cachedResponse,
      },
    });

    const openAIResponse = await OpenAIService.getInstance().requestOpenAI(
      continuePrompt
    );

    if (!openAIResponse) {
      logger.error("No response received from OpenAI for continue interview");
      return undefined;
    }

    cachedResponse.push({
      role: "assistant",
      content: [
        {
          type: "text",
          text: openAIResponse,
        },
      ],
    });
    this.cache.put(cacheKey, cachedResponse);

    return Promise.resolve({
      sessionID: cacheKey,
      response: openAIResponse,
    });
  }

  async endInterview(data: { sessionID: string }) {
    const cacheKey = data.sessionID;

    const cachedResponse = this.cache.get(cacheKey);

    if (!cachedResponse) {
      logger.error("No cached response found for interview");
      return undefined;
    }

    const endPrompt = PromptsManager.getPrompt({
      type: PROMPT_TYPE.OVERALL_EVALUATION,
      meta: {
        history: cachedResponse,
      },
    });

    const openAIResponse = await OpenAIService.getInstance().requestOpenAI(
      endPrompt
    );

    if (!openAIResponse) {
      logger.error("No response received from OpenAI for end interview");
      return undefined;
    }

    cachedResponse.push({
      role: "assistant",
      content: [
        {
          type: "text",
          text: openAIResponse,
        },
      ],
    });
    this.cache.put(cacheKey, cachedResponse);

    return Promise.resolve({
      sessionID: cacheKey,
      response: openAIResponse,
    });
  }
}

export default InterviewService;
