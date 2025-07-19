import axios from "axios";
import { IncomingMessage } from "http";
import config from "./config.service";
import logger from "./logger.service";

export class AuthService {
  public static extractToken(req: IncomingMessage): string | null {
    // 1. Try Authorization header (non-browser)
    const authHeader = req.headers["authorization"];

    if (authHeader?.startsWith("Bearer ")) {
      return authHeader.slice(7);
    }

    // 2. Try Sec-WebSocket-Protocol (browser)
    const protocol = req.headers["sec-websocket-protocol"];
    if (Array.isArray(protocol) && protocol[0] === "Bearer") {
      return protocol[1];
    } else if (typeof protocol === "string") {
      const [type, token] = protocol.split(",").map((s) => s.trim());
      if (type === "Bearer") return token;
    }

    return null;
  }

  public static async validateToken(token: string): Promise<string | null> {
    try {
      let apiconfig = {
        method: "post",
        maxBodyLength: Infinity,
        url: `${config.AUTH_SERVICE_URL}/auth/authenticate-token`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.request(apiconfig);
      const userID = response.data.result.userID;
      return userID;
    } catch (error) {
      if (
        axios.isAxiosError(error) &&
        error.response &&
        error.response.status === 401
      ) {
        logger.error("Invalid token");
      }
      return null;
    }
  }
}
