import { StreamChat } from "stream-chat";
import { ENV } from "./env.js";
import { StreamClient } from "@stream-io/node-sdk";

const apiKey = ENV.STREAM_API_KEY;
const apiSecret = ENV.STREAM_API_SECRET;

if (!apiKey || !apiSecret) {
  throw new Error("STREAM_API_KEY and STREAM_API_SECRET must be set in the environment variables.");
}

export const chatClient = StreamChat.getInstance(apiKey, apiSecret); //will be used for chat functionality
export const streamClient = new StreamClient(apiKey, apiSecret); //will be used for video calling functionality

export const upsertStreamUser = async (userData) => {
  try {
    await chatClient.upsertUser(userData);
    console.log("Upserting user:", userData);

    const response = await chatClient.upsertUser(userData);

    console.log("Stream response:", response);
    console.log("Successfully upserted user:", userData.id);
  } catch (error) {
    console.error("Error upserting user to Stream:", error);
  }
};

export const deleteStreamUser = async (userId) => {
  try {
    await chatClient.deleteUsers([userId]);
    console.log(`Successfully deleted user with ID: ${userId} from Stream.`);
  } catch (error) {
    console.error("Error deleting user from Stream:", error);
  }
};
