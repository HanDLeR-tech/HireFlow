REPOSITORY STRUCTURE:
├── src
│   ├── controllers
│   │   ├── authController.js
│   │   ├── chatController.js
│   │   └── sessionController.js
│   ├── lib
│   │   ├── db.js
│   │   ├── env.js
│   │   ├── inngest.js
│   │   └── stream.js
│   ├── middleware
│   │   ├── protectRoute.js
│   │   └── rateLimiter.js
│   ├── models
│   │   ├── Session.js
│   │   └── User.js
│   ├── routes
│   │   ├── authRoutes.js
│   │   ├── chatRoutes.js
│   │   └── sessionRoute.js
│   ├── utils
│   │   ├── cookies.js
│   │   ├── hash.js
│   │   ├── jwt.js
│   │   └── sendAuthResponse.js
│   └── server.js
├── .env
└── package.json

FILES:

<file path="package.json">
{
  "main": "src/server.js",
  "dependencies": {
    "@clerk/express": "^2.1.35",
    "@stream-io/node-sdk": "^0.7.61",
    "bcrypt": "^6.0.0",
    "cookie-parser": "^1.4.7",
    "cors": "^2.8.6",
    "dotenv": "^17.4.2",
    "express": "^5.2.1",
    "init": "^0.1.2",
    "inngest": "^4.11.0",
    "jsonwebtoken": "^9.0.3",
    "mongoose": "^9.7.3",
    "nodemon": "^3.1.14",
    "stream-chat": "^9.50.0"
  },
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  },
  "type": "module"
}
</file>

<file path="src/controllers/authController.js">
import User from "../models/User.js";
import { hashPassword, comparePassword, compareRefreshToken } from "../utils/hash.js";
import { sendAuthResponse } from "../utils/sendAuthResponse.js";
import { verifyRefreshToken } from "../utils/jwt.js";
import { clearRefreshTokenCookie } from "../utils/cookies.js";

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const trimmedName = name?.trim();
    const trimmedEmail = email?.trim().toLowerCase();

    // Validate input
    if (!trimmedName || !trimmedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    // Password validation
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long.",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      email: trimmedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already exists.",
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    await User.create({
      name: trimmedName,
      email: trimmedEmail,
      password: hashedPassword,
    });

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
    });
  } catch (error) {
    console.error("Register Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const trimmedEmail = email?.trim().toLowerCase();

    if (!trimmedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({
      email: trimmedEmail,
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const isPasswordCorrect = await comparePassword(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    return sendAuthResponse(user, res);
  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

export const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token missing.",
      });
    }

    const payload = verifyRefreshToken(refreshToken);

    const user = await User.findById(payload.userId).select("+hashedRefreshToken");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token.",
      });
    }

    if (!compareRefreshToken(refreshToken, user.hashedRefreshToken)) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token.",
      });
    } 

    return sendAuthResponse(user, res);
  } catch (error) {
    console.error("Refresh Error:", error);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired refresh token.",
    });
  }
};


export const logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (refreshToken) {
    try {
      const { userId } = verifyRefreshToken(refreshToken);

      await User.findByIdAndUpdate(userId, {
        hashedRefreshToken: null,
      });
    } catch (error) {
      console.warn("Logout with invalid refresh token.");
    }
  }

  clearRefreshTokenCookie(res);

  return res.status(200).json({
    success: true,
    message: "Logged out successfully.",
  });
};
</file>

<file path="src/controllers/chatController.js">
import { chatClient } from "../lib/stream.js";

export async function getStreamToken(req, resp) {
  try {
      const token = chatClient.createToken(req.user.clerkId);
      resp.status(200).json({
          token,
          userId: req.user.clerkId,
          userName: req.user.name,
          userImage: req.user.profileImage
      })
      
  } catch (error) {
      console.log("Error in getStreamToken controller", error.message);
      resp.status(500).json({message:"Internal server Error"})
  }
}
</file>

<file path="src/controllers/sessionController.js">
import Session from "../models/Session.js";
import { chatClient, streamClient } from "../lib/stream.js";

export async function createSession(req, res) {
  try {
    const { problem, difficulty } = req.body;
    const userId = req.user._id;
    const clerkId = req.user.clerkId;

    if (!problem || !difficulty) {
      return res.status(400).json({ message: "Problem and difficulty are required" });
    }

    //generate a unique callId for the video call
    const callId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // create a session in the database
    const session = await Session.create({ problem, difficulty, host: userId, callId });

    //create stream video call
    await streamClient.video.call("default", callId).getOrCreate({
      data: {
        created_by_id: clerkId,
        custom: { problem, difficulty, sessionId: session._id.toString() },
      },
    });

    //chat channel

    const channel = chatClient.channel("messaging", callId, {
      name: `${problem} Session`,
      created_by_id: clerkId,
      members: [clerkId],
    });

    await channel.create();

    res.status(201).json({ message: "Session created successfully", session });
  } catch (error) {
    console.log("Error in createSession controler:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getActiveSession(_, res) {
  try {
    const sessions = await Session.find({ status: "active" })
      .populate("host", "name profileImage email clerkId")
      .populate("participants", "name profileImage email clerkId")
      .sort({ createdAt: -1 })
      .limit(20);
    res.status(200).json({ sessions });
  } catch (error) {
    console.log("Error in getActiveSession controller:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getMyRecentSession(req, res) {
  try {
    const userId = req.user._id;

    //get sessions where the user is either the host or a participantss
    const sessions = await Session.find({
      status: "completed",
      $or: [{ host: userId }, { participants: userId }],
    })
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({ sessions });
  } catch (error) {
    console.log("Error in getMyRecentSession controller:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getSessionById(req, res) {
  try {
    const { id } = req.params;

    const session = await Session.findById(id)
      .populate("host", "name profileImage email clerkId")
      .populate("participants", "name profileImage email clerkId");

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    res.status(200).json({ session });
  } catch (error) {
    console.log("Error in getSessionById controller:", error.message);

    res.status(500).json({ message: "Internal server error" });
  }
}

export async function joinSession(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const clerkId = req.user.clerkId;

    const session = await Session.findById(id);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (session.status !== "active") {
      return res.status(400).json({ message: "Cannot join a completed Session" });
    }

    if (session.host.toString() === userId.toString()) {
      return res.status(400).json({ message: "You cannot join your own session" });
    }

    // check if session is already full - has a participants

    if (session.participants) {
      return res.status(409).json({ message: "Session is already full" });
    }

    session.participants = userId;
    await session.save();

    const channel = chatClient.channel("messaging", session.callId);
    await channel.addMembers([clerkId]);

    res.status(200).json({ message: "Joined session successfully", session });
  } catch (error) {
    console.log("Error in joinSession controller:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function endSession(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const session = await Session.findById(id);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    //check if the user is the host of the session
    if (session.host.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You are not authorized to end this session" });
    }

    //check if the session is already completed
    if (session.status == "completed") {
      return res.status(400).json({ message: "Session is already completed" });
    }

    //delete the stream video call
    const call = streamClient.video.call("default", session.callId);
    await call.delete({ hard: true });

    //delete the chat channel
    const channel = chatClient.channel("messaging", session.callId);
    await channel.delete();

    session.status = "completed";
    await session.save();

    res.status(200).json({ message: "Session ended successfully", session });
  } catch (error) {
    console.log("Error in endSession controller:", error.message);

    res.status(500).json({ message: "Internal server error" });
  }
}
</file>

<file path="src/lib/db.js">
import mongoose from "mongoose";
import { ENV } from "./env.js";

export const connectDB = async () => {
  try {
      const conn = await mongoose.connect(ENV.DB_URL);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};
</file>

<file path="src/lib/env.js">
import dotenv from "dotenv";
dotenv.config();

export const ENV = {
  PORT: process.env.PORT,
  DB_URL: process.env.DB_URL,
  CLIENT_URL: process.env.CLIENT_URL,

  NODE_ENV: process.env.NODE_ENV,

  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,

  ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN,

  INNGEST_EVENT_KEY: process.env.INNGEST_EVENT_KEY,
  INNGEST_SIGNING_KEY: process.env.INNGEST_SIGNING_KEY,

  STREAM_API_KEY: process.env.STREAM_API_KEY,
  STREAM_API_SECRET: process.env.STREAM_API_SECRET,
};
</file>

<file path="src/lib/inngest.js">
import { Inngest } from "inngest";
import { connectDB } from "./db.js";
import User from "../models/User.js";
import { upsertStreamUser,deleteStreamUser } from "./stream.js";

export const inngest = new Inngest({ id: "talent-iq" });

const syncUser = inngest.createFunction(
  { id: "sync-user", triggers: [{ event: "clerk/user.created" }] },

  async ({ event }) => {
    await connectDB();

    const { id, email_addresses, first_name, last_name, image_url } = event.data;
    const newUser = {
      clerkId: id,
      name: `${first_name || ""} ${last_name || ""}`,
      email: email_addresses[0]?.email_address,
      profileImage: image_url,
    };

    await User.create(newUser);

    await upsertStreamUser({
      id: newUser.clerkId.toString(),
      name: newUser.name,
      image: newUser.profileImage

    });
  },
);

const deleteUserFromDB = inngest.createFunction(
  {
    id: "delete-user-from-db",
    triggers: [{ event: "clerk/user.deleted" }],
  },

  async ({ event }) => {
    await connectDB();

    const { id } = event.data;

    await User.deleteOne({ clerkId: id });

        await deleteStreamUser({ id: id.toString() });

  },
);

export const functions = [syncUser, deleteUserFromDB];
</file>

<file path="src/lib/stream.js">
import { StreamChat } from "stream-chat";
import { ENV } from "./env.js";
import { StreamClient } from "@stream-io/node-sdk";

const apiKey = ENV.STREAM_API_KEY;
const apiSecret = ENV.STREAM_API_SECRET;

if (!apiKey || !apiSecret) {
  throw new Error("STREAM_API_KEY and STREAM_API_SECRET must be set in the environment variables.");
}

export const chatClient = StreamChat.getInstance(apiKey, apiSecret); //will be used for chat functionality
export const streamClient = new StreamClient(apiKey, apiSecret); //will be used for video calling functionality

export const upsertStreamUser = async (userData) => {
  try {
    await chatClient.upsertUser(userData);
    console.log("Upserting user:", userData);

    const response = await chatClient.upsertUser(userData);

    console.log("Stream response:", response);
    console.log("Successfully upserted user:", userData.id);
  } catch (error) {
    console.error("Error upserting user to Stream:", error);
  }
};

export const deleteStreamUser = async (userId) => {
  try {
    await chatClient.deleteUsers([userId]);
    console.log(`Successfully deleted user with ID: ${userId} from Stream.`);
  } catch (error) {
    console.error("Error deleting user from Stream:", error);
  }
};
</file>

<file path="src/middleware/protectRoute.js">
import User from "../models/User.js";
import { verifyAccessToken } from "../utils/jwt.js";

export const protectRoute = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    const token = authHeader.split(" ")[1];

    const { userId } = verifyAccessToken(token);

    const user = await User.findById(userId).select(
      "_id name email profileImage"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error("Protect Route Error:", error);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired access token.",
    });
  }
};
</file>

<file path="src/middleware/rateLimiter.js">

</file>

<file path="src/models/Session.js">
import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    problem: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    participants: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
    },
    //stream video call id
    callId: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

const Session = mongoose.model("Session", sessionSchema);

export default Session;
</file>

<file path="src/models/User.js">
// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//     },
//     email: {
//       type: String,
//       required: true,
//       unique: true,
//     },
//     profileImage: {
//       type: String,
//       default: "",
//     },
//     clerkId: {
//       type: String,
//       required: true,
//       unique: true,
//     },
//   },
//   { timestamps: true },
// );

// const User = mongoose.model("User", userSchema);

// export default User;


import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      select: false, // Never returned by default
    },

    profileImage: {
      type: String,
      default: "",
    },

    hashedRefreshToken: {
      type: String,
      select: false, // Never returned by default
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Explicit unique index
userSchema.index({ email: 1 }, { unique: true });

const User = mongoose.model("User", userSchema);

export default User;
</file>

<file path="src/routes/authRoutes.js">
import express from "express";

import { register, login, refresh, logout } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.post("/refresh", refresh);

router.post("/logout", logout);

export default router;
</file>

<file path="src/routes/chatRoutes.js">
import express from "express";
import { getStreamToken } from "../controllers/chatController.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

// /api.chat/token
router.get("/token", protectRoute,getStreamToken)

export default router;
</file>

<file path="src/routes/sessionRoute.js">
import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  createSession,
  endSession,
  getActiveSession,
  getMyRecentSession,
  getSessionById,
  joinSession,
} from "../controllers/sessionController.js";

const router = express.Router();

router.post("/", protectRoute, createSession);
router.get("/active", protectRoute, getActiveSession);
router.get("/my-recent", protectRoute, getMyRecentSession);

router.get("/:id", protectRoute, getSessionById);
router.post("/:id/join", protectRoute, joinSession);
router.post("/:id/end", protectRoute, endSession);

export default router;
</file>

<file path="src/server.js">
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

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
  })
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

app.listen(ENV.PORT, () => {
  console.log(`Server is running on port ${ENV.PORT}`);
  connectDB();
});
</file>

<file path="src/utils/cookies.js">
import { ENV } from "../lib/env.js";

const cookieOptions = {
  httpOnly: true,
  secure: ENV.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: Number(ENV.REFRESH_COOKIE_MAX_AGE),
};

export const setRefreshTokenCookie = (res, token) => {
  res.cookie("refreshToken", token, cookieOptions);
};

export const clearRefreshTokenCookie = (res) => {
  res.clearCookie("refreshToken", cookieOptions);
};
</file>

<file path="src/utils/hash.js">
import bcrypt from "bcrypt";
import crypto from "crypto";

const SALT_ROUNDS = 12;

export const hashPassword = async (password) => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

export const hashRefreshToken = (refreshToken) => {
  return crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");
};

export const compareRefreshToken = (incomingToken, storedHash) => {
  if (!storedHash) return false;

  const incomingHash = hashRefreshToken(incomingToken);

  return crypto.timingSafeEqual(
    Buffer.from(incomingHash, "hex"),
    Buffer.from(storedHash, "hex")
  );
};
</file>

<file path="src/utils/jwt.js">
import jwt from "jsonwebtoken";
import { ENV } from "../lib/env.js";

export const generateAccessToken = (userId) => {
  return jwt.sign(
    { userId },
    ENV.ACCESS_TOKEN_SECRET,
    {
      expiresIn: ENV.ACCESS_TOKEN_EXPIRES_IN,
    }
  );
};

export const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId },
    ENV.REFRESH_TOKEN_SECRET,
    {
      expiresIn: ENV.REFRESH_TOKEN_EXPIRES_IN,
    }
  );
};

export const verifyAccessToken = (token) =>
  jwt.verify(token, ENV.ACCESS_TOKEN_SECRET);

export const verifyRefreshToken = (token) =>
  jwt.verify(token, ENV.REFRESH_TOKEN_SECRET);
</file>

<file path="src/utils/sendAuthResponse.js">
import User from "../models/User.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "./jwt.js";
import { hashRefreshToken } from "./hash.js";
import { setRefreshTokenCookie } from "./cookies.js";

export const sendAuthResponse = async (user, res) => {
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  await User.findByIdAndUpdate(user._id, {
    hashedRefreshToken: hashRefreshToken(refreshToken),
  });

  setRefreshTokenCookie(res, refreshToken);

  return res.status(200).json({
    success: true,
    accessToken,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      profileImage: user.profileImage,
    },
  });
};
</file>
