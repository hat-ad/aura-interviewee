import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const configSchema = z.object({
  PORT: z.string().regex(/^\d+$/).transform(Number),
  NODE_ENV: z
    .union([z.literal("production"), z.literal("development")])
    .default("development")
    .optional(),
});

export type Config = z.infer<typeof configSchema> & {};

const config: Config = {
  ...configSchema.parse(process.env),
};

export default config;
