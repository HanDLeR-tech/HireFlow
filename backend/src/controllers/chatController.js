import { chatClient } from "../lib/stream.js";

export async function getStreamToken(req, resp) {
  try {
      const token = chatClient.createToken(req.user.clerkId);
      resp.status(200).json({
          token,
          userId: req.user.clerkId,
          userName: req.user.name,
          userImage: req.user.profileImage
      })
      
  } catch (error) {
      console.log("Error in getStreamToken controller", error.message);
      resp.status(500).json({message:"Internal server Error"})
  }
}
