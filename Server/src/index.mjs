import express from "express";
import authRouter from "./routes/auth.route.mjs";
import messageRouter from "./routes/message.route.mjs";
import dotenv from "dotenv";
//import { connectDB } from "./lib/db.mjs";

import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { app, server } from "./lib/socket.mjs";

dotenv.config();

const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

app.use(
  cors({
    origin: [process.env.FRONTEND_URL, "http://localhost:5173","*"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
 
  })
);

// const __dirname = path.resolve();

// if (process.env.NODE_ENV === "production") {
//   app.use(express.static(path.join(__dirname, "../Client/dist")));
//   app.get("*", (req, res) => {
//     res.sendFile(path.join(__dirname, "../Client/dist/index.html"));
//   });
// }


// API Routes
app.use("/api/auth", authRouter);
app.use("/api/message", messageRouter);
app.get("/", (req, res) => {
  res.send("Welcome to the Chat App API");
});

// Start server
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  //connectDB();
  
});
