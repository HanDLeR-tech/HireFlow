import express from "express";
import { ENV } from "./lib/env.js";
import { connectDB } from "./lib/db.js";
import  cors  from "cors";
import { serve } from "inngest/express";
import { inngest, functions } from "./lib/inngest.js";
import { clerkMiddleware } from "@clerk/express";
import { protectRoute } from "./middleware/protectRoute.js";
import chatRoutes from "./routes/chatRoutes.js";
import sessionRoute from "./routes/sessionRoute.js";

const app = express();

//middleware
app.use(express.json());
//Credentials:true => means that our server allows browser to send cookies to the server. This is required for authentication.
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true }));
app.use(clerkMiddleware()); //this adds auth field to request object: req.auth()

app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/chat",chatRoutes)
app.use("/api/sessions",sessionRoute)

app.get("/", (req, res) => {
  req.auth()
  res.send("Hello from Talent IQ backend!");
});

//when we pass an array of middleware to express route,it automatically flattens it and executes them in order.
app.get("/video-calls", protectRoute, (req, res) => {
  res.status(200).json({message:"AUTHENTICATED USER ACCESS GRANTED on protected route"})
})

app.listen(ENV.PORT, () => {
  console.log(`Server is running on port ${ENV.PORT}`);
  connectDB();
});
