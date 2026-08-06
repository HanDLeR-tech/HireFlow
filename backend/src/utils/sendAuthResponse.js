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