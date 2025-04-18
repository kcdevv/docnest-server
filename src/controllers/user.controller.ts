import { Request, Response } from "express";
import { userModel } from "../models/user.model";
import razorpay from "../razorpay";
import crypto from "crypto";
import { clerkClient } from "@clerk/express";

export const userCreated = async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    console.log(payload.data);

    if (payload.type === "user.created") {
      const userData = {
        clerkId: payload.data.id,
        email: payload.data.email_addresses[0]?.email_address,
        firstName: payload.data.first_name || "",
        lastName: payload.data.last_name || "",
        avatar: payload.data.image_url || "",
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
    console.error("Webhook error:", err);
    res.status(400).send("Invalid webhook signature or processing error");
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { firstName, lastName } = req.body;
    const clerkId = req.userId;

    if (!clerkId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const updatePayload: Record<string, any> = {};
    if (firstName) updatePayload.firstName = firstName;
    if (lastName) updatePayload.lastName = lastName;

    if (Object.keys(updatePayload).length === 0) {
      res.status(400).json({ message: "No valid fields to update" });
      return;
    }

    // Update Clerk user
    await clerkClient.users.updateUser(clerkId, updatePayload);

    // Update local DB user
    await userModel.findOneAndUpdate({ clerkId }, updatePayload, { new: true });

    res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
};

export const pay = async (req: Request, res: Response) => {
  try {
    const { amount, currency } = req.body;

    if (!amount || amount <= 0) {
      res.status(400).json({ message: "Invalid amount" });
      return;
    }

    const options = {
      amount: amount * 100,
      currency: currency || "INR",
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1,
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error("Payment Error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const clerkId = req.userId;

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET ?? "")
      .update(body)
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      await userModel.findOneAndUpdate({ clerkId }, { isPremium: true });
      res.json({ success: true, message: "Payment verified successfully" });
    } else {
      res.status(400).json({ success: false, message: "Invalid signature" });
    }
  } catch (error) {
    console.error("Verify Payment Error:", error);
    res.status(500).json({ message: "Server error while verifying payment" });
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const clerkId = req.userId;
    const user = await userModel.findOne({ clerkId });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Get User Error:", error);
    res.status(500).json({ message: "Failed to retrieve user" });
  }
};
