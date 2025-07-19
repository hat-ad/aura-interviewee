import config from "@/config/env.config";
import { getError } from "@/utils/common.utils";
import axios, {
  AxiosRequestConfig,
  AxiosResponseHeaders,
  RawAxiosResponseHeaders,
} from "axios";
import AzureOpenAIRequestDistributor from "./azure-openai-request-distributor.service";
import { Cache } from "./cache.service";
import logger from "./logger.service";

export class OpenAIService {
  private static instance: OpenAIService;
  private requestDistributor: AzureOpenAIRequestDistributor;
  private cache: Cache<{
    tokensRemaining: number;
    requestsRemaining: number;
  }>;

  private constructor() {
    this.cache = new Cache<{
      tokensRemaining: number;
      requestsRemaining: number;
    }>();
    this.requestDistributor = new AzureOpenAIRequestDistributor(
      this.cache,
      config.OPENAI_ENDPOINTS
    );
  }

  public static getInstance(): OpenAIService {
    if (!OpenAIService.instance) {
      OpenAIService.instance = new OpenAIService();
    }
    return OpenAIService.instance;
  }

  private parseRateLimits(
    headers: RawAxiosResponseHeaders | AxiosResponseHeaders,
    id: string
  ) {
    const requestLimitRemaining = headers["x-ratelimit-remaining-requests"];
    const tokenLimitRemaining = headers["x-ratelimit-remaining-tokens"];

    logger.debug("Rate limits parsed", {
      id,
      tokenLimitRemaining,
      requestLimitRemaining,
    });

    this.requestDistributor.updateUsage(
      id,
      tokenLimitRemaining,
      requestLimitRemaining
    );
  }

  private getMessageContent(response: any): string | undefined {
    if (response && response.data) {
      logger.info("Tokens used", {
        tokens_used: {
          completion_tokens: response.data.usage.completion_tokens,
          prompt_tokens: response.data.usage.prompt_tokens,
          total_tokens: response.data.usage.total_tokens,
        },
      });
    }

    if (
      response &&
      response.data &&
      Array.isArray(response.data.choices) &&
      response.data.choices.length > 0 &&
      response.data.choices[0].message &&
      typeof response.data.choices[0].message.content === "string"
    ) {
      return response.data.choices[0].message.content;
    }
    // Return undefined or default fallback if content not found
    return undefined;
  }

  async requestOpenAI(
    prompt: Record<string, unknown>[]
  ): Promise<string | undefined> {
    const { url, id, key } = await this.requestDistributor.getServiceEndpoint();

    const axiosConfig: AxiosRequestConfig = {
      baseURL: url,
      method: "post",
      headers: {
        "Content-Type": "application/json",
        "api-key": key,
      },
      data: {
        stream: false,
        messages: prompt,
        temperature: 0.0,
        top_p: 1.0,
        presence_penalty: 0,
        stop: null,
        frequency_penalty: 0,
      },
    };

    try {
      const response = await axios(axiosConfig);
      logger.info("Translation fetched successfully", { endpointId: id });
      this.parseRateLimits(response.headers, id);
      return this.getMessageContent(response);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error("OpenAI request failed: " + getError(error));
        const timeOut = error.response?.headers["retry-after"] * 1000 || 1000;
        config.OPENAI_ENDPOINTS.forEach((element) => {
          if (element.id === id) {
            element.isPaused = true;
          }
        });
        logger.warn(`Endpoint ${id} rate-limited. Retrying in ${timeOut}ms.`);

        return new Promise((resolve) =>
          setTimeout(() => {
            config.OPENAI_ENDPOINTS.forEach((element) => {
              if (element.id === id) {
                this.requestDistributor.updateUsage(
                  id,
                  element.tokenLimit,
                  element.requestLimit
                );
                element.isPaused = false;
                logger.info(`Endpoint ${id} resumed after retry.`);
                resolve(this.requestOpenAI(prompt));
              }
            });
          }, timeOut)
        );
      }

      logger.error("Translation request failed: " + getError(error));
      return undefined;
    }
  }
}
