import mongoose from "mongoose";
import { config } from "dotenv";

const connectDB = async () => {
  try {
    const dbUrl = process.env.MONGO_URI ?? "";
    await mongoose.connect(dbUrl);
    const db = mongoose.connection;
    db.on("connection", () => {
      console.log("Connected to database");
    });
    db.on("error", () => {
      throw new Error("Failed connecting database");
    });
  } catch (err) {
    console.error(err);
  }
};

export default connectDB