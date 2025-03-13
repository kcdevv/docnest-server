import { Request, Response } from "express";
import { userModel } from "../models/user.model";
import razorpay from "../razorpay";
import crypto from "crypto";
import { clerkClient } from "@clerk/express";
import { Webhook } from "svix";

const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET as string;

export const userCreated = async (req: Request, res: Response) => {
  try {
    const webhookId = req.headers["webhook-id"] as string;
    const webhookTimestamp = req.headers["webhook-timestamp"] as string;
    const webhookSignature = req.headers["webhook-signature"] as string;

    if (!webhookId || !webhookTimestamp || !webhookSignature) {
      throw new Error("Missing webhook headers");
    }

    const webhookHeaders = {
      "webhook-id": webhookId,
      "webhook-timestamp": webhookTimestamp,
      "webhook-signature": webhookSignature,
    };

    const payload = JSON.stringify(req.body);
    const wh = new Webhook(CLERK_WEBHOOK_SECRET);
    const evt = wh.verify(payload, webhookHeaders) as any;

    if (evt.type === "user.created") {
      await userModel.create({
        clerkId: evt.data.id,
        email: evt.data.email,
        firstName: evt.data.firstName,
        lastName: evt.data.lastName,
        isPremium: false,
      });
    }

    if (evt.type === "user.deleted") {
      await userModel.findOneAndDelete({
        clerkId: evt.data.id,
      });
    }

    res.status(200).json({ message: "User created in database" });
    return;
  } catch (err) {
    console.error("Webhook verification failed:", err);
    res.status(400).send("Invalid webhook signature");
    return;
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
