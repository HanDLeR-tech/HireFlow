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
import { socketAuth } from "./middleware/socketAuth.js";
import { protectRoute } from "./middleware/protectRoute.js";

import { createServer } from "http";
import { Server } from "socket.io";
import { registerSessionHandlers } from "./sockets/session.socket.js";
import { registerChatHandlers } from "./sockets/chat.socket.js";

const app = express();
const httpServer = createServer(app);

app.use(express.json());

const io = new Server(httpServer, {
  cors: {
    origin: ENV.CLIENT_URL,
    credentials: true,
  },
});

const onlineUsers = new Map();

io.use(socketAuth);

io.on("connection", (socket) => {
  const userId = socket.user._id.toString();

  onlineUsers.set(userId, socket.id);

  console.log(`User connected: ${socket.user.name} (${socket.id})`);

  registerSessionHandlers(io, socket);
  registerChatHandlers(io, socket);

  socket.on("disconnect", () => {
    onlineUsers.delete(userId);

    console.log(`User disconnected: ${socket.user.name} (${socket.id})`);
  });
});

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
  console.log("Connected to Redis");
});
redisConnection.on("ready", () => {
  console.log("Redis Ready");
});
redisConnection.on("error", (err) => {
  console.error("Redis Error:", err);
});
redisConnection.on("close", () => {
  console.log("Redis connection closed");
});

httpServer.listen(ENV.PORT, () => {
  console.log(`Server is running on port ${ENV.PORT}`);
  connectDB();
});
