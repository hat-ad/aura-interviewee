import winston from "winston";

export interface ClientContext {
  ip: string;
  sessionID: string;
  logger: winston.Logger;
  retryAttempts: number;
  retryTimeout?: NodeJS.Timeout;
}

export interface BinaryStreamContext extends ClientContext {
  paused: boolean;
}
