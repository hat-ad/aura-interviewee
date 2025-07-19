import dotenv from "dotenv";
import { z } from "zod";
import openAIEndpoints from "./openai-endpoints.json";

dotenv.config();

const configSchema = z.object({
  PORT: z.string().regex(/^\d+$/).transform(Number),
  NODE_ENV: z
    .union([z.literal("production"), z.literal("development")])
    .default("development")
    .optional(),
});

export type Config = z.infer<typeof configSchema> & {
  OPENAI_ENDPOINTS: typeof openAIEndpoints;
};

const config: Config = {
  ...configSchema.parse(process.env),
  OPENAI_ENDPOINTS: openAIEndpoints,
};

export default config;
