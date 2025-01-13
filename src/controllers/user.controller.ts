import User from "../models/user.model";
import { Request, Response } from "express";
import { sign } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import getSecret from "../utils/getSecret";

const generateToken = (userId: string) => {
  const secret = getSecret();
  const token = sign({ userId }, secret, { expiresIn: "1h" });
  return token;
};

const signUpUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, fullName, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      userId,
      fullName,
      email,
      password: hashedPassword,
    });

    const token = generateToken(user.userId);
    res.cookie("token", token);
    res.status(201).json({ message: "Signedup successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error creating user", error });
  }
};

const signInUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, password } = req.body;
    const user = await User.findOne({ userId });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const token = generateToken(user.userId);
    res.cookie("token", token);
    res.status(200).json({ message: "Signed in successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullName, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.findOneAndUpdate(
      // @ts-ignore
      { userId: req.userId },
      { fullName, email, password: hashedPassword }
    );

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating user", error });
  }
};

const userProfile = (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const user = await User.findById(req.userId).populate("uploadedFiles");
    if (!user) {
      res.status(411).json({
        message: "Something went wrong",
      });
    }
    res.status(200).json({
      user,
    });
  } catch (err) {
    res.status(411).json({
      message: "Something went wrong",
    });
  }
};

const getUserFiles = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const user = await User.findOne({ userId }).populate("uploadedFiles");
  res.status(200).json({ user });
};

export { signUpUser, signInUser, updateUser, userProfile, getUserFiles };
