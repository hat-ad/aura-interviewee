import axios, { AxiosError } from "axios";

export function getError(error: unknown): any {
  if (axios.isAxiosError(error)) {
    const err = error as AxiosError;
    const errData = err.response?.data as Record<string, string>;
    return errData?.message ?? err.message;
  }
  const err = error as Error;
  if (err?.message) return err.message;
  else {
    return JSON.stringify(error);
  }
}
