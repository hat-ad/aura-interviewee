export interface Endpoint {
  id: string;
  tokenLimit: number;
  requestLimit: number;
  url: string;
  key: string;
  isPaused: boolean;
}
