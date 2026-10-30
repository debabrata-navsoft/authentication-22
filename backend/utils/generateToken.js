import jwt from "jsonwebtoken";

export const generateToken = (user) =>
  jwt.sign({ id: user._id, tokenVersion: user.tokenVersion }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });
