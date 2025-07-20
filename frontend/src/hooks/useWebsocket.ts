import type {
  MessagePackEvent,
  UseWebSocketOptions,
  UseWebSocketReturn,
} from "@/types/websocket";
import msgpack from "msgpack-lite";
import { useCallback, useEffect, useRef, useState } from "react";

const useWebSocket = (
  url: string,
  options: UseWebSocketOptions = {}
): UseWebSocketReturn<{
  event: string;
  payload: Record<string, unknown>;
}> => {
  const { reconnect = true, reconnectInterval = 3000 } = options;

  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<{
    event: string;
    payload: Record<string, unknown>;
  } | null>(null);
  const [error, setError] = useState<Event | null>(null);

  const connect = useCallback(() => {
    if (!url) return;

    ws.current = new WebSocket(url);
    ws.current.binaryType = "arraybuffer";

    ws.current.onopen = () => {
      setIsConnected(true);
      setError(null);
      console.log("[WebSocket] Connected");
    };

    ws.current.onmessage = (event: MessageEvent<ArrayBuffer>) => {
      try {
        const decoded = msgpack.decode(new Uint8Array(event.data));
        if (decoded.payload.status === "error") {
          throw new Error(decoded.payload.message);
        }
        setLastMessage(
          decoded as {
            event: string;
            payload: Record<string, unknown>;
          }
        );
      } catch (err) {
        console.error("[WebSocket] Message decode error:", err);
        setError(new Event("DecodeError"));
      }
    };

    ws.current.onerror = (event: Event) => {
      console.error("[WebSocket] Error:", event);
      setError(event);
    };

    ws.current.onclose = () => {
      console.log("[WebSocket] Disconnected");
      setIsConnected(false);
      if (reconnect) {
        reconnectTimeout.current = setTimeout(connect, reconnectInterval);
      }
    };
  }, [url, reconnect, reconnectInterval]);

  const sendMessage = useCallback((msg: MessagePackEvent) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      try {
        const encoded = msgpack.encode(msg);
        ws.current.send(encoded);
      } catch (err) {
        console.error("[WebSocket] Encode error:", err);
      }
    } else {
      console.warn("[WebSocket] Cannot send, connection not open");
    }
  }, []);

  const closeConnection = useCallback(() => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
    }
    ws.current?.close();
  }, []);

  useEffect(() => {
    connect();
    return () => {
      closeConnection();
    };
  }, [connect, closeConnection]);

  return {
    isConnected,
    lastMessage,
    error,
    sendMessage,
    closeConnection,
  };
};

export default useWebSocket;
