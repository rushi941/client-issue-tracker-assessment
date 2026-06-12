import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from "./routes";
import { errorHandler } from "./middleware/error.middleware";
import { env } from "./config/env";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.CLIENT_URL,
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(cookieParser());
  app.use("/api", routes);
  app.get("/health", (_req, res) => res.json({ status: "ok" }));
  app.use(errorHandler);

  return app;
}
