import crypto from "crypto";

export const generateFileName = (extension = "") =>
  `${crypto.randomBytes(16).toString("hex")}${extension}`;