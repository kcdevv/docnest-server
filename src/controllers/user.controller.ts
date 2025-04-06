import { Request, Response } from "express";
import { userModel } from "../models/user.model";
import razorpay from "../razorpay";
import crypto from "crypto";
import { clerkClient } from "@clerk/express";

export const userCreated = async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    console.log(payload.data);

    // Handle user.created event
    if (payload.type === "user.created") {
      // Fallback to empty strings if name fields are missing
      const userData = {
        clerkId: payload.data.id,
        email: payload.data.email_addresses[0]?.email_address,
        firstName: payload.data.first_name,
        lastName: payload.data?.last_name,
        avatar: payload.data?.image_url,
        isPremium: false,
      };

      await userModel.create(userData);
      console.log("User created in database:", userData.email);
    }

    if (payload.type === "user.deleted") {
      const { id } = payload.data;
      await userModel.findOneAndDelete({ clerkId: id });
      console.log("User deleted from database:", id);
    }

    res.status(200).json({ message: "Webhook event processed successfully" });
  } catch (err) {
    console.error("Webhook verification failed or error in processing:", err);
    res.status(400).send("Invalid webhook signature or processing error");
  }
};

export const updateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { firstName, lastName } = req.body;
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const user = await clerkClient.users.getUser(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const updatePayload: Record<string, any> = {};
    if (firstName) updatePayload.firstName = firstName;
    if (lastName) updatePayload.lastName = lastName;

    if (Object.keys(updatePayload).length === 0) {
      res.status(400).json({ message: "No valid fields to update" });
      return;
    }

    await clerkClient.users.updateUser(userId, updatePayload);

    res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
};

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
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

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
