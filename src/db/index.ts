import mongoose from "mongoose";
import { config } from "dotenv";

const connectDB = async () => {
  try {
    const dbUrl = process.env.MONGO_URI ?? "mongodb://localhost:27017/files";

    await mongoose.connect(dbUrl);
    const db = mongoose.connection;
    db.on("open", () => {
      console.log("Connected to database");
    });
    db.on("error", () => {
      throw new Error("Failed connecting database");
    });
  } catch (err) {
    console.error(err);
  }
};

export default connectDB;
