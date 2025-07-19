import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const configSchema = z.object({
  AZURE_SPEECH_SUBSCRIPTION_KEY: z.string().min(1),
  AZURE_SPEECH_SUBSCRIPTION_REGION: z.string().min(1),
  RATE_LIMIT_PER_SEC: z.string().regex(/^\d+$/).transform(Number),
  TIMEOUT_IN_MS: z.string().regex(/^\d+$/).transform(Number),
  AUTH_SERVICE_URL: z.string().min(1),
  PORT: z.string().regex(/^\d+$/).transform(Number),
});

export type Config = z.infer<typeof configSchema>;

const config: Config = configSchema.parse(process.env);

export default config;
