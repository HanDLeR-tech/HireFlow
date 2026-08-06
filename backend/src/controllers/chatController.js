import { chatClient } from "../lib/stream.js";

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