import { Schema, model } from "mongoose";

const UserSchema = new Schema({
  clerkId: String,
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