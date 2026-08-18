import { chatClient } from "../lib/stream.js";
import Message from "../models/Message.js";
import Session from "../models/Session.js";


export async function getStreamToken(req, res) {
  try {
    const streamUserId = req.user._id.toString();

    const token = chatClient.createToken(streamUserId);

    return res.status(200).json({
      token,
      userId: streamUserId,
      userName: req.user.name,
      userImage: req.user.profileImage,
    });
  } catch (error) {
    console.error("Error in getStreamToken controller:", error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}

export async function getSessionMessages(req, res) {
  try {
    const { sessionId } = req.params;
    const userId = req.user._id.toString();

    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({
        message: "Session not found",
      });
    }

    const isHost = session.host.toString() === userId;

    const isParticipant =
      session.participants?.toString() === userId;

    if (!isHost && !isParticipant) {
      return res.status(403).json({
        message: "You are not part of this session",
      });
    }

    const messages = await Message.find({
      session: sessionId,
    })
      .populate("sender", "name profileImage")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      messages,
    });
  } catch (error) {
    console.error("Get Session Messages Error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}