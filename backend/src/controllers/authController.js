import User from "../models/User.js";
import { hashPassword, comparePassword, compareRefreshToken } from "../utils/hash.js";
import { sendAuthResponse } from "../utils/sendAuthResponse.js";
import { verifyRefreshToken } from "../utils/jwt.js";
import { clearRefreshTokenCookie } from "../utils/cookies.js";
import { enqueueSyncUser } from "../jobs/user.jobs.js";

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
    const user = await User.create({
      name: trimmedName,
      email: trimmedEmail,
      password: hashedPassword,
    });

    // Queue background user synchronization
    try {
      await enqueueSyncUser(user);
    } catch (err) {
      console.error("Failed to enqueue sync-user job:", err);
    }

    return sendAuthResponse(user, res);
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
