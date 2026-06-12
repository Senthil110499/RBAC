import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/token";

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// ✅ Utility functions for validation
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isStrongPassword = (password: string): boolean => {
  // At least 8 chars, one uppercase, one lowercase, one number, one special char
  const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return strongPasswordRegex.test(password);
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
    if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.password) {
      return res.status(400).json({ message: "User has no password set" });
    }

    const Match = await bcrypt.compare(password, user.password);
    if (!Match) return res.status(400).json({ message: "Invalid password" });

  const token = generateToken(user);
  res.json({ token, role: user.role, name: user.name });
} catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
  

//CHANGE PASSWORD
export const changePassword = async (req: Request, res: Response) => {
  try {
    const { email, oldPassword, newPassword } = req.body;

    if (!email || !oldPassword || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 1. Find user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user?.password) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    // 3. Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 4. Update password in DB
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    return res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

