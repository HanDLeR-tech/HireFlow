import User from "../models/User.js";
import { verifyAccessToken } from "../utils/jwt.js";

export const socketAuth = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Authentication required"));
    }

    const { userId } = verifyAccessToken(token);

    const user = await User.findById(userId).select(
      "_id name email profileImage"
    );

    if (!user) {
      return next(new Error("User not found"));
    }

    socket.user = user;

    next();
  } catch (error) {
    console.error("Socket Auth Error:", error.message);

    next(new Error("Invalid or expired access token"));
  }
};  