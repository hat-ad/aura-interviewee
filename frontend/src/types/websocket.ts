export interface MessagePackEvent {
  event: string;
  subevent?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: Record<string, any> | Uint8Array;
}
export interface WebSocketResponse<T = unknown> {
  type: string;
  status: "success" | "error";
  message?: string;
  data?: T;
}

export interface UseWebSocketOptions {
  reconnect?: boolean;
  reconnectInterval?: number;
}

export interface UseWebSocketReturn<T = unknown> {
  isConnected: boolean;
  lastMessage: WebSocketResponse<T> | null;
  error: Event | null;
  sendMessage: (msg: MessagePackEvent) => void;
  closeConnection: () => void;
}
