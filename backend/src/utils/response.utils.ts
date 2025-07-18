import logger from "@/lib/logger.service";
import { ApiResponse } from "@/types/common";
import { Response } from "express";
import { ZodError } from "zod";
import { getError } from "./common.utils";

export const OK = (
  res: Response,
  result: any,
  message = "",
  code = true
): void => {
  const response: ApiResponse = {
    code,
    message: message || "",
    result: result === null || result === undefined ? null : result,
  };
  res.status(200).json(response);
};

export const ERROR = (
  res: Response,
  error: unknown,
  result: any = null,
  message?: string,
  code = false
): void => {
  const response: ApiResponse = {
    code,
    message: message || getError(error),
    result: error instanceof ZodError ? error.issues : result,
  };
  logger.error(response.message, response.result);
  res.status(400).json(response);
};

export const UNAUTHORIZED = (
  res: Response,
  result: any,
  message = "Error",
  code = false
): void => {
  const response: ApiResponse = {
    code,
    message: message || "",
    result,
  };
  res.status(401).json(response);
};

export const UNKNOWN = (
  res: Response,
  result: any,
  message = "Error",
  code = false
): void => {
  const response: ApiResponse = {
    code,
    result,
    message: message || "",
  };
  res.status(500).json(response);
};

export function parseJSONFromString(input: string): Record<string, unknown> {
  console.log("🚀 ~ parseJSONFromString ~ input:", input);

  const match = input.match(/```json\s*([\s\S]*?)\s*```/);
  if (match) {
    return JSON.parse(match[1].trim());
  }
  return JSON.parse(input);
}
