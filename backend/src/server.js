import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { redisConnection } from "./lib/redis.js";
import "./workers/user.worker.js";  

import { ENV } from "./lib/env.js";
import { connectDB } from "./lib/db.js";

import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import sessionRoute from "./routes/sessionRoute.js";

import { protectRoute } from "./middleware/protectRoute.js";

const app = express();

app.use(express.json());

app.use(cookieParser());

app.use(
  cors({
    origin: ENV.CLIENT_URL,
    credentials: true,
  }),
);

app.use("/api/auth", authRoutes);

app.use("/api/chat", chatRoutes);

app.use("/api/sessions", sessionRoute);

app.get("/", (req, res) => {
  res.send("Hello from HireFlow backend!");
});

app.get("/video-calls", protectRoute, (req, res) => {
  res.status(200).json({
    message: "AUTHENTICATED USER ACCESS GRANTED",
  });
});

redisConnection.on("connect", () => {
  console.log("✅ Connected to Redis");
});

redisConnection.on("ready", () => {
  console.log("🚀 Redis Ready");
});

redisConnection.on("error", (err) => {
  console.error("❌ Redis Error:", err);
});

redisConnection.on("close", () => {
  console.log("Redis connection closed");
});

app.listen(ENV.PORT, () => {
  console.log(`Server is running on port ${ENV.PORT}`);
  connectDB();
});
