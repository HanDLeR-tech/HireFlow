import { requireAuth } from "@clerk/express";
import User from "../models/User.js";

export const protectRoute = [
  requireAuth(), // This middleware ensures that the user is authenticated before accessing the route.
  async (req, res, next) => {
    try {
      const clerkId = req.auth().userId; // Get the authenticated user's ID from Clerk

      if (!clerkId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await User.findOne({ clerkId });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      req.user = user; // Attach the user object to the request for further use in the route handler
      next(); // Proceed to the next middleware or route handler
    } catch (error) {
      console.error("error in protecRoute middleware", error);

      res.status(500).json({ message: "Internal Server Error" });
    }
  },
];
