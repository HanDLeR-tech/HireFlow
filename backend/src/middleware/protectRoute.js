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