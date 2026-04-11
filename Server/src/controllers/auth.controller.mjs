//import User from '../models/user.models.mjs';
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.mjs";
import cloudinary from "../lib/cloudinary.mjs";
import { sendOTPEmail } from "../lib/email.mjs";
import prisma from "../lib/prisma.mjs";

const validateEmail = (email) => {
  const re =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return re.test(String(email).toLowerCase());
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const signup = async (req, res) => {
  const { email, fullName, password } = req.body;

  try {
    if (!email || !fullName || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        message: "Email format is invalid",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user && user.isEmailVerified) {
      return res.status(400).json({
        message: "Email already exist, please login",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    // User exists but email not verified
    if (user && !user.isEmailVerified) {
      await prisma.user.update({
        where: { email },
        data: {
          password: hashedPassword,
          emailOTP: otp,
          emailOTPExpires: otpExpires,
        },
      });

      await sendOTPEmail(email, otp);
      await console.log("OTP for email verification:", otp); // For testing purposes, log the OTP to the console

      return res.status(201).json({
        message: "OTP sent to your email.",
      });
    }

    // Create new user
    await prisma.user.create({
      data: {
        email,
        fullName,
        password: hashedPassword,
        emailOTP: otp,
        emailOTPExpires: otpExpires,
      },
    });

    await sendOTPEmail(email, otp);

    return res.status(201).json({
      message: "Signup successful. OTP sent to your email.",
    });
  } catch (error) {
    console.log("Error in signup controller:", error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: "Email already verified." });
    }

    if (
      !user.emailOTP ||
      user.emailOTP !== otp ||
      user.emailOTPExpires < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user = await prisma.user.update({
      where: { email },
      data: {
        isEmailVerified: true,
        emailOTP: null,
        emailOTPExpires: null,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        profileImage: true,
        about: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    generateToken(user.id, res);
    res.status(200).json(user);
  } catch (error) {
    console.error("Error in verifyOTP:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Email format is invalid" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      return res
        .status(400)
        .json({ message: "User not found, Invalid credentials" });
    }
    if (!user.isEmailVerified) {
      return res
        .status(400)
        .json({ message: "Email not verified. Please verify using OTP." });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    generateToken(user.id, res);
    const { password: _pw, ...userWithoutPassword } = user;
    res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.log("Error in login controller: ", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.log("Error in logout controller: ", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const updateProfile = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    console.log("Uploaded file:", req.file);
    const { fullName, about } = req.body;
    const userId = req.user.id;
    if (!req.file && !fullName && !about) {
      return res.status(400).json({ message: "No fields to update" });
    }
    let profileImageUrl;
    if (req.file) {
      const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
      const result = await cloudinary.uploader.upload(base64Image, {
        folder: "profile_pictures",
      });
      profileImageUrl = result.secure_url;
    }
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(profileImageUrl && { profileImage: profileImageUrl }),
        ...(fullName && { fullName }),
        ...(about && { about }),
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        profileImage: true,
        about: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error in updateProfile controller:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller: ", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const storePublicKey = async (req, res) => {
  try {
    const { publicKey, device } = req.body;
    console.log("Received public key:", publicKey, "for device:", device);
    const userId = req.user.id;
    if (!publicKey || !device || !userId) {
      return res
        .status(400)
        .json({ message: "Public key, device, and user ID are required" });
    }
    const result = await prisma.device.create({
      data: {
        userId,
        publicKey,
        device,
      },
    });
    res
      .status(200)
      .json({ deviceID: result.id, message: "Public key stored successfully" });
  } catch (error) {
    console.log("Error in storePublicKey controller: ", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const getPublicKey = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    const devices = await prisma.device.findMany({
      where: { userId },
    });
    res.status(200).json({ devices });
  } catch (error) {
    console.log("Error in getPublicKey controller: ", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
