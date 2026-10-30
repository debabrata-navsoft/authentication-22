import crypto from "crypto";
import { User } from "../models/user.model.js";
import { generateToken } from "../utils/generateToken.js";
import { sendEmail } from "../utils/sendEmail.js";

// POST /api/auth/signup
export const signup = async (req, res) => {
  const { name, email, phone, password, confirmPassword } = req.body;

  if (!name || !email || !phone || !password || !confirmPassword) {
    return res
      .status(400)
      .json({ message: "Name, email, phone, password and confirm password are required" });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  if (await User.exists({ email: email.toLowerCase() })) {
    return res.status(409).json({ message: "Email is already registered" });
  }
  if (await User.exists({ phone: phone.trim() })) {
    return res.status(409).json({ message: "Phone number is already registered" });
  }

  const user = await User.create({ name, email, phone, password });

  res.status(201).json({
    message: "Signup successful",
    token: generateToken(user),
    user,
  });
};

// POST /api/auth/login
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  res.json({
    message: "Login successful",
    token: generateToken(user),
    user,
  });
};

// POST /api/auth/logout (protected)
export const logout = async (req, res) => {
  // Invalidate every token issued to this user so far
  await User.updateOne({ _id: req.user._id }, { $inc: { tokenVersion: 1 } });
  res.json({ message: "Logged out successfully" });
};

// GET /api/auth/me (protected)
export const getMe = async (req, res) => {
  res.json({ user: req.user });
};

// POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  // Same response whether or not the email exists, to avoid leaking registered accounts
  const genericResponse = {
    message: "If an account with that email exists, a password reset link has been sent",
  };

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return res.json(genericResponse);

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  try {
    await sendEmail({
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <p>Hi ${user.name},</p>
        <p>You requested a password reset. Click the link below to set a new password:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>This link expires in 15 minutes. If you did not request this, please ignore this email.</p>
      `,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save({ validateBeforeSave: false });
    console.error(`Error sending reset email: ${error.message}`);
    return res.status(500).json({ message: "Could not send reset email, please try again later" });
  }

  res.json(genericResponse);
};

// POST /api/auth/reset-password/:token
export const resetPassword = async (req, res) => {
  const { password, confirmPassword } = req.body;

  if (!password || !confirmPassword) {
    return res.status(400).json({ message: "Password and confirm password are required" });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });
  if (!user) {
    return res.status(400).json({ message: "Reset token is invalid or has expired" });
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  user.tokenVersion += 1; // log out all existing sessions
  await user.save();

  res.json({ message: "Password reset successful, please log in with your new password" });
};
