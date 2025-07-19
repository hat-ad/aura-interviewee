import { MessagePackEvent } from "@/types/handler";
import msgpack from "msgpack-lite";

export class MessagePackHelper {
  static encode(event: string, payload: Record<string, any> | Buffer): Buffer {
    const message: MessagePackEvent = { event, payload };
    return msgpack.encode(message);
  }

  static decode(data: Buffer): MessagePackEvent {
    try {
      const decoded = msgpack.decode(data);

      return decoded as MessagePackEvent;
    } catch (err) {
      throw new Error(`MessagePack decode failed: ${(err as Error).message}`);
    }
  }
}
