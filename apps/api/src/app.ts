import express from "express";
import cors from "cors";
import { rateLimiter } from "./middleware/rateLimiter";
import shortenRouter from "./routes/shorten";
import redirectRouter from "./routes/redirect";

export const app = express();

app.use(cors());
app.use(express.json());
app.use(rateLimiter);

app.use("/api", shortenRouter);

app.get("/health", (_, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/", redirectRouter);
