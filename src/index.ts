import express from "express";
import http from "http";
import cors from "cors";
import morgan from "morgan";
import trackerRoutes from "./routes/trackerRoutes";
import config from "./config/env";
import logger from "./utils/logger";
import { initWebsockets } from "./websockets";

const app = express();
const server = http.createServer(app);

initWebsockets(server);

app.use(
  cors({
    origin: config.corsOrigin,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan(config.isDev() ? "dev" : "combined"));

app.get("/ping", (req, res) => {
  res.send("pong");
});

app.use("/api", trackerRoutes);

app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    logger.error(`Unhandled error: ${err.message}`);
    logger.error(err.stack);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
);

const PORT = config.port;
server.listen(PORT, () => {
  logger.info(`Server running in ${config.nodeEnv} mode on port ${PORT}`);
});

process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully");
  server.close(() => {
    logger.info("HTTP server closed");
    process.exit(0);
  });
});

export default server;
