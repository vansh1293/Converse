import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.mjs";
export const protect = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: Token not found" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
  
    //const user = await User.findById(decoded.id).select('-password');
    const user = await prisma.user.findUnique({
      where: {
        id: decoded.id,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        profileImage: true,
      },
    });
    if (!user) {
      return res.status(404).json({ message: "Unauthorized: User not found" });
    }
    req.user = user;

    next();
  } catch (error) {
    console.log("Error in protect middleware: ", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
