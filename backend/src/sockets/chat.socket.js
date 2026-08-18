import Message from "../models/Message.js";
import Session from "../models/Session.js";

export function registerChatHandlers(io, socket) {
  socket.on("send_message", async ({ sessionId, content }) => {
    try {
      if (!content || !content.trim()) {
        return socket.emit("chat_error", {
          message: "Message cannot be empty",
        });
      }

      const session = await Session.findById(sessionId);

      if (!session) {
        return socket.emit("chat_error", {
          message: "Session not found",
        });
      }

      const userId = socket.user._id.toString();

      const isHost = session.host.toString() === userId;

      const isParticipant =
        session.participants?.toString() === userId;

      if (!isHost && !isParticipant) {
        return socket.emit("chat_error", {
          message: "You are not part of this session",
        });
      }

      if (session.status !== "active") {
        return socket.emit("chat_error", {
          message: "Session is no longer active",
        });
      }

      const message = await Message.create({
        session: session._id,
        sender: socket.user._id,
        content: content.trim(),
      });

      const populatedMessage = await message.populate(
        "sender",
        "name profileImage",
      );

      io.to(session.callId).emit("receive_message", {
        message: populatedMessage,
      });
    } catch (error) {
      console.error("Send Message Socket Error:", error);

      socket.emit("chat_error", {
        message: "Failed to send message",
      });
    }
  });
}