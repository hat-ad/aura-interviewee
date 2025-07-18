import cors from "cors";
import express, { Express, Request, Response } from "express";
import helmet from "helmet";
import path from "path";
import logger, { httpLogger } from "./lib/logger.service";
import router from "./router";

const app: Express = express();
const boostrapServer = async () => {
  app.use(httpLogger);
  app.use(helmet());
  app.use(cors());

  app.use(
    "/public",
    express.static(path.join(__dirname, "public"), {
      setHeaders(res: Response) {
        const now = new Date();
        const oneDayInMilliseconds = 24 * 60 * 60 * 1000;
        const expires = new Date(now.getTime() + oneDayInMilliseconds);

        res.set("x-timestamp", now.toString());
        res.set("Expires", expires.toUTCString());
        res.set("expires", expires.toUTCString());
        res.set("Access-Control-Allow-Origin", "*");
        res.set("Access-Control-Allow-Methods", "GET, OPTIONS");
        res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
        res.set("Access-Control-Allow-Credentials", "true");
        res.set("Cross-Origin-Resource-Policy", "cross-origin");
      },
    })
  );

  app.use(
    express.json({
      limit: "50mb",
      verify: (req: Request, _res: Response, buf) => {
        req.rawBody = buf.toString();
      },
    })
  );
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.use("/api", router);

  app.use((req: Request, res: Response) => {
    res.status(500).json({
      code: false,
      message: "Invalid Api.",
    });
  });
};

boostrapServer()
  .then(() => logger.info("Server started"))
  .catch((err) => {
    logger.error(err);
    process.exit(1);
  });
export default app;
