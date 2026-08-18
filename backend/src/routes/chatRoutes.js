import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { getStreamToken, getSessionMessages } from "../controllers/chatController.js";

const router = express.Router();

// /api.chat/token
router.get("/token", protectRoute, getStreamToken);

router.get("/:sessionId/messages", protectRoute, getSessionMessages);

export default router;
