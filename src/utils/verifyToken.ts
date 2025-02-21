import { verify } from "jsonwebtoken";
import dotenv from "dotenv";
import getSecret from "./getSecret";
dotenv.config();

export const verifyToken = (token: string) => {
  try {
    const secret = getSecret();
    const decoded = verify(token, secret);
    return decoded;
  } catch (error) {
    return error;
  }
};