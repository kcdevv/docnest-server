import { Schema, model } from "mongoose";

const UserSchema = new Schema({
  clerkId: String,
  isPremium: {
    type: Boolean,
    default: false,
  },
  email: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    required: false,
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
