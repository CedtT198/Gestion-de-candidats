import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import pinoHttp from "pino-http";

import candidateRoutes from "./routes/candidate.routes";
import { apiLimiter } from "./middlewares/rateLimiter.middleware";
import { logger } from "./config/logger";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());

app.use(pinoHttp({ logger }));

app.use(apiLimiter);

app.use("/api/candidates", candidateRoutes);

export default app;