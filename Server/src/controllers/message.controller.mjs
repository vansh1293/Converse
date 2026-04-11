// import User from '../models/user.models.mjs';
// import Message from '../models/message.models.mjs';
import prisma from "../lib/prisma.mjs";
import cloudinary from "../lib/cloudinary.mjs";
import { getReceiverSocketID } from "../lib/socket.mjs";
import { io } from "../lib/socket.mjs";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const getUsersForSideBar = async (req, res) => {
  try {
    const loggedUserId = req.user.id;
    const users = await prisma.user.findMany({
      where: {
        id: {
          not: loggedUserId,
        },
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        profileImage: true,
      },
    });
    res.status(200).json(users);
  } catch (error) {
    console.log("Error in getUsersForSideBar controller: ", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatWithId } = req.params;
    const myDeviceId = req.query.myDeviceId;
    const senderDevicesIds = req.query.senderDevicesIds;
    const loogedUserId = req.user.id;
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          {
            senderDeviceId: myDeviceId,
            receiverDeviceId: {
              in: senderDevicesIds,
            },
          },
          {
            receiverDeviceId: myDeviceId,
            senderDeviceId: {
              in: senderDevicesIds,
            },
          },
        ],
      },
      orderBy: {
        createdAt: "asc", // use asc for chat flow
      },
    });
    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const arr = req.body;
    const { id: receiverID } = req.params;
    const senderID = req.user.id;
    if (!receiverID) {
      return res.status(400).json({ message: "Receiver ID is required" });
    }
    //     arr = [
    //     {
    //         "senderDevice": "4e760765-adbb-4277-b616-5502cfeee2a4",
    //         "receiverDevice": "56d2518f-3638-430a-b87b-c7bd8b8a875d",
    //         "ciphertext": "mCVsXtpd0GBMEjqqLVzfBZj+hn1x",
    //         "nonce": "gp7dYb8TUXMzpPR7DEm0poz1IJPsJK4s"
    //     }];
    await prisma.message.createMany({
      data: arr.map((item) => ({
        senderDeviceId: item.senderDevice,
        receiverDeviceId: item.receiverDevice,
        ciphertext: item.ciphertext,
        nonce: item.nonce,
      })),
    });

    const receiverSocketID = getReceiverSocketID(receiverID);
    if (receiverSocketID) {
      io.to(receiverSocketID).emit("message", arr);
    }

    res.status(201).json({ message: "Message sent successfully" });
  } catch (error) {
    console.log("Error in sendMessage controller: ", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAiResponse = async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res
      .status(500)
      .json({ message: "GEMINI_API_KEY not found in environment variables" });
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-exp",
  });
  const generationConfig = {
    temperature: 0.75,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
  };

  try {
    const { userInput } = req.body;
    if (!userInput) {
      return res
        .status(400)
        .json({ message: "Prompt is required in the request body", userInput });
    }
    const prompt = `Provide three different variations of the following message while keeping the meaning the same. Only return the variations, without any explanations or additional text:\n"${userInput}"`;
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig,
    });
    const response = await result.response;
    const text = response.text();
    res.status(200).json({ message: text });
  } catch (err) {
    console.error("Error in getAiResponse controller: ", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.body;
    const message = await prisma.message.findUnique({ where: { id: id } });

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }
    if (message.image) {
      const public_id = message.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`profile_pictures/${public_id}`);
    }
    if (message.audio) {
      const public_id = message.audio.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`chat-audio/${public_id}`);
    }
    await prisma.message.delete({ where: { id: id } });
    const receiverSocketID = getReceiverSocketID(message.receiverID);
    if (receiverSocketID) {
      io.to(receiverSocketID).emit("messageDeleted", { id });
    }
    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    console.log("Error in deleteMessage controller: ", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
