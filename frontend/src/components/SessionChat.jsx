import { useEffect, useRef, useState } from "react";
import axiosInstance from "../lib/axios.js";
import socket from "../lib/socket.js";
import useAuth from "../hooks/useAuth.js";

function SessionChat({ sessionId }) {
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const messagesEndRef = useRef(null);

  // =========================
  // Load Previous Messages
  // =========================
  useEffect(() => {
    if (!sessionId) return;

    const loadMessages = async () => {
      try {
        setLoading(true);

        const { data } = await axiosInstance.get(
          `/chat/${sessionId}/messages`
        );

        setMessages(data.messages || []);
      } catch (error) {
        console.error("Failed to load messages:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [sessionId]);

  // =========================
  // Join Session + Listen
  // =========================
  useEffect(() => {
    if (!sessionId) return;

    const handleReceiveMessage = (data) => {
      console.log("📨 Received message:", data);

      const incomingMessage = data.message;

      if (!incomingMessage) return;

      setMessages((prev) => {
        // Prevent duplicate messages
        const alreadyExists = prev.some(
          (msg) =>
            msg._id?.toString() ===
            incomingMessage._id?.toString()
        );

        if (alreadyExists) {
          console.log(
            "⚠️ Duplicate message ignored:",
            incomingMessage._id
          );

          return prev;
        }

        return [...prev, incomingMessage];
      });
    };

    /*
     * Remove the listener before adding it.
     *
     * This is especially useful during React StrictMode,
     * where effects can run more than once in development.
     */
    socket.off("receive_message");

    socket.on("receive_message", handleReceiveMessage);

    console.log("🚪 Joining session:", sessionId);

    socket.emit("join_session", sessionId);

    // Cleanup
    return () => {
      console.log("🚪 Leaving session:", sessionId);

      socket.off("receive_message", handleReceiveMessage);
    };
  }, [sessionId]);

  // =========================
  // Auto Scroll
  // =========================
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // =========================
  // Send Message
  // =========================
  const sendMessage = () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || !sessionId) return;

    console.log("📤 Sending message:", trimmedMessage);

    socket.emit("send_message", {
      sessionId,
      content: trimmedMessage,
    });

    setMessage("");
  };

  // =========================
  // Enter to Send
  // =========================
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-base-100">
      {/* =========================
          HEADER
      ========================= */}
      <div className="px-4 py-3 border-b border-base-300">
        <h3 className="font-semibold text-base-content">
          Session Chat
        </h3>

        <p className="text-xs text-base-content/50 mt-0.5">
          Chat with session participants
        </p>
      </div>

      {/* =========================
          MESSAGES
      ========================= */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-base-content/50">
              Loading messages...
            </p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-sm text-base-content/50">
                No messages yet.
              </p>

              <p className="text-xs text-base-content/40 mt-1">
                Start the conversation.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => {
              const senderId =
                msg.sender?._id?.toString();

              const currentUserId =
                user?._id?.toString();

              const isMine =
                senderId === currentUserId;

              return (
                <div
                  key={msg._id}
                  className={`flex ${
                    isMine
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div className="max-w-[70%]">
                    {/* Sender */}
                    {!isMine && (
                      <p className="text-xs font-medium text-base-content/60 mb-1">
                        {msg.sender?.name || "User"}
                      </p>
                    )}

                    {/* Message */}
                    <div
                      className={`px-3 py-2 text-sm ${
                        isMine
                          ? "bg-primary text-primary-content"
                          : "bg-base-200 text-base-content"
                      }`}
                    >
                      {msg.content}
                    </div>

                    {/* Timestamp */}
                    <p
                      className={`text-[10px] text-base-content/40 mt-1 ${
                        isMine
                          ? "text-right"
                          : "text-left"
                      }`}
                    >
                      {new Date(
                        msg.createdAt
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            })}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* =========================
          INPUT
      ========================= */}
      <div className="p-3 border-t border-base-300">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) =>
              setMessage(e.target.value)
            }
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="input input-bordered flex-1"
          />

          <button
            onClick={sendMessage}
            disabled={!message.trim()}
            className="btn btn-primary"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default SessionChat;