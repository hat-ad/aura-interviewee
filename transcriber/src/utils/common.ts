import axios, { AxiosError } from "axios";
import { ZodError } from "zod";

export function getError(error: unknown) {
  if (error instanceof ZodError) return "invalid request";
  if (axios.isAxiosError(error)) {
    const err = error as AxiosError;
    const errData = err.response?.data as Record<string, string>;
    return errData?.message ?? err.message;
  }
  const err = error as Error;
  if (err?.message) return err.message;
  else {
    return String(error);
  }
}
