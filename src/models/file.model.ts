import mongoose, { Mongoose, Schema, model } from "mongoose";
import User from "./user.model";

const fileSchema = new Schema({
  fileId: {
    type: String,
    required: true,
    unique: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  fileType: {
    type: String,
    enum: ["image", "video", "pdf", "document", "audio"],
    required: true,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  uploadDate: {
    type: Date,
    default: Date.now,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: User,
  },
  fileSize: {
    type: Number,
    required: true,
  },
});

const File = model("File", fileSchema);
export default File;
