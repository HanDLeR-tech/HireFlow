import Session from "../models/Session.js";
import { chatClient, streamClient } from "../lib/stream.js";

export async function createSession(req, res) {
  try {
    const { problem, difficulty } = req.body;
    const userId = req.user._id;
    const streamUserId = userId.toString();

    if (!problem || !difficulty) {
      return res.status(400).json({ message: "Problem and difficulty are required" });
    }

    //generate a unique callId for the video call
    const callId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // create a session in the database
    const session = await Session.create({ problem, difficulty, host: userId, callId });

    //create stream video call
    await streamClient.video.call("default", callId).getOrCreate({
      data: {
        created_by_id: streamUserId,
        custom: { problem, difficulty, sessionId: session._id.toString() },
      },
    });

    //chat channel

    const channel = chatClient.channel("messaging", callId, {
      name: `${problem} Session`,
      created_by_id: streamUserId,
      members: [streamUserId],
    });

    await channel.create();

    res.status(201).json({ message: "Session created successfully", session });
  } catch (error) {
    console.log("Error in createSession controler:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getActiveSession(_, res) {
  try {
    const sessions = await Session.find({ status: "active" })
      .populate("host", "name profileImage email")
      .populate("participants", "name profileImage email")
      .sort({ createdAt: -1 })
      .limit(20);
    res.status(200).json({ sessions });
  } catch (error) {
    console.log("Error in getActiveSession controller:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getMyRecentSession(req, res) {
  try {
    const userId = req.user._id;

    //get sessions where the user is either the host or a participantss
    const sessions = await Session.find({
      status: "completed",
      $or: [{ host: userId }, { participants: userId }],
    })
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({ sessions });
  } catch (error) {
    console.log("Error in getMyRecentSession controller:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getSessionById(req, res) {
  try {
    const { id } = req.params;

    const session = await Session.findById(id)
      .populate("host", "name profileImage email")
      .populate("participants", "name profileImage email");

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    res.status(200).json({ session });
  } catch (error) {
    console.log("Error in getSessionById controller:", error.message);

    res.status(500).json({ message: "Internal server error" });
  }
}

export async function joinSession(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const streamUserId = userId.toString();

    const session = await Session.findById(id);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (session.status !== "active") {
      return res.status(400).json({ message: "Cannot join a completed Session" });
    }

    if (session.host.toString() === userId.toString()) {
      return res.status(400).json({ message: "You cannot join your own session" });
    }

    // check if session is already full - has a participants

    if (session.participants) {
      return res.status(409).json({ message: "Session is already full" });
    }

    session.participants = userId;
    await session.save();

    const channel = chatClient.channel("messaging", session.callId);
    await channel.addMembers([streamUserId]);
    res.status(200).json({ message: "Joined session successfully", session });
  } catch (error) {
    console.log("Error in joinSession controller:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function endSession(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const session = await Session.findById(id);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    //check if the user is the host of the session
    if (session.host.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You are not authorized to end this session" });
    }

    //check if the session is already completed
    if (session.status == "completed") {
      return res.status(400).json({ message: "Session is already completed" });
    }

    //delete the stream video call
    const call = streamClient.video.call("default", session.callId);
    await call.delete({ hard: true });

    //delete the chat channel
    const channel = chatClient.channel("messaging", session.callId);
    await channel.delete();

    session.status = "completed";
    await session.save();

    res.status(200).json({ message: "Session ended successfully", session });
  } catch (error) {
    console.log("Error in endSession controller:", error.message);

    res.status(500).json({ message: "Internal server error" });
  }
}
