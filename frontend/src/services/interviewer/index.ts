import { getError } from "@/lib/common";
import { postService } from "../main";

export const initInterviewService = async (
  type: "skill" | "jd",
  seniorityLevel: string,
  skill?: string,
  jobDescription?: string
): Promise<
  | {
      sessionID: string;
      response: string;
    }
  | string
> => {
  try {
    const response = await postService("/api/interview/init", {
      type,
      seniorityLevel,
      skill,
      jobDescription,
    });
    if (response.status) {
      return response.data;
    } else {
      throw new Error(response.message);
    }
  } catch (error) {
    return getError(error);
  }
};

export const continueInterviewService = async (
  userResponse: string,
  sessionID: string
): Promise<
  | {
      sessionID: string;
      response: string;
    }
  | string
> => {
  try {
    const response = await postService("/api/interview/continue", {
      userResponse,
      sessionID,
    });
    if (response.status) {
      return response.data;
    } else {
      throw new Error(response.message);
    }
  } catch (error) {
    return getError(error);
  }
};

export const endInterviewService = async (
  sessionID: string
): Promise<
  | {
      sessionID: string;
      response: string;
    }
  | string
> => {
  try {
    const response = await postService("/api/interview/end", {
      sessionID,
    });
    if (response.status) {
      return response.data;
    } else {
      throw new Error(response.message);
    }
  } catch (error) {
    return getError(error);
  }
};
