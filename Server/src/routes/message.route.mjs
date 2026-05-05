import { Router } from "express";
import { protect } from "../middleware/auth.middleware.mjs";
import {
  getUsersForSideBar,
  getMessages,
  sendMessage,
  getAiResponse,
  deleteMessage,
} from "../controllers/message.controller.mjs";
import {
  generateCall,
  endCall,
  acceptCall,
  rejectCall,
} from "../controllers/call.controller.mjs";
import multer from "multer";

const router = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });
router.get("/users", protect, getUsersForSideBar);
router.get("/received-messages/:id", protect, getMessages);
router.post("/send-message/:id", protect, upload.single("file"), sendMessage);
router.delete("/delete-message", protect, deleteMessage);
router.post("/getAiResponse", protect, getAiResponse);
router.post("/generateCall", protect, generateCall);
router.post("/acceptCall", protect, acceptCall);
router.post("/rejectCall", protect, rejectCall);
router.post("/endCall", protect, endCall);

export default router;
