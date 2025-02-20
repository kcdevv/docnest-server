import { Schema, model } from "mongoose";

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    required: false,
  },
  isPremium: {
    type: Boolean,
    default: false,
  },
  files: [
    {
      type: Schema.Types.ObjectId,
      ref: "File",
      default: [],
    },
  ],
});

export const userModel = model("User", UserSchema);