import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import pinoHttp from "pino-http";

import candidateRoutes from "./routes/candidate.routes";
import { apiLimiter } from "./middlewares/rateLimiter.middleware";
import { logger } from "./config/logger";
import axios from 'axios';

const payloads = [
  "' OR 1=1 --",
  "'; DROP TABLE users; --",
  "' UNION SELECT null --"
];

async function test() {
  for (const payload of payloads) {
    try {
      const res = await axios.post('http://localhost:3000/api/candidates/login', {
        email: payload,
        password: payload,
      });

      console.log(`[${payload}] => ${res.status}`);
    } catch (err) {
      console.log(`[${payload}] => ${err}`);
    }
  }
}

console.log("=========SQL injection test=======");
test();



dotenv.config();

const app = express();

app.use(express.json());
app.use(helmet());

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? "https://gestion-candidats-frontend.onrender.com"
    : "http://localhost:5173",
  credentials: true
}));

app.use(express.json({ limit: '1mb' }));

app.use(pinoHttp({ logger }));
//  app.use(apiLimiter);

app.use("/api/candidates", candidateRoutes);

export default app;