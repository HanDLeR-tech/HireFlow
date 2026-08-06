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
