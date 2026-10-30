import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  let decoded;
  try {
    decoded = jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ message: "Not authorized, invalid token" });
  }

  const user = await User.findById(decoded.id).select("+tokenVersion");
  if (!user || user.tokenVersion !== decoded.tokenVersion) {
    return res.status(401).json({ message: "Not authorized, token expired" });
  }

  req.user = user;
  next();
};
