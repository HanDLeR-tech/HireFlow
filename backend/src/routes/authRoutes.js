import express from "express";

import { register, login, refresh, logout } from "../controllers/authController.js";

import { registerRateLimiter, loginRateLimiter, refreshRateLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/register", registerRateLimiter, register);

router.post("/login", loginRateLimiter, login);

router.post("/refresh", refreshRateLimiter, refresh);

router.post("/logout", logout);

export default router;
