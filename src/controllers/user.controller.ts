import { Request, Response } from "express";
import { userModel } from "../models/user.model";
import { hashSync, compareSync } from "bcryptjs";
import { generateToken } from "../utils/generateToken";
import razorpay from "../razorpay";
import crypto from "crypto";

export const signupUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password, fullName } = req.body;
  if (!email || !password || !fullName) {
    res.status(400).json({ message: "All fields are required" });
    return;
  }
  const hashPassword = hashSync(password, 10);
  const user = await userModel.create({ email, password: hashPassword, fullName });

  const token = generateToken(user._id.toString());
  res.header("Authorization", token);
  res.cookie("token", token);
  res.status(201).json({ token });
  return;
};
export const signinUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ message: "All fields are required" });
    return;
  }
  const user = await userModel.findOne({ email });
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  if (!compareSync(password, user.password)) {
    res.status(400).json({ message: "Invalid credentials" });
    return;
  }
  const token = generateToken(user._id.toString());
  res.header("Authorization", token);
  res.cookie("token", token);
  res.status(200).json({ token });
  return;
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  const { fullName, avatar, password } = req.body;
  const userId = req.userId;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const user = await userModel.findById(userId);
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  if (fullName) user.fullName = fullName;
  if (avatar) user.avatar = avatar;
  if (password) user.password = hashSync(password, 10);

  await user.save();
  res.status(200).json({ message: "Profile updated successfully" });
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const user = await userModel.findById(userId).select("-password").populate("files");

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const logoutUser = async (req: Request, res: Response) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out successfully" });
  return;
}

export const pay = async (req: Request, res: Response) => {
  try {
    const { amount, currency } = req.body;

    const options = {
      amount: amount * 100,
      currency: currency || "INR",
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1,
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const verifyPayment = async (req: Request, res: Response) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET ?? "")
    .update(body)
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
    await userModel.findByIdAndUpdate(req.userId, { isPremium: true });
    res.json({ success: true, message: "Payment verified successfully" });
  } else {
    res.status(400).json({ success: false, message: "Invalid signature" });
  }
};