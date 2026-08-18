import Session from "../models/Session.js";
import Message from "../models/Message.js";

export function registerSessionHandlers(io, socket) {
  // JOIN SESSION
  socket.on("join_session", async (sessionId) => {
    try {
      const session = await Session.findById(sessionId);

      if (!session) {
        return socket.emit("session_error", {
          message: "Session not found",
        });
      }

      const userId = socket.user._id.toString();

      const isHost = session.host.toString() === userId;

      const isParticipant = session.participants?.toString() === userId;

      if (!isHost && !isParticipant) {
        return socket.emit("session_error", {
          message: "You are not part of this session",
        });
      }

      if (session.status !== "active") {
        return socket.emit("session_error", {
          message: "Session is no longer active",
        });
      }

      socket.join(session.callId);

      console.log(`👥 ${socket.user.name} joined session ${session.callId}`);

      socket.emit("session_joined", {
        sessionId: session._id,
        callId: session.callId,
      });
    } catch (error) {
      console.error("Join Session Socket Error:", error);

      socket.emit("session_error", {
        message: "Failed to join session",
      });
    }
  });

}
