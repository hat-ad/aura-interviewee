declare global {
  namespace NodeJS {
    export interface ProcessEnv {
      AZURE_SPEECH_SUBSCRIPTION_KEY: string;
      AZURE_SPEECH_SUBSCRIPTION_REGION: string;
    }
  }
  declare module "http" {
    interface IncomingMessage {
      user?: {
        id: string;
      };
    }
  }
}
