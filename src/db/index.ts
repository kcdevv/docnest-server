import mongoose from "mongoose";
import { config } from "dotenv";

const connectDB = async () => {
  try {
    const dbUrl = process.env.MONGO_URI ?? "mongodb://localhost:27017/files";

    await mongoose.connect(dbUrl);
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error(err);
  }
};

export default connectDB;
