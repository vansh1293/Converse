import { getReceiverSocketID } from "../lib/socket.mjs";
import { io } from "../lib/socket.mjs";

export const generateCall = (req, res) => {
  try {
    const { id, offer, senderData } = req.body;
    const receiverSocketID = getReceiverSocketID(id);
    if (receiverSocketID) {
      io.to(receiverSocketID).emit("incomingCall", {
        senderID: req.user.id,
        senderData: senderData,
        offer,
      });
    }
    res.status(200).json({
      message: "Call initiated",
      receiverID: id,
    });
  } catch (error) {
    console.log("Error in call controller: ", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const acceptCall = (req, res) => {
  try {
    const { id, answer } = req.body;
    const receiverSocketID = getReceiverSocketID(id);
    if (receiverSocketID) {
      io.to(receiverSocketID).emit("callAccepted", {
        senderID: req.user.id,
        answer,
      });
    }
    res.status(200).json({ message: "Call accepted" });
  } catch (error) {
    console.log("Error in acceptCall controller: ", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const rejectCall = (req, res) => {
  try {
    const { id } = req.body;
    const receiverSocketID = getReceiverSocketID(id);
    if (receiverSocketID) {
      io.to(receiverSocketID).emit("callRejected", { senderID: req.user.id });
    }
    res.status(200).json({ message: "Call rejected" });
  } catch (error) {
    console.log("Error in rejectCall controller: ", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const endCall = (req, res) => {
  try {
    const { id } = req.body;
    const receiverSocketID = getReceiverSocketID(id);
    if (receiverSocketID) {
      io.to(receiverSocketID).emit("callEnded", { senderID: req.user.id });
    }
    res.status(200).json({ message: "Call ended" });
  } catch (error) {
    console.log("Error in endCall controller: ", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
