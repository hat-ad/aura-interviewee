import { TimeZone } from "./common";

declare global {
  namespace Express {
    export interface Request {
      rawBody: string;
      user?: {
        id: string;
        timezone: TimeZone;
      };
    }
  }
}
