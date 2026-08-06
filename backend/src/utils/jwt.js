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